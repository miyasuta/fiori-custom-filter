## 目的
- List Reportのフィルターバーの拡張項目にComboBoxを表示する
- ComboBoxにデフォルトモデルと異なるODataサービスをバインドする
- 行が選択されたら、イベントハンドラでFilterにセットするとともに、別のフィルタ項目に値を設定する

## 当初の実装
ComboBoxの`selectedKey`に`sap.fe.macros.filter.type.Value`を使用し、`formatOptions.operator`にカスタム関数のパスを指定してフィルター条件を生成する方式。

```xml
<!-- FilterCustomer.fragment.xml -->
<ComboBox
    id="customer"
    core:require="{handler: 'ns/orders/ext/fragment/FilterCustomer'}"
    selectedKey="{path: 'filterValues>',
        type: 'sap.fe.macros.filter.type.Value',
        formatOptions: { operator: 'ns.orders.ext.fragment.FilterCustomer.filterItems' }}"
>
    <items>
        <core:Item key="0" text="Item1"/>
        <core:Item key="1" text="Item2"/>
        <core:Item key="2" text="Item3"/>
    </items>
</ComboBox>
```

```typescript
// FilterCustomer.ts
import Filter from 'sap/ui/model/Filter';
import FilterOperator from 'sap/ui/model/FilterOperator';

export function filterItems(value: string) {
    switch (value) {
        case "0":
            return new Filter({ path: "customer", operator: FilterOperator.LT, value1: 100 });
        case "1":
            return new Filter({
                filters: [
                    new Filter({ path: "customer", operator: FilterOperator.GT, value1: 100 }),
                    new Filter({ path: "customer", operator: FilterOperator.LT, value1: 500 })
                ],
                and: true
            });
        case "2":
            return new Filter({ path: "customer", operator: FilterOperator.GT, value1: 500 });
    }
}
```

この方式では、ComboBoxの選択値に応じて柔軟なフィルター条件（LT, GT, 複合条件など）を生成できる。

### 問題点
`formatOptions.operator`に指定する関数は静的なエクスポート関数である必要があり、関数内でExtensionAPIにアクセスできない。そのため、`setFilterValues()`を使って他のフィルタ項目に値を設定することができない。

## 対応方法
`formatOptions.operator`を使用せず、`selectionChange`イベントハンドラを使用する方式に変更。ハンドラ内の`this`はExtensionAPIコンテキストにバインドされているため、`setFilterValues()`を呼び出すことができる。

### 変更点

1. **`formatOptions.operator`の削除** - カスタムフィルター関数の指定をやめる
2. **`selectionChange`イベントの追加** - 選択変更時にハンドラを呼び出す
3. **`sap.fe.macros.filter.type.Value`は維持** - フィルターバーとの値同期のために必要

```xml
<!-- FilterCustomer.fragment.xml -->
<ComboBox
    id="customer"
    core:require="{handler: 'ns/orders/ext/fragment/FilterCustomer'}"
    selectedKey="{path: 'filterValues>', type: 'sap.fe.macros.filter.type.Value'}"
    selectionChange="handler.onCustomerChanged"
    items="{path: 'customerService>/Customers'}"
>
    <items>
        <core:Item key="{customerService>ID}" text="{customerService>name}"/>
    </items>
</ComboBox>
```

### sap.fe.macros.filter.type.Valueの役割

`sap.fe.macros.filter.type.Value`はFiori Elementsのフィルターバーとカスタムコントロールの間で値を同期するためのTypeである。このTypeを維持することで：

- **バリアント管理**: フィルター値がバリアントに保存・復元される
- **URL状態管理**: フィルター値がURLパラメータに反映される
- **クリアボタン対応**: フィルターバーの「クリア」ボタンでComboBoxの値もクリアされる

`formatOptions.operator`を削除しても、Typeは引き続きデフォルトの`EQ`演算子でフィルター条件を生成する。

### なぜcustomerフィールドへのフィルター設定が不要なのか

現在の実装では、`onCustomerChanged`ハンドラ内で`customer`フィールドに対するフィルターを明示的に設定していない。しかしフィルターは正しく機能する。

これは以下の2つの仕組みが連携しているためである：

1. **`sap.fe.macros.filter.type.Value`による自動フィルター生成**
   - ComboBoxの選択値が`filterValues`モデルに書き込まれる
   - Typeがデフォルトの`EQ`演算子でフィルター条件を自動生成する

2. **manifest.jsonの`property`設定**
   ```json
   "customer": {
       "label": "Customer",
       "property": "customer",  // ← この設定でcustomerフィールドにフィルターが適用される
       "template": "ns.orders.ext.fragment.FilterCustomer"
   }
   ```

つまり：
- **`sap.fe.macros.filter.type.Value`** + **manifest.jsonの`property`設定** → `customer`フィールドへの自動フィルター
- **`selectionChange`ハンドラの`setFilterValues`** → `orderType_ID`フィールドへの追加フィルター

```typescript
// FilterCustomer.ts
import type Event from 'sap/ui/base/Event';
import type ComboBox from 'sap/m/ComboBox';
import ExtensionAPI from 'sap/fe/templates/ListReport/ExtensionAPI';

export function onCustomerChanged(this: ExtensionAPI, oEvent: Event) {
    const oComboBox = oEvent.getSource() as ComboBox;
    const sSelectedKey = oComboBox.getSelectedItem()?.getKey();

    if (sSelectedKey) {
        // ExtensionAPIのsetFilterValuesで他のフィルタに値を設定
        // ODataのInt32型に合わせて数値に変換
        const nValue = parseInt(sSelectedKey, 10);
        (this as any).setFilterValues("orderType_ID", nValue);
    } else {
        (this as any).setFilterValues("orderType_ID");
    }
}
```

### トレードオフ
| 観点 | formatOptions.operator方式 | selectionChange方式 |
|------|---------------------------|---------------------|
| フィルター演算子のカスタマイズ | 可能（LT, GT, 複合条件など） | 不可（デフォルトのEQのみ） |
| ExtensionAPIへのアクセス | 不可 | 可能 |
| 他フィルタ項目への値設定 | 不可 | 可能 |

### 注意点
`setFilterValues()`に渡す値は、ODataのデータ型に合わせて変換する必要がある。例えば、`Edm.Int32`型のフィールドには文字列ではなく数値を渡す必要がある。文字列を渡すと以下のようなエラーが発生する：

```
FormatException in property 'text' of 'Element sap.m.Token#...':
Illegal sap.ui.model.odata.type.Int32 value: 1
```

## MultiComboBoxでの複数選択フィルター

MultiComboBoxを使用して複数の値を選択し、OR条件でフィルタリングする場合は、`formatOptions.operator`方式を使用する。

### 実装方法

1. **フラグメントで`sap.fe.macros.filter.type.MultiValue`を使用**

```xml
<!-- SupplierMulti.fragment.xml -->
<MultiComboBox
    id="idCustomersMultiComboBox"
    core:require="{handler: 'ns/orders/ext/fragment/SupplierMulti'}"
    selectedKeys="{path: 'filterValues>',
        type: 'sap.fe.macros.filter.type.MultiValue',
        formatOptions: {operator: 'ns.orders.ext.fragment.SupplierMulti.filterItems'}}"
    items="{path: 'customerService>/Customers'}"
>
    <items>
        <core:Item key="{customerService>ID}" text="{customerService>name}"/>
    </items>
</MultiComboBox>
```

2. **カスタムオペレーター関数を実装**

```typescript
// SupplierMulti.ts
import Filter from 'sap/ui/model/Filter';
import FilterOperator from 'sap/ui/model/FilterOperator';

export function filterItems(value: string) {
    if (!value) {
        return undefined;
    }

    // カンマ区切りの値を配列に分割
    const values = value.split(",");

    const filters = values.map(val =>
        new Filter({ path: "customer", operator: FilterOperator.EQ, value1: val })
    );

    // 単一の値の場合はフィルターをそのまま返す
    if (filters.length === 1) {
        return filters[0];
    }

    return new Filter({
        filters: filters,
        and: false  // OR条件
    });
}
```

3. **manifest.jsonにカスタムオペレーターを登録（必須）**

```json
{
  "sap.fe": {
    "macros": {
      "filter": {
        "customFilterOperators": [
          {
            "name": "ns.orders.ext.fragment.SupplierMulti.filterItems"
          }
        ]
      }
    }
  }
}
```

### 注意点

- **manifest.jsonへの登録は必須**: カスタムオペレーターを登録しないと、チェックはできるがフィルター条件が効かない
- **`sap.fe.macros.filter.type.MultiValue`の使用は必須**: `Value`ではなく`MultiValue`を使用しないと、2回目以降の選択で値がクリアされる
- **パラメータは配列ではなくstring**: 公式ドキュメントのMultiValueの例では配列を受け取るように記載されているが、実際にはカンマ区切りのstringが渡される（例: `"1,2,3"`）
- **ExtensionAPIへのアクセス不可**: `formatOptions.operator`方式では、関数内で`this`を使ってExtensionAPIにアクセスできない

### ComboBox（単一選択）との違い

| 観点 | ComboBox | MultiComboBox |
|------|----------|---------------|
| Type | `sap.fe.macros.filter.type.Value` | `sap.fe.macros.filter.type.MultiValue` |
| バインディングプロパティ | `selectedKey` | `selectedKeys` |
| カスタムオペレーターへの入力 | 単一の値（string） | カンマ区切りの値（string） |
| フィルター条件 | 単一条件 | 複数条件をORで結合 |

## カスタムフィルタの3つのアプローチと使い分け

公式ドキュメント「Adding Custom Fields to the Filter Bar」では、OData V4のカスタムフィルタに以下の3つのアプローチが示されている。これらは排他的ではないが、組み合わせには制約がある。

### アプローチ一覧

| # | アプローチ | フィルタ値の同期 | フィルタ条件の構築 |
|---|-----------|----------------|------------------|
| 1 | `filterValues>` バインディングのみ | 自動（バインディング） | フレームワーク自動（EQ） |
| 2 | `formatOptions.operator` | 自動（バインディング） | オペレータ関数が Filter を直接返す |
| 3 | イベントハンドラ + `setFilterValues` | 命令的（API呼び出し） | フレームワーク自動（EQ） |

### 各アプローチの詳細

**1. `filterValues>` バインディングのみ（最もシンプル）**

```xml
<RatingIndicator value="{path: 'filterValues>', type: 'Value'}" />
```

- コントロールの値プロパティを `filterValues>` にバインドするだけ
- manifest.json の `property` に対してデフォルトの EQ フィルタが自動生成される
- バリアント管理・アプリ状態の保持も自動

**2. `formatOptions.operator`（カスタム条件が必要な場合）**

```xml
<ComboBox selectedKey="{path: 'filterValues>', type: 'Value',
    formatOptions: { operator: 'App.ext.CustomFilter.myOperator' }}" />
```

- オペレータ関数が `Filter` オブジェクトを**直接返す**
- フレームワークの型解決を**バイパス**するため、任意の `path` や `FilterOperator` を指定可能
- manifest.json の `sap.fe.macros.filter.customFilterOperators` への登録が必須
- 関数内で `this`（ExtensionAPI）にアクセス不可

**3. イベントハンドラ + `setFilterValues`（命令的な値操作が必要な場合）**

```xml
<RatingIndicator value="..." change="handler.onValueChanged" />
```
```js
onValueChanged: function(oEvent) {
    this.setFilterValues("Rating", oEvent.getParameter("value"));
}
```

- `filterValues>` バインディングが使えない場合の**代替手段**
- フレームワークの**標準フィルタ処理パイプライン**を通るため、`property` の型解決が行われる
- `this`（ExtensionAPI）にアクセス可能

### 重要な制約：`formatOptions.operator` と `setFilterValues` は併用しない

`formatOptions.operator` を使う場合、フィルタ値は `filterValues>` バインディングを通じて自動的にオペレータ関数に渡される。`setFilterValues` で外から値を書き換える必要はなく、そもそも両者はフィルタ値の同期方法が異なる**別々のパターン**である。

### managed association の外部キーに対する制約

`setFilterValues` にmanaged associationの外部キー（例: `contact2_ID`）を渡すと、フレームワークが ReferentialConstraint を辿ってナビゲーションプロパティのエンティティ型を解決しようとし、「Unsupported type: OrderService.Contacts」エラーが発生する。

一方、`formatOptions.operator` では `Filter` オブジェクトを直接構築するため、この型解決の問題を完全に回避できる。

### 選択指針

```
カスタムフィルタ条件が必要？
├── YES → formatOptions.operator を使用（方法2）
│         ※ ExtensionAPIへのアクセスは不可
└── NO
    ├── 他のフィルタ項目への値設定が必要？
    │   ├── YES → selectionChange + setFilterValues を使用（方法3）
    │   │         ※ property は直接プリミティブプロパティのみ（外部キー不可）
    │   └── NO → filterValues> バインディングのみ（方法1、推奨）
    └── filterValues> バインディングが使えない？
        └── YES → setFilterValues を使用（方法3）
```

## 関連ドキュメント

- [Adding Custom Fields to the Filter Bar](https://ui5.sap.com/#/topic/5fb9f57fcf12401bbe39a635e9a32a4e) - カスタムフィルターフィールドの追加方法。`sap.fe.macros.filter.type.Value`の使用例と`formatOptions.operator`によるカスタムフィルター演算子の定義方法が記載されている
- [Custom Filters - Flexible Programming Model Explorer](https://ui5.sap.com/test-resources/sap/fe/core/fpmExplorer/index.html#/buildingBlocks/filterBar/filterBarCustoms) - カスタムフィルターのライブサンプル
- [ExtensionAPI.setFilterValues](https://ui5.sap.com/#/api/sap.fe.templates.ListReport.ExtensionAPI/methods/setFilterValues) - setFilterValues APIリファレンス
- [sap.ui.model.FilterOperator](https://ui5.sap.com/#/api/sap.ui.model.FilterOperator) - フィルター演算子のAPIリファレンス
