'use strict';

const db = require('./DB');

class SKUItem {
    constructor(RFID, available, dateOfStock, skuID) {
        this.RFID = RFID;
        this.Available = available;
        this.DateOfStock = dateOfStock;
        this.SKUId = skuID;
    }
}

/******************* SKU Items *********************/

exports.getAllSKUItems = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM SkuItems', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const skuItemList = rows.map(skuItem => new SKUItem(skuItem.RFID, skuItem.available, skuItem.dateOfStock, skuItem.skuID));
                resolve(skuItemList);
            }
        });
    });
}

exports.getSKUItemsBySkuID = (skuId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM SkuItems WHERE skuID = ? AND available = 1', [skuId], (err, rows) => {
            if (err)
                reject(err);
            else {
                const skuItemList = rows.map(skuItem => new SKUItem(skuItem.RFID, skuItem.available, skuItem.dateOfStock, skuItem.skuID));
                resolve(skuItemList);
            }
        });
    });
}

exports.getSKUItemByRFID = (RFID) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM SkuItems WHERE RFID = ?', [RFID], (err, row) => {
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'SKUItem not found.' });
            else {
                const skuItem = new SKUItem(row.RFID, row.available, row.dateOfStock, row.skuID);
                resolve(skuItem);
            }
        });
    });
}

exports.createNewSKUItem = (RFID, available, dateOfStock, SKUId) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO SKUItems (RFID, available, dateOfStock, SKUId) VALUES (?, ?, ?, ?)",
            [RFID, available, dateOfStock, SKUId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New SKU Item inserted');
            });
    });
}

exports.modifySKUItem = (oldRFID, newRFID, newAvailable, newDateOfStock, oldSkuItem) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUItems SET RFID = ?, available = ?, dateOfStock = ? WHERE RFID = ?",
            [newRFID, newAvailable, newDateOfStock, oldRFID], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('SKU Item updated');
            });
    });
}

exports.deleteSKUItem = (RFID) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM SKUItems WHERE RFID = ?", [RFID], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU Item deleted');
        });
    });
}


exports.deleteAllSKUItems = () => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM SKUItems", [], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU Item deleted');
        });
    });
}