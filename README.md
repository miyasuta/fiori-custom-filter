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

## 関連ドキュメント

- [Adding Custom Fields to the Filter Bar](https://ui5.sap.com/#/topic/5fb9f57fcf12401bbe39a635e9a32a4e) - カスタムフィルターフィールドの追加方法。`sap.fe.macros.filter.type.Value`の使用例と`formatOptions.operator`によるカスタムフィルター演算子の定義方法が記載されている
- [Custom Filters - Flexible Programming Model Explorer](https://ui5.sap.com/test-resources/sap/fe/core/fpmExplorer/index.html#/buildingBlocks/filterBar/filterBarCustoms) - カスタムフィルターのライブサンプル
- [ExtensionAPI.setFilterValues](https://ui5.sap.com/#/api/sap.fe.templates.ListReport.ExtensionAPI/methods/setFilterValues) - setFilterValues APIリファレンス
- [sap.ui.model.FilterOperator](https://ui5.sap.com/#/api/sap.ui.model.FilterOperator) - フィルター演算子のAPIリファレンス
