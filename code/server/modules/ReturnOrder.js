'use strict';

const db = require('./DB');

class ReturnOrder {
    constructor(id, returnDate, restockOrder) {
        this.id = id;
        this.returnDate = returnDate;
        this.restockOrderId = restockOrder;
        this.products = [];
    }
}

///////////////////////////////////////////////////
/*************** Return Order ********************/
///////////////////////////////////////////////////

//gets all returnOrders
exports.getReturnOrders = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM ReturnOrders', [], (err, rows) => {
            if (rows == undefined)
                resolve([]);
            if (err)
                reject(err);
            else {
                const roList = rows.map(ro => new ReturnOrder(ro.id, ro.returnDate, ro.restockOrderID));
                resolve(roList);
            }
        });
    });
}

//needs fixing needs items
//gets returnOrder by ID
exports.getReturnOrderById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM ReturnOrders WHERE id = ?', [id], (err, row) => {
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'ReturnOrder not found.' });
            else {
                let RO = new ReturnOrder(row.id, row.returnDate, row.restockOrderID);
                resolve(RO);
            }
        });
    });
}

exports.getReturnOrderProducts = (id) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT SKUId, description, price, RFID FROM ReturnOrdersProducts WHERE ReturnOrderID = ?', [id], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows)
        });
    });

}

//gets las ReturnOrderId
exports.getLastReturnOrderId = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT id FROM ReturnOrders ORDER BY id DESC LIMIT 1", [], (err, row) => {
            if (err) {
                reject(err);
            }
            else
                resolve(row == undefined ? 0 : row.id);
        });
    });
}

exports.insertProductInRO = (product, id) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO ReturnOrdersProducts (SKUId,description,price,RFID,ReturnOrderID) VALUES (?,?,?,?,?)",
            [product.SKUId, product.description, product.price, product.RFID, id], function (err) {
                if (err) {
                    reject(err);
                }
                else resolve('inserted products');
            });

    });

}

//creates a new return order
// need to insert products into another table. and do the join
exports.createNewReturnOrder = (returnDate, restockOrderId, id) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO ReturnOrders (id, returnDate, restockOrderID) VALUES (?, ?, ?)",
            [id, returnDate, restockOrderId], function (err) {
                if (err) {
                    reject(err);
                }
                else
                    resolve({ done: 'New ReturnOrder inserted' });
            });
    });
}
//exports.commitReturnOrder = (id) => {}
// not asked by API

//delete returnOrder given its ID
exports.deleteReturnOrder = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM ReturnOrders WHERE id = ?",
            [id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('ReturnOrder Deleted');
            });

    });
};

exports.deleteReturnOrderProducts = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM ReturnOrdersProducts WHERE ReturnOrderID = ?",
            [id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('ReturnOrderProducts Deleted');
            });

    });
}

exports.getRFIDFromRestockOrder = (RFID, restockOrderId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM RestockOrdersSKUItems WHERE restockOrderID = ? AND RFID = ?';
        db.get(sql, [restockOrderId, RFID], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined)
                resolve({ error: 'RFID not found in Restock Order' });
            else resolve(row);
        });
    });
}
