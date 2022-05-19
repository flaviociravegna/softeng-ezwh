'use strict';

const db = require('./DB');

class SKU {
    constructor(id, description, weight, volume, notes, positionID, availableQuantity, price) {
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.notes = notes;
        this.position = positionID;
        this.availableQuantity = availableQuantity;
        this.price = price;
        this.testDescriptors = []; //Contains the IDs of the associated test descriptors
    }
}

/**************** SKU Functions *****************/
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

exports.getSKUIdByPosition = (positionID) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM SKUs WHERE positionID = ?', [positionID], (err, row) => {
            if (err)
                reject(err);

            if (row == undefined)
                resolve({ error: 'SKU not found.' });
            else
                resolve(row.id);
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
                resolve('SKU deleted');
        });
    });
}