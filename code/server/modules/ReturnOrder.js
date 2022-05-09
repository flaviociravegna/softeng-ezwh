'use strict';

class ReturnOrder{
    constructor(id, returnDate, restockOrder) {
        this.id = id;
        this.returnDate = returnDate;
        this.restockOrderId = restockOrder;
        this.products = [];
    }
}

module.exports = ReturnOrder;