'use strict';
const sqlite = require('sqlite3');

const dbname = "./ezwh.db";
const db = new sqlite.Database(dbname, (err) => { if (err) throw err; });
const SKUItem = require('./SKUItem')


class RestockOrder{
    constructor(id, issueDate, state, supplierID, transportNote) {
        this.id = id;
        this.issueDate = issueDate;
        this.state= state;
        this.products = [];// contains products
        this.supplierID = supplierID;
        this.transportNote= transportNote;
    }
}

/*************** Restock Order ********************/

exports.getRestockOrders = () => {
}
exports.getRestockOrdersIssued = () => {}
exports.getRestockOrderById = (Id) => { }

exports.getRestockOrderFailedSKUItems = (Id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM SkuItems S, SkuItemsOfRestockOrder SR WHERE S.Rfid = SR.Rfid AND SR.Id = ?", [Id], (err, rows) => {
            if (err)
                reject(err);
            else {
                resolve(rows);
            }
        });
    });
}

exports.createRestockOrder = (issueDate, products, supplierId) => { }

exports.removeSKUItemFromRestockOrder = (skuId, id) => { }

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