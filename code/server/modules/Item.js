'use strict';

const sqlite = require('sqlite3');
// open the database 
const db = new sqlite.Database('ezwh.db', (err) => {
    if (err) throw err;
});

class Item {
    constructor(id, price, SKUId, supplierId, description) {
        this.id = id;
        this.price = price;
        this.SKUId = SKUId;
        this.supplierId = supplierId;
        this.description = description;
    }
}

exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM Items', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const ItemsList = rows.map(item => new Item(item.id, item.price, item.skuID, item.supplierID, item.description));
                resolve(ItemsList);
            }
        });
    });
}

exports.getItemsById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM Items WHERE id = ?', [id], (err, row) => {
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'ID not found.' });
            else {
                const item = new Item(row.id, row.price, row.skuID, row.supplierID, row.description);
                resolve(item);
            }
        });
    });
}

exports.createNewItem = (id, price, skuID, supplierID, description) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO Items (id,price,skuID,supplierID,description) VALUES (?, ?, ?, ?, ?)",
            [id, price, skuID, supplierID, description], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New Item inserted');
            });
    });
}

exports.modifyItem = (id, price, skuID, supplierID, description) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE Items SET id = ?, price = ?, skuID = ?, supplierID = ?, description = ? WHERE id = ?",
            [id, price, skuID, supplierID, description, id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('item updated');
            });
    });
}

exports.deleteItemsByID = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM Items WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('Item deleted');
        });
    });
}
