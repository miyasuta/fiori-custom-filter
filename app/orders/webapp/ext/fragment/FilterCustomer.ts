import type Event from 'sap/ui/base/Event';
import type ComboBox from 'sap/m/ComboBox';
import ExtensionAPI from 'sap/fe/templates/ListReport/ExtensionAPI';

/**
 * Handler for customer ComboBox selection change
 * 'this' is bound to the ListReport ExtensionAPI context
 * @param oEvent selection change event
 */
export function onCustomerChanged(this: ExtensionAPI, oEvent: Event) {
    const oComboBox = oEvent.getSource() as ComboBox;
    const oSelectedItem = oComboBox.getSelectedItem();
    const sSelectedKey = oSelectedItem?.getKey();

    console.log("Customer changed:", sSelectedKey);

    // Set value to other filter field using ExtensionAPI
    // 'this' refers to the ExtensionAPI context
    if (sSelectedKey) {
        // Example: When customer 1 is selected, set orderType to 1
        // When customer 2 is selected, set orderType to 2
        // Convert to number - orderType_ID is Int32 in OData
        const nValue = parseInt(sSelectedKey, 10);
        console.log("Setting orderType_ID to:", nValue, "(type:", typeof nValue, ")");
        (this as any).setFilterValues("orderType_ID", nValue);
    } else {
        // Clear the orderType filter when customer is cleared
        console.log("Clearing orderType_ID filter");
        (this as any).setFilterValues("orderType_ID");
    }
}
