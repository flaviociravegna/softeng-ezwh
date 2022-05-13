'use strict';

class Item {
    constructor(id,price,skuID,supplierID,description) {
        this.id = id;
        this.price = price;
        this.skuID = skuID;
        this.supplierID = supplierID;
        this.description = description; 
    }
}

module.exports = Item;