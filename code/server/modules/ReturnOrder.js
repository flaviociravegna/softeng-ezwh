'use strict';
const sqlite = require('sqlite3');
const dbname = "./ezwh.db";
const db = require('./db');


class ReturnOrder{
    constructor(id, returnDate, restockOrder) {
        this.id = id;
        this.returnDate = returnDate;
        this.restockOrderId = restockOrder;
        this.products = [];
    }
}

/*************** Return Order ********************/
//gets all returnOrders
exports.getReturnOrders = () => {
    return new Promis((resolve, reject) => {
        db.all('SELECT * FROM ReturnOrders', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const roList = rows.map(ro => new ReturnOrder(ro.id, ro.returnDate, ro.restockOrder));
                resolve(roList);
            }
        });
    });

}
//needs fixing needs items
//gets returnOrder by ID
exports.getReturnOrderById = (id) => {
    return new Promise((resolve,reject) => {
        db.all('SELECT * FROM ReturnOrders WHERE id=?', [id], (err, rows) => {
            if (err)
                reject(err);
            if (rows == undefined)
                resolve({ error: 'ReturnOrder not found.' });
            else {
                //const roList = rows.map(ro => ( ro.returnDate,/* products */ , ro.restockOrder));
                resolve(roList);
            }
        });
    });

}

//gets las ReturnOrderId
exports.getLastROId = () => {

    return new Promise((resolve, reject) => {
        db.get("SELECT MAX(id) as id FROM ReturnOrders", [], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row == undefined ? 0 : row.id);
        });

    });

}

exports.insertProductsInRO = (id, product) => {

    return new Promise((resolve, reject) => {

        db.run("INSERT INTO ReturnOrdersProducts (SKUId,description,price,RFID,ReturnOrderID) VALUES (?,?,?,?,?)", [product.SKUId,product.description,product.price,product.RFID,id], function (err) {
            if (err) reject(err);
        });

    });



}


//creates a new return order
// need to insert products into another table. and do the join
exports.createNewReturnOrder = (returnDate, products, restockOrderId) => {
    return new Promise(async (resolve, reject) => {
        let id = ReturnOrder.getLastROId() + 1;
        if (id.error)
            reject(id.error);
        
        db.run("INSERT INTO ReturnOrders (id, returnDate, restockOrder) VALUES (?, ?, ?)",
            [id,returnDate,restockOrderId], function (err) {
                if (err)
                    reject(err);
                else
                    for (product in products) {
                        let s=ReturnOrder.insertProductsInRO(id, product);
                        if (s.error)
                            reject(s.error);

                    }
                    resolve('New ReturnOrder inserted');
            });
    });

}
//exports.commitReturnOrder = (id) => {}
// not asked by API

//delete returnOrder given its ID
exports.deleteReturnOrder = ((id) => {
    db.run("DELETE FROM ReturnOrder WHERE id = ?",
        [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('ReturnOrder Deleted');
        });
});



module.exports = ReturnOrder;