'use strict';

const sqlite = require('sqlite3');
const SKU = require('./SKU');
const dbname = "./ezwh.db";
const db = new sqlite.Database(dbname, (err) => { if (err) throw err; });

/**************** SKU *****************/

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

// get the SKU identified by {id}
exports.getSKUById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM SKUs WHERE id = ?', [id], (err, row) => {
            if (err)
                reject(err);

            if (row == undefined)
                resolve({ error: 'SKU not found.' });
            else {
                const sku = new SKU(sku.id, sku.description, sku.weight, sku.volume, sku.notes, sku.positionID, sku.availableQuantity, sku.price);
                resolve(sku);
            }
        });
    });
};

/**************** Test Descriptors *****************/

exports.getAllTestDescriptors = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM TestDescriptors', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const tdList = rows.map(td => ({
                    id: td.id,
                    name: td.Name,
                    procedureDescription: td.Description,
                    idSKU: td.idSKU
                }));
                resolve(tdList);
            }
        });
    });
}

exports.getTestDescriptorsIdBySKUId = (skuId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM TestDescriptors WHERE idSku = ?', [skuId], (err, rows) => {
            if (err)
                reject(err);

            if (rows == undefined)
                resolve({ error: 'SKU not found.' });
            else {
                const testDescIdsList = rows.map(t => ({ id: t.id }));
                resolve(testDescIdsList);
            }
        });
    });
};
