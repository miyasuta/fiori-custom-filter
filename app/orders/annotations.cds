using OrderService as service from '../../srv/service';
annotate service.Orders with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'orderType_orderType',
                Value : orderType_orderType,
            },
            {
                $Type : 'UI.DataField',
                Label : 'customer',
                Value : customer,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'orderType_orderType',
            Value : orderType_orderType,
        },
        {
            $Type : 'UI.DataField',
            Label : 'customer',
            Value : customer,
        },
    ],
);

annotate service.Orders with {
    orderType @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'OrderTypes',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : orderType_orderType,
                ValueListProperty : 'orderType',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'description',
            },
        ],
    }
};

