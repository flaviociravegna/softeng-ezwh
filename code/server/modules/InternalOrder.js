'use strict';

const db = require('./DB');

class InternalOrder {
    constructor(id, issueDate, state, customerID, products) {
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.customerID = customerID;
        this.products = [];
    }
}

class InternalOrdersSKUItem {
    constructor(skuID, description, price, RFID, internalOrderID) {
        this.skuID = skuID;
        this.description = description;
        this.price = price;
        this.RFID = RFID;
        this.internalOrderID = internalOrderID;
    }
    check(skuID) {
        if (skuID == this.skuID) return false;
        else return true;
    }
}

// Internal Orders

exports.getAllInternalOrders = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM InternalOrders', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const orderList = rows.map(order => new InternalOrder(order.id, order.issueDate, order.state, order.customerID));
                resolve(orderList);
            }
        });
    });
}

exports.getInternalOrderById = (Id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM InternalOrders WHERE id = ?', [Id], (err, row) => {
            if (err)
                reject(err);

            if (row == undefined)
                resolve({ error: 'ID not found.' });
            else {
                const orderList = new InternalOrder(row.id, row.issueDate, row.state, row.customerID);
                resolve(orderList);
            }
        });
    });
}

exports.getInternalOrderByState = (state) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM InternalOrders WHERE state = ?', [state], (err, rows) => {
            if (err)
                reject(err);

            if (rows == undefined)
                resolve({ error: 'State not found.' });
            else {
                // //console.log(state);
                // //console.log(rows);
                const orderList = rows.map(order => new InternalOrder(order.id, order.issueDate, order.state, order.customerID));
                resolve(orderList);
            }
        });
    });
}

exports.getLastInternalOrderId = () => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM InternalOrders ORDER BY id DESC LIMIT 1', (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row == undefined ? 0 : row.id);
        });
    });
}

exports.createNewInternalOrder = (id, issueDate, state, customerID, products) => {
    return new Promise(async (resolve, reject) => {
        
        db.run("INSERT INTO InternalOrders (id,issueDate,state,customerID) VALUES (?, ?, ?, ?)",
            [id, issueDate, state, customerID], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New InternalOrder inserted');
            });
    });
}

exports.modifyInternalOrder = (id, issueDate, state, customerID) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE InternalOrders SET id = ?, customerID = ?, issueDate = ?, state = ? WHERE id = ?",
            [id, customerID, issueDate, state, id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('InternalOrder updated');
            });
    });
}

exports.deleteInternalOrderByID = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM InternalOrders WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('InternalOrder deleted');
        });
    });
}


/**************** InternalOrdersProduct *****************/

exports.getAllInternalOrdersProduct = () => {
    return new Promise((resolve, reject) => {

        db.all('SELECT i.internalOrderID,i.skuID,i.quantity,s.description,s.price  FROM InternalOrdersProducts i INNER JOIN SKUs s ON i.skuID=s.id', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const productList = rows.map(ip => ({ "skuID": ip.skuID, "description": ip.description, "price": ip.price, "quantity": ip.quantity, "internalOrderID": ip.internalOrderID }));
                resolve(productList);
            }
        });
    });
}

//get internalorderproduct via interorder id.
exports.getInternalOrdersProductById = (internalOrderID) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT i.internalOrderID,i.skuID,i.quantity,s.description,s.price  FROM InternalOrdersProducts i INNER JOIN SKUs s ON i.skuID=s.id WHERE i.internalOrderID = ?', [internalOrderID], (err, rows) => {
            if (err)
                reject(err);
            if (rows == undefined)
                resolve({ error: 'ID not found.' });
            else {
               // console.log(rows);
                const productList = rows.map(ip => ({ "skuID": ip.skuID, "description": ip.description, "price": ip.price, "quantity": ip.quantity, "internalOrderID": ip.internalOrderID }));
                resolve(productList);
            }
        });
    });
}

exports.getInternalOrdersProductBySKUId = (skuID) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT i.internalOrderID,i.skuID,i.quantity,s.description,s.price  FROM InternalOrdersProducts i INNER JOIN SKUs s ON i.skuID=s.id WHERE skuID = ?', [skuID], (err, row) => {
            //console.log(row);
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'SKUID not found.' });
            else {
                //console.log(row);
                let ip=row;
                const product = { "skuID": ip.skuID, "description": ip.description, "price": ip.price, "quantity": ip.quantity, "internalOrderID": ip.internalOrderID };
                resolve(product);
            }
        });
    });
}

/**************** InternalOrdersSKUItems *****************/

exports.getAllInternalOrdersSKUItems = () => {
    return new Promise((resolve, reject) => {
          
         db.all('SELECT i.internalOrderID as internalOrderID ,si.RFID as RFID,s.description as description,s.price as price, si.skuID as skuID FROM (InternalOrdersSKUItems i INNER JOIN SKUItems si ON i.RFID=si.RFID) INNER JOIN SKUs s ON si.skuID =s.id ', [], (err, rows) => {
            if (err){

                reject(err);
            }
                
            else {

                const ItemsList = rows.map(is => new InternalOrdersSKUItem(is.skuID, is.description, is.price, is.RFID, is.internalOrderID));
                resolve(ItemsList);
            }
        });
    });
}

//get internalorderSKUItem via interorder id.
exports.getInternalOrdersSKUItemById = (internalOrderID) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT i.internalOrderID,si.RFID,s.description,s.price,si.skuID FROM (InternalOrdersSKUItems i INNER JOIN SKUItems si ON i.RFID=si.RFID) INNER JOIN SKUs s ON si.skuID =s.id WHERE internalOrderID = ?', [internalOrderID], (err, rows) => {
            if (err)
                reject(err);
            if (rows == undefined)
                resolve({ error: 'ID not found.' });
            else {
                const ItemsList = rows.map(is => new InternalOrdersSKUItem(is.skuID, is.description, is.price, is.RFID, is.internalOrderID));
                resolve(ItemsList);
            }
        });
    });
}

exports.addInternalOrdersSKUItems = (internalOrderID, RFID) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO InternalOrdersSKUItems (internalOrderID, RFID) VALUES (?, ?)",
            [internalOrderID, RFID], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New InternalOrder SKU Item inserted');
            });
    });
}

exports.modifyInternalOrderSKUItems = (id, RFID) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE InternalOrdersSKUItems SET internalOrderID = ? WHERE RFID = ?",
            [id, RFID], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('InternalOrdersSKUItems updated');

            });
    });
}

exports.addInternalOrdersProducts = (internalOrderID, skuID, quantity) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO InternalOrdersProducts (internalOrderID, skuID, quantity) VALUES (?, ?, ?)",
            [internalOrderID, skuID, quantity], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New InternalOrder inserted');
            });
    });
}

exports.deleteInternalOrderProducts = (internalOrderID) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM InternalOrdersProducts WHERE internalOrderID = ?", [internalOrderID], function (err) {
            if (err)
                reject(err);
            else
                resolve('InternalOrder products deleted');
        });
    });
}

exports.deleteInternalOrderSKUItems = (internalOrderID) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM InternalOrdersSKUItems WHERE internalOrderID = ?", [internalOrderID], function (err) {
            if (err)
                reject(err);
            else
                resolve('InternalOrder SKU Items deleted');
        });
    });
}

exports.deleteAllInternalOrders = ()=>{
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM InternalOrders", [], function (err) {
            if (err)
                reject(err);
            else
                resolve('InternalOrders deleted');
        });
    })
}
exports.deleteAllInternalOrdersSKUItems = ()=>{
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM InternalOrdersSKUItems", [], function (err) {
            if (err)
                reject(err);
            else
                resolve('InternalOrders SKUItems deleted');
        });
    })
}
exports.deleteAllInternalOrdersProducts = ()=>{
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM InternalOrdersProducts", [], function (err) {
            if (err)
                reject(err);
            else
                resolve('InternalOrders Products deleted');
        });
    })
}