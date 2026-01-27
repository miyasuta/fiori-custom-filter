import Filter from 'sap/ui/model/Filter';
import FilterOperator from 'sap/ui/model/FilterOperator';
import type Event from 'sap/ui/base/Event';
import MultiComboBox from 'sap/m/MultiComboBox';
import ExtensionAPI from 'sap/fe/templates/ListReport/ExtensionAPI';

/**
 * Custom filter
 * @param sValue selected filter item
 * @returns new Filter
 */
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

    // switch (value) {
    //     case "0":
    //         return new Filter({ path: "customer", operator: FilterOperator.LT, value1: 100 });
    //     case "1":
    //         return new Filter({
    //             filters: [
    //                 new Filter({ path: "customer", operator: FilterOperator.GT, value1: 100 }),
    //                 new Filter({ path: "customer", operator: FilterOperator.LT, value1: 500 })
    //             ],
    //             and: true
    //         });
    //     case "2":
    //         return new Filter({ path: "customer", operator: FilterOperator.GT, value1: 500 });
    // }
}

// export function onSupplierMultiChanged(this: ExtensionAPI, oEvent: Event) {
//     const multiComboBox = oEvent.getSource() as MultiComboBox;
//     const selectedKeys = multiComboBox.getSelectedKeys();

//     console.log("Selected supplier keys:", selectedKeys);
//     selectedKeys.forEach((key) => {
//         let supplier = parseInt(key, 10) as any;
//         this.setFilterValues("supplier", supplier);
//     });
// }