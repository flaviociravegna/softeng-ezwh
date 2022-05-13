'use strict';

class Product {
    constructor(skuID,description,price,quantity,internalOrderID) {
        this.skuID = skuID;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
        this.internalOrderID = internalOrderID; 
    }

     check(Product) {
        if(Product.skuID==this.skuID)return false;
        else return true;
    }
}

module.exports = Product;