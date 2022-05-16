'use strict';


class RestockOrder{
    constructor(id, issueDate, state, supplierID, transportNote) {
        this.id = id;
        this.issueDate = issueDate;
        this.state= state;
        this.products = [];// contains products
        this.supplierID = supplierID;
        this.transportNote = transportNote;
        this.skuItems = []// contains skuItemsRequired by API
    }
}



module.exports = RestockOrder;