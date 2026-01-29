namespace my.company;

entity Orders {
    key ID        : UUID;
        orderType : Association to OrderTypes @title: 'Order Type';
        customer  : Integer                   @title: 'Customer';
        supplier  : Integer                   @title: 'Supplier';
        contact   : Integer                   @title: 'Contact Person'  @odata.Type: 'Edm.String';
        contact2  : Association to Contacts   @title: 'Secondary Contact';
}

entity Customers {
    key ID   : Integer;
        name : String(100);
}

@cds.autoexpose
entity Contacts {
    key ID        : Integer @odata.Type: 'Edm.String';
        firstName : String(50);
        lastName  : String(50);
        email     : String(100);
}

@cds.autoexpose
entity OrderTypes {
    key ID          : Integer     @title: 'Order Type';
        description : String(100) @title: 'Description';
}
