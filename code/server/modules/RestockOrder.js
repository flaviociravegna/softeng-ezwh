'use strict';
const sqlite = require('sqlite3');

const dbname = "./ezwh.db";
const db = require('./db');
const SKUItem = require('./SKUItem')


class RestockOrder{
    constructor(id, issueDate, state, supplierID, transportNote) {
        this.id = id;
        this.issueDate = issueDate;
        this.state= state;
        this.products = [];// contains products
        this.supplierID = supplierID;
        this.transportNote = transportNote;
        this.skuItems = []// contains skuItemsRequired by API
    }
}

/*************** Restock Order ********************/


exports.getProducts = (Id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT S.id as SKUId, description, price, quantity as qty  FROM RestockOrdersProducts ROS, SKUs S WHERE ROS.skuID =  S.id AND ROS.restockOrderID = ?",
            [Id], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows);
                }
            });
    });

}

exports.getSKUItems = (Id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT S.SKUId as SKUId, S.RFID as rfid FROM RestockOrdersSKUItems ROS, SKUItem S WHERE S.RFID = ROS.RFID AND ROS.restockOrderID = ?",
            [Id], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows);
                }
            });
    });
}


exports.getRestockOrders = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM RestockOrder", [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const RestockOrders = rows.map(RO => new RestockOrder(RO.id, RO.issueDate, RO.state, RO.SupplierId, RO.transportNote))
                for (RO in RestockOrder) {
                    RO.products = RestockOrder.getProducts(RO.id);
                    RO.skuItems = RestockOrder.getSKUItems(RO.id);
                    if (!RO.products.isArray() || RO.products.error || !RO.skuItems.isArray() || RO.skuItems.error)
                        reject(Error());
                }
                resolve(RestockOrders);
            }
        });

    });
}

exports.getRestockOrdersIssued = () => {
    return new Promise((resolve, reject) => {
         db.all("SELECT * FROM RestockOrder WHERE state = 'ISSUED' ", [], (err, rows) => {
             if (err)
                 reject(err);
             else {
                 const RestockOrders = rows.map(RO => new RestockOrder(RO.id, RO.issueDate, RO.state, RO.SupplierId, RO.transportNote))
                 for (RO in RestockOrder) {
                     RO.products = RestockOrder.getProducts(RO.id);
                     RO.skuItems = RestockOrder.getSKUItems(RO.id);
                     if (!RO.products.isArray() || RO.products.error || !RO.skuItems.isArray() || RO.skuItems.error)
                         reject(Error());
                 }

                 resolve(RestockOrders);
             }
         });
    
    });
}


exports.getRestockOrderById = (Id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM RestockOrder WHERE id = ?", [Id], (err, row) => {
            if (err)
                reject(err);
            else {
                RO = new RestockOrder(row.id, row.issueDate, row.state, row.SupplierId, row.transportNote);
                    RO.products = RestockOrder.getProducts(RO.id);
                    RO.skuItems = RestockOrder.getSKUItems(RO.id);
                    if (!RO.products.isArray() || RO.products.error || !RO.skuItems.isArray() || RO.skuItems.error)
                        reject(Error());

                resolve(RestockOrders);
            }
        });
    });
}

//need to check if items actually failed tests. need an attribute to mark it
exports.getRestockOrderFailedSKUItems = (Id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT SKUId, RFID as rfid FROM SKUItems S, RestockOrderSKUItems SR WHERE S.RFID = SR.RFID AND SR.restockOrderID = ?", [Id], (err, rows) => {
            if (err)
                reject(err);
            else {
                resolve(rows);
            }
        });
    });
}


exports.getLastPIDInOrder = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT MAX(id) as id FROM RestockOrdersProducts WHERE restockOrderID = ?", [id], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row == undefined ? 0 : row.id);
        });

    });

}

exports.insertProductInOrder = (id, product) => {
    return new Promise((resolve, reject) => {
        let ROPId = RestockOrder.getLastPIDInOrder(id);
        db.run("INSERT INTO RestockOrdersProducts(restockOrderId,skuID, quantity, id) VALUES (?,?,?,?)", [id, product.SKUId, product.qty, ROPId], function (err) {
            if (err)
                reject(err);
        });

    });

}

exports.getLastId = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT MAX(id) as id FROM RestockOrders", [], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row == undefined ? 0 : row.id);
        });

    });

}

//need to create an entry for each item in the corresponding table.
// need to see where to put product description consider creating a class product
exports.createRestockOrder = (issueDate, products, supplierId) => {
    return new Promise((resolve, reject) => {

        id = RestockOrder.getLastId() + 1;

        db.run("INSERT INTO RestockOrders (id, issueDate, state, supplierId) VALUES (?, ?, ?, ?)",
            [id, issueDate, 'ISSUED', supplierId], function (err) {
                if (err)
                    reject(err);
                else

                    for (product in products) {
                        RestockOrder.insertProductInOrder(id, product);
                        if (err)
                            reject(err);
                    }
                    resolve('New RestockOrder inserted');
            }
        );
    });
}

exports.removeSKUItemFromRestockOrder = (skuId, id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM RestockOrderSKUItems WHERE restockOrderID = ? AND RFID = ?",
            [id,skuId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('Item Deleted from RestockOrder');
            }
        );
    });

}

exports.modifyRestockOrderState = (id,newState) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE RestockOrder SET State = ? WHERE id = ?",
            [newState, id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('RequestOrder updated');
            });
    });
}

exports.addRestockOrderSKUItems = (id, skuItems) => {}
//exports.issueRestockOrder = (id) => {}
//not requested by API
exports.addRestockOrderTransportNote = (id, transportNote) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE RestockOrder SET TransportNote = ? WHERE id = ?",
            [transportNote, id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('RequestOrder updated');
            });
    });
};
exports.deleteRestockOrder = (id) => {
    db.run("DELETE FROM RestockOrder WHERE id = ?",
        [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('RequestOrder Deleted');
        });
};

exports.getRestockOrderState = (id) => {
    return new Promise((resolve, reject) => {

        db.get('SELECT State FROM RestockOrders WHERE id = ?', [id], (err, row) => {
            if (err)
                reject(err);
            else {
             resolve(row);
             }

        });
        
    });
}


module.exports = RestockOrder;