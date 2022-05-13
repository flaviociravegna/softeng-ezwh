'use strict';

class InternalOrdersSKUItem {
    constructor(skuID,description,price,RFID,internalOrderID) {
        this.skuID = skuID;
        this.description = description;
        this.price = price;
        this.RFID = RFID;
        this.internalOrderID = internalOrderID; 
    }
    check(skuID) {
        if(skuID==this.skuID)return false;
        else return true;
    }
}

module.exports = InternalOrdersSKUItem;