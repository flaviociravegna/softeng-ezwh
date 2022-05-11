'use strict';

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

//need to add products & skuItems. would need to add another query to form 2 arrays
exports.getRestockOrders = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM RestockOrder", [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const RestockOrders = rows.map(RO => new RestockOrder(RO.id, RO.issueDate, RO.state, RO.SupplierId, RO.transportNote))
                resolve(RestockOrders);
            }
        });

    });
}

//same problem as above method
exports.getRestockOrdersIssued = () => {
    return new Promise((resolve, reject) => {
         db.all("SELECT * FROM RestockOrder WHERE state = 'ISSUED' ", [], (err, rows) => {
             if (err)
                 reject(err);
             else {
                 const RestockOrders = rows.map(RO => new RestockOrder(RO.id, RO.issueDate, RO.state, RO.SupplierId, RO.transportNote))
                 resolve(RestockOrders);
             }
         });
    
    });
}
//same problem as the 2 above
exports.getRestockOrderById = (Id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM RestockOrder WHERE id = ?", [Id], (err, row) => {
            if (err)
                reject(err);
            else {
                RO = new RestockOrder(row.id, row.issueDate, row.state, row.SupplierId, row.transportNote);
                resolve(RO);
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


//need to create an entry for each item in the corresponding table.
exports.createRestockOrder = (issueDate, products, supplierId) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO RestockOrders (id, issueDate, state, supplierId) VALUES (?, ?, ?, ?)",
            [id, issueDate, 'ISSUED', supplierID], function (err) {
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
                if (row.State != 'COMPLETEDRETURN')
                    reject(err);
                else {
                    resolve('State COMPLETEDRETURN');
                }
            }

        });
        
    });
}


module.exports = RestockOrder;