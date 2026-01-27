namespace my.company;

entity Orders {
    key ID        : UUID;
        orderType : Association to OrderTypes @title: 'Order Type';
        customer  : Integer                   @title: 'Customer';
        supplier  : Integer                   @title: 'Supplier';
}

entity Customers {
    key ID   : Integer;
        name : String(100);
}

@cds.autoexpose
entity OrderTypes {
    key ID          : Integer     @title: 'Order Type';
        description : String(100) @title: 'Description';
}
