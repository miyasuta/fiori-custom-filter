import type Event from 'sap/ui/base/Event';
import type ComboBox from 'sap/m/ComboBox';

/**
 * Handler for customer ComboBox selection change
 * 'this' is bound to the ListReport ExtensionAPI context
 * @param oEvent selection change event
 */
export function onCustomerChanged(this: any, oEvent: Event) {
    const oComboBox = oEvent.getSource() as ComboBox;
    const oSelectedItem = oComboBox.getSelectedItem();
    const sSelectedKey = oSelectedItem?.getKey();

    console.log("Customer changed:", sSelectedKey);

    // Set value to other filter field using ExtensionAPI
    // 'this' refers to the ExtensionAPI context
    if (sSelectedKey) {
        // Example: When customer 1 is selected, set orderType to 1
        // When customer 2 is selected, set orderType to 2
        this.setFilterValues("orderType_ID", [sSelectedKey]);
        console.log("Set orderType_ID to:", sSelectedKey);
    } else {
        // Clear the orderType filter when customer is cleared
        this.setFilterValues("orderType_ID");
        console.log("Cleared orderType_ID filter");
    }
}
