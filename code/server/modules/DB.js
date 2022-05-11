'use strict';

const sqlite = require('sqlite3');
const SKU = require('./SKU');
const SKUItem = require('./SKUItem')
const TestDescriptor = require('./TestDescriptor');
const dbname = "./ezwh.db";
const db = new sqlite.Database(dbname, (err) => { if (err) throw err; });

/**************** SKU *****************/
// NB: sqlite3 supports "LIMIT" clause
// Table name can't be used as a parameter in sqlite
exports.getLastSKUId = () => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM SKUs ORDER BY id DESC LIMIT 1', (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row == undefined ? 0 : row.id);
        });
    });
}

exports.getAllSKU = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM SKUs', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const skuList = rows.map(sku => new SKU(sku.id, sku.description, sku.weight, sku.volume, sku.notes, sku.positionID, sku.availableQuantity, sku.price));
                resolve(skuList);
            }
        });
    });
}

exports.getSKUById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM SKUs WHERE id = ?', [id], (err, row) => {
            if (err)
                reject(err);

            if (row == undefined)
                resolve({ error: 'SKU not found.' });
            else {
                const sku = new SKU(row.id, row.description, row.weight, row.volume, row.notes, row.positionID, row.availableQuantity, row.price)
                resolve(sku);
            }
        });
    });
};

// NB: it's not possible to use arrow function notation with "run"
exports.createNewSKU = (id, description, weight, volume, notes, price, positionID, availableQuantity) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO SKUs (id, description, weight, volume, notes, price, positionID, availableQuantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [id, description, weight, volume, notes, price, positionID, availableQuantity], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New SKU inserted');
            });
    });
}

exports.modifySKU = (id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUs SET description = ?, weight = ?, volume = ?, notes = ?, price = ?, availableQuantity = ? WHERE id = ?",
            [newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity, id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('SKU updated');
            });
    });
}

exports.decreaseSKUavailableQuantity = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUs SET availableQuantity = availableQuantity - 1 WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU updated');
        });
    });
}

exports.increaseSKUavailableQuantity = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUs SET availableQuantity = availableQuantity + 1 WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU updated');
        });
    });
}

exports.addOrModifyPositionSKU = (id, positionID) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUs SET positionID = ? WHERE id = ?", [positionID, id], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU position updated');
        });
    });
}

exports.deleteSKU = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM SKUs WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU position deleted');
        });
    });
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
                const skuItemList = rows.map(skuItem => new SKUItem(skuItem.RFID, skuItem.dateOfStock, skuItem.skuID));
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

/**************** Test Descriptors *****************/

exports.getAllTestDescriptors = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM TestDescriptors', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const tdList = rows.map(td => new TestDescriptor(td.id, td.name, td.description, td.idSKU));
                resolve(tdList);
            }
        });
    });
}

exports.getTestDescriptorsIdBySKUId = (skuId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT id FROM TestDescriptors WHERE idSku = ?', [skuId], (err, rows) => {
            if (err)
                reject(err);

            if (rows == undefined)
                resolve({ error: 'Test Descriptors not found.' });
            else {
                const testDescIdsList = rows.map(t => t.id);
                resolve(testDescIdsList);
            }
        });
    });
}


/***********************************/