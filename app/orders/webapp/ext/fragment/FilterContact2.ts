import ExtensionAPI from 'sap/fe/templates/ListReport/ExtensionAPI';
import { MultiComboBox$SelectionFinishEvent } from 'sap/m/MultiComboBox';
import Filter from 'sap/ui/model/Filter';
import FilterOperator from 'sap/ui/model/FilterOperator';

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

    // const filters = values.map(val =>
    //     new Filter({ path: "contact2/firstName", operator: FilterOperator.EQ, value1: val })
    // );

    const filters = values.flatMap(val => [
        new Filter({ path: "contact2/firstName", operator: FilterOperator.EQ, value1: val }),
        new Filter({ path: "contact2/lastName", operator: FilterOperator.EQ, value1: 'Yamada' })
    ]);

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
    //         return new Filter({ path: "contact2_ID", operator: FilterOperator.LT, value1: 100 });
    //     case "1":
    //         return new Filter({
    //             filters: [
    //                 new Filter({ path: "contact2_ID", operator: FilterOperator.GT, value1: 100 }),
    //                 new Filter({ path: "contact2_ID", operator: FilterOperator.LT, value1: 500 })
    //             ],
    //             and: true
    //         });
    //     case "2":
    //         return new Filter({ path: "contact2_ID", operator: FilterOperator.GT, value1: 500 });
    // }
}

export function onSelectionFinish(this: ExtensionAPI, oEvent: MultiComboBox$SelectionFinishEvent) {
    const selectedItems = oEvent.getParameter("selectedItems");
    if (selectedItems) {
        selectedItems.forEach((item) => {
            const key = item.getKey();
            let contact2 = key as any;
            this.setFilterValues("contact2/firstName", contact2);
        });
    }
}