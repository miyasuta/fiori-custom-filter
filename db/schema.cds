namespace my.company;

entity Orders {
    key ID        : UUID;
        orderType : Association to OrderTypes;
        customer  : Integer;
}

entity Customers {
    key ID   : Integer;
        name : String(100);
}

@cds.autoexpose
entity OrderTypes {
    key orderType   : Integer;
        description : String(100);
}
