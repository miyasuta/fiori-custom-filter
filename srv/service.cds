using {my.company as db} from '../db/schema';

service OrderService {
    entity Orders as projection on db.Orders;
}

service CustomersService {
    entity Customers as projection on db.Customers;
}
