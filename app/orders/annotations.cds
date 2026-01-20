using OrderService as service from '../../srv/service';

annotate service.Orders with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: orderType_ID,
            },
            {
                $Type: 'UI.DataField',
                Value: customer,
            },
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Value: orderType_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: customer,
        },
    ],
    UI.SelectionFields           : [orderType_ID, ],
);

annotate service.Orders with {
    orderType @(Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'OrderTypes',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: orderType_ID,
                ValueListProperty: 'ID',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'description',
            },
        ],
    })
};

annotate service.Orders with {
    customer @Common.Label: 'customer'
};
