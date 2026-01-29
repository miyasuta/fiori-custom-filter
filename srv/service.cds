using {my.company as db} from '../db/schema';

service OrderService {
    entity Orders   as projection on db.Orders;
    entity Contacts as projection on db.Contacts;
}

service CustomerService {
    entity Customers as projection on db.Customers;
}
