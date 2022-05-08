'use strict';

class ReturnOrder{
    constructor(id, returnDate, restockOrder) {
        this.id = id;
        this.returnDate = returnDate;
        this.restockOrder = restockOrder;
    }
}

module.exports = ReturnOrder;