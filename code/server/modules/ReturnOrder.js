'use strict';

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

//creates a new return order
// need to generate  RO id, get largest current ID and let id += 1
// need to insert products into another table. and do the join
exports.createNewReturnOrder = (returnDate, products, restockOrderId) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO ReturnOrders (returnDate, restockOrder) VALUES (?, ?)",
            [returnDate], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New ReturnOrder inserted');
            });
    });

}
//exports.commitReturnOrder = (id) => {}
// not asked by API

//need to implement
//delete returnOrder given its ID
exports.deleteReturnOrder = (id) => {
    db.run("DELETE FROM ReturnOrder WHERE id = ?",
        [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('ReturnOrder Deleted');
        });
});
}


module.exports = ReturnOrder;