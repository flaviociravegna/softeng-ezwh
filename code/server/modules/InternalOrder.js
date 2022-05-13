'use strict';

class InternalOrder {
    constructor(id,issueDate,state,customerID,products) {
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.customerID = customerID;
        this.products = []; 
    }
}

module.exports = InternalOrder;