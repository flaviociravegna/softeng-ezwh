'use strict';

const db = require('./DB');

class RestockOrder {
    constructor(id, issueDate, state, supplierID, transportNote) {
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.products = [];// contains products
        this.supplierID = supplierID;
        this.transportNote = transportNote;
        this.skuItems = []// contains skuItemsRequired by API
    }
}

/*************** Restock Order ********************/
exports.getRestockOrderProducts = (restock_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT ROP.skuID, ROP.quantity, I.description, I.price FROM RestockOrdersProducts ROP, Items I WHERE ROP.restockOrderID = ? AND ROP.itemID = I.id'
        db.all(sql, [restock_id], (err, rows) => {
            if (err)
                reject(err);
            else {
                const productsList = rows.map((row) => ({
                    SKUId: row.skuID,
                    description: row.description,
                    price: row.price,
                    qty: row.quantity,
                }));
                resolve(productsList);
            }
        });
    });

}

exports.getRestockOrderSkuItems = (restock_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT ROSI.RFID, SI.skuID FROM RestockOrdersSKUItems ROSI, SKUItems SI WHERE ROSI.RFID = SI.RFID AND restockOrderID = ?'
        db.all(sql, [restock_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const SKUItemList = rows.map((row) => ({
                    SKUId: row.skuID,
                    rfid: row.RFID
                }));
                resolve(SKUItemList);
            }
        });

    });
}

exports.getRestockOrders = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM RestockOrders", [], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                const RestockOrders = rows.map(RO => new RestockOrder(RO.id, RO.issueDate, RO.state, RO.SupplierId, RO.transportNote));
                resolve(RestockOrders);
            }
        });
    });
}

exports.getRestockOrdersIssued = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM RestockOrders WHERE state = 'ISSUED' ", [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const RestockOrders = rows.map(RO => new RestockOrder(RO.id, RO.issueDate, RO.state, RO.supplierID, RO.transportNote));
                resolve(RestockOrders);
            }
        });
    });
}

exports.getRestockOrderById = (Id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM RestockOrders WHERE id = ?", [Id], (err, row) => {
            if (err)
                reject(err);

            if (row == undefined)
                resolve({ error: 'Restock Order not found' });
            else {
                let RO = new RestockOrder(row.id, row.issueDate, row.state, row.SupplierId, row.transportNote);
                resolve(RO);
            }
        });
    });
}

exports.getRestockOrderFailedSKUItems = (id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT SI.skuID, RO.RFID FROM TestResults TR, RestockOrdersSKUItems RO, SKUItems SI WHERE RO.RFID = TR.RFID AND RO.RFID = SI.RFID AND TR.RFID NOT IN (SELECT RFID FROM TestResults WHERE RESULT = 1) AND RO.restockOrderID = ? GROUP BY RO.RFID,  SI.skuID", [id], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

exports.getLastPIDInOrder = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT id FROM RestockOrdersProducts ORDER BY id DESC LIMIT 1", [], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row == undefined ? 0 : row.id);
        });
    });
}

exports.insertProductInOrder = (id, restockOrderId, skuID, qty) => {
    return new Promise((resolve, reject) => {
        const sql = 'REPLACE INTO RestockOrdersProducts (id, restockOrderId, skuID, quantity) VALUES (?,?,?)';
        db.run(sql, [id, restockOrderId, skuID, qty], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(null);
        });
    });
}

exports.getLastIdRsO = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT id FROM RestockOrders ORDER BY id DESC LIMIT 1", [], (err, row) => {
            if (err) {
                reject(err);
            }
            else
                resolve(row == undefined ? 0 : row.id);
        });
    });
}

//need to create an entry for each item in the corresponding table.
// need to see where to put product description consider creating a class product
exports.createRestockOrder = (issueDate, supplierId, id) => {
    return new Promise((resolve, reject) => {
        db.run("REPLACE INTO RestockOrders (id, issueDate, state, supplierID) VALUES (?, ?, ?, ?)",
            [id, issueDate, 'ISSUED', supplierId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New RestockOrder inserted');
            }
        );
    });
}

exports.removeSKUItemFromRestockOrder = (skuId, id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM RestockOrdersSKUItems WHERE restockOrderID = ? AND RFID = ?",
            [id, skuId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('Item Deleted from RestockOrder');
            }
        );
    });

}

exports.modifyRestockOrderState = (id, newState) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE RestockOrders SET state = ? WHERE id = ?",
            [newState, id], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(null);
            });
    });
}

exports.addRestockOrderSKUItems = (restockOrderID, RFID) => {
    return new Promise(async (resolve, reject) => {
        db.run("REPLACE INTO RestockOrdersSKUItems (restockOrderID, RFID) VALUES (?, ?)",
            [restockOrderID, RFID], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve('New RestockOrder SKU Item inserted');
            });
    });
}

// for now Transport note is A string should fix it to have it in its own table
exports.addRestockOrderTransportNote = (id, transportNote) => {
    return new Promise((resolve, reject) => {
        db.run("REPLACE INTO RestockOrdersTransportNote (RestockOrderID,DeliveryDate) VALUES (?,?)",
            [id,transportNote.eliveryDate], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('RequestOrders updated');
            });
    });
}

exports.getRestockOrderTransportNote = (id) =>{
    return new Promise((resolve, reject)=>{
        db.get("SELECT DeliveryDate FROM RestockOrderTransportNote WHERE RestockOrderID = ?",[id],(err,row)=>{
            if(err){
                reject(err);
            }else{
                resolve({TransportNote:{deliveryDate:row}});
            }
        });
    });
}

exports.deleteRestockOrder = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM RestockOrders WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('deleted Restock Order');
        });
    });

};

exports.deleteSkuItemsFromRestockOrder = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM RestockOrdersSKUItems WHERE restockOrderID = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('Deleted');
        });
    });
}

exports.deleteRestockOrderTransportNote = (id) =>{
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM RestockOrderTransportNote WHERE restockOrderID = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('Deleted');
        });
    });
}

exports.deleteProductsFromRestockOrder = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM RestockOrdersProducts WHERE restockOrderID = ?",
            [id], function (err) {
                if (err) {
                    reject(err);
                }
                else
                    resolve('Deleted');
            });
    });
}

exports.getSupplierById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT userId, username, type FROM users WHERE userId = ? AND type="SUPPLIER"', [id], (err, row) => {
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'Supplier not found.' });
            else
                resolve(row);
        });
    });
};


exports.getSKUByIdFromRestockOrder = (skuId, restockOrderId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM RestockOrdersProducts WHERE restockOrderID = ? AND skuID = ?';
        db.get(sql, [restockOrderId, skuId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined)
                resolve({ error: 'SKU not found.' });
            else resolve(row);
        });
    });
}
