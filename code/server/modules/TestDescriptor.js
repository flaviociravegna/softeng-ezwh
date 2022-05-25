'use strict';

const db = require('./DB').db;

class TestDescriptor {
    constructor(id, name, procedureDescription, idSKU) {
        this.id = id;
        this.name = name;
        this.procedureDescription = procedureDescription;
        this.idSKU = idSKU;
    }
}

//getTestDescriptorsIdById

exports.getLastTestDescriptorsId = () => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM TestDescriptors ORDER BY id DESC LIMIT 1', (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row == undefined ? 0 : row.id);
        });
    });
}

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

exports.getTestDescriptorById = (idTestDescriptor) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM TestDescriptors WHERE id = ?', [idTestDescriptor], (err, row) => {
            if (err)
                reject(err);

            if (row == undefined)
                resolve({ error: 'Test Descriptor not found.' });
            else {
                resolve(new TestDescriptor(row.id, row.name, row.description, row.idSKU));
            }
        });
    });
}

exports.createNewTestDescriptor = (id, name, procedureDescription, idSKU) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO TestDescriptors (id, name, description, idSKU) VALUES (?, ?, ?, ?)",
            [id, name, procedureDescription, idSKU], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New SKU Item inserted');
            });
    });
}

exports.modifyTestDescriptor = (id, newName, newProcedureDescription, newIdSKU) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE TestDescriptors SET name = ?, description = ?, idSKU = ? WHERE id = ?",
            [newName, newProcedureDescription, newIdSKU, id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('Test Descriptor updated');
            });
    });
}

exports.deleteTestDescriptor = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM TestDescriptors WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('Test Descriptor deleted');
        });
    });
}

exports.deleteAllTestDescriptors = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM TestDescriptors", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('Test Descriptors deleted');
        });
    });
}