class SKUItem {
    constructor(RFID, available, dateOfStock, skuID) {
        this.RFID = RFID;
        this.available = available;
        this.dateOfStock = dateOfStock;
        this.skuID = skuID;
    }
}

module.exports = SKUItem;