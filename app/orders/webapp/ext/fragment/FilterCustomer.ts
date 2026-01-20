import Filter from 'sap/ui/model/Filter';
import FilterOperator from 'sap/ui/model/FilterOperator';

/**
 * Custom filter
 * @param sValue selected filter item
 * @returns new Filter
 */
export function filterItems(value: string) {


    return new Filter({ path: "customer", operator: FilterOperator.EQ, value1: value });
    // switch (value) {
    //     case "0":
    //         return new Filter({ path: "customer", operator: FilterOperator.LT, value1: 2 });
    //     case "1":
    //         return new Filter({
    //             filters: [
    //                 new Filter({ path: "customer", operator: FilterOperator.GT, value1: 1 }),
    //                 new Filter({ path: "customer", operator: FilterOperator.LT, value1: 5 })
    //             ],
    //             and: true
    //         });
    //     case "2":
    //         return new Filter({ path: "customer", operator: FilterOperator.GT, value1: 5 });
    // }
}