'use strict';

const sqlite = require('sqlite3');
const SKU = require('./SKU');
const SKUItem = require('./SKUItem')
const TestDescriptor = require('./TestDescriptor');
const InternalOrder = require('./InternalOrder');
const Product = require('./Product');
const Item=require('./Item');
const InternalOrdersSKUItem = require('./InternalOrdersSKUItem');
const dbname = "./ezwh.db";
const db = new sqlite.Database(dbname, (err) => { if (err) throw err; });

/**************** SKU *****************/
// NB: sqlite3 supports "LIMIT" clause
// Table name can't be used as a parameter in sqlite
exports.getLastSKUId = () => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM SKUs ORDER BY id DESC LIMIT 1', (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row == undefined ? 0 : row.id);
        });
    });
}

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

exports.getSKUById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM SKUs WHERE id = ?', [id], (err, row) => {
            if (err)
                reject(err);

            if (row == undefined)
                resolve({ error: 'SKU not found.' });
            else {
                const sku = new SKU(row.id, row.description, row.weight, row.volume, row.notes, row.positionID, row.availableQuantity, row.price)
                resolve(sku);
            }
        });
    });
};

// NB: it's not possible to use arrow function notation with "run"
exports.createNewSKU = (id, description, weight, volume, notes, price, positionID, availableQuantity) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO SKUs (id, description, weight, volume, notes, price, positionID, availableQuantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [id, description, weight, volume, notes, price, positionID, availableQuantity], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New SKU inserted');
            });
    });
}

exports.modifySKU = (id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUs SET description = ?, weight = ?, volume = ?, notes = ?, price = ?, availableQuantity = ? WHERE id = ?",
            [newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity, id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('SKU updated');
            });
    });
}

exports.decreaseSKUavailableQuantity = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUs SET availableQuantity = availableQuantity - 1 WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU updated');
        });
    });
}

exports.increaseSKUavailableQuantity = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUs SET availableQuantity = availableQuantity + 1 WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU updated');
        });
    });
}

exports.addOrModifyPositionSKU = (id, positionID) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUs SET positionID = ? WHERE id = ?", [positionID, id], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU position updated');
        });
    });
}

exports.deleteSKU = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM SKUs WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('SKU position deleted');
        });
    });
}

/******************* SKU Items *********************/

exports.getAllSKUItems = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM SkuItems', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const skuItemList = rows.map(skuItem => new SKUItem(skuItem.RFID, skuItem.available, skuItem.dateOfStock, skuItem.skuID));
                resolve(skuItemList);
            }
        });
    });
}

exports.getSKUItemsBySkuID = (skuId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM SkuItems WHERE skuID = ? AND available = 1', [skuId], (err, rows) => {
            if (err)
                reject(err);
            else {
                const skuItemList = rows.map(skuItem => new SKUItem(skuItem.RFID, skuItem.dateOfStock, skuItem.skuID));
                resolve(skuItemList);
            }
        });
    });
}

exports.getSKUItemByRFID = (RFID) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM SkuItems WHERE RFID = ?', [RFID], (err, row) => {
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'SKUItem not found.' });
            else {
                const skuItem = new SKUItem(row.RFID, row.available, row.dateOfStock, row.skuID);
                resolve(skuItem);
            }
        });
    });
}

exports.createNewSKUItem = (RFID, available, dateOfStock, SKUId) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO SKUItems (RFID, available, dateOfStock, SKUId) VALUES (?, ?, ?, ?)",
            [RFID, available, dateOfStock, SKUId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New SKU Item inserted');
            });
    });
}

exports.modifySKUItem = (oldRFID, newRFID, newAvailable, newDateOfStock, oldSkuItem) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE SKUItems SET RFID = ?, available = ?, dateOfStock = ? WHERE RFID = ?",
            [newRFID, newAvailable, newDateOfStock, oldRFID], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('SKU Item updated');
            });
    });
}

/**************** Test Descriptors *****************/

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

exports.getTestDescriptorsIdById = (idTestDescriptor) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM TestDescriptors WHERE id = ?', [idTestDescriptor], (err, row) => {
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'Test Descriptor not found.' });
            else {
                resolve(row);
            }
        });
    });
}

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
                // console.log(state);
                // console.log(rows);
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
                resolve(row == undefined ? 1 : row.id);
        });
    });
}

exports.createNewInternalOrder = (id,issueDate,state,customerID,products) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO InternalOrders (id,issueDate,state,customerID) VALUES (?, ?, ?, ?)",
            [id,issueDate,state,customerID,products], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New InternalOrder inserted');
            });
    });
}

exports.modifyInternalOrder= (id,issueDate,state,customerID) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE InternalOrders SET id = ?, customerID = ?, issueDate = ?, state = ? WHERE id = ?",
            [id,issueDate,state,customerID], function (err) {
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
                const   productList = rows.map(ip => new Product(ip.skuID, ip.description, ip.price , ip.quantity, ip.internalOrderID));
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
                const productList = rows.map(ip => new Product(ip.skuID, ip.description, ip.price , ip.quantity, ip.internalOrderID));
                resolve(productList);
            }
        });
    });
}

exports.getInternalOrdersProductBySKUId = (skuID) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT i.internalOrderID,i.skuID,i.quantity,s.description,s.price  FROM InternalOrdersProducts i INNER JOIN SKUs s ON i.skuID=s.id WHERE skuID = ?', [skuID], (err, row) => {
            console.log(row);
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'SKUID not found.' });
            else {
                const productList =new Product(row.skuID, row.description, row.price , row.quantity, row.internalOrderID);
                resolve(productList);
            }
        });
    });
}

/**************** InternalOrdersSKUItems *****************/

exports.getAllInternalOrdersSKUItems = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT i.internalOrderID,si.RFID,s.description,s.price,si.skuID FROM (InternalOrdersSKUItems i INNER JOIN SKUItems si ON i.RFID=si.RFID) INNER JOIN SKUs s ON si.skuID =s.id ', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const ItemsList = rows.map(is => new InternalOrdersSKUItem(is.skuID, is.description,is.price,is.RFID , is.internalOrderID));
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
                const ItemsList = rows.map(is => new InternalOrdersSKUItem(is.skuID, is.description,is.price,is.RFID , is.internalOrderID));
                resolve(ItemsList);
            }
        });
    });
}

exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM Items', [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const ItemsList = rows.map(item => new Item(item.id,item.price,item.skuID,item.supplierID , item.description));
                resolve(ItemsList);
            }
        });
    });
}

exports.getItemsById = (id) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM Items WHERE id = ?', [id], (err, rows) => {
            if (err)
                reject(err);
            if (rows == undefined)
                resolve({ error: 'ID not found.' });
            else {
                const ItemsList = rows.map(item => new Item(item.id,item.price,item.skuID,item.supplierID , item.description));
                resolve(ItemsList);
            }
        });
    });
}

exports.modifyInternalOrderSKUItems= (id,RFID) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE InternalOrdersSKUItems SET internalOrderID = ? WHERE RFID = ?",
            [id,RFID], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('InternalOrdersSKUItems updated');
                    
            });
    });
}


exports.createNewItem = (id,price,skuID,supplierID,description) => {
    return new Promise(async (resolve, reject) => {
        db.run("INSERT INTO Items (id,price,skuID,supplierID,description) VALUES (?, ?, ?, ?, ?)",
            [id,price,skuID,supplierID,description], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('New Item inserted');
            });
    });
}


exports.modifyItem = (id,price,skuID,supplierID,description) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE Items SET id = ?, price = ?, skuID = ?, supplierID = ?, description = ? WHERE id = ?",
            [price,skuID,supplierID,description,id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('item updated');
            });
    });
}


exports.deleteItemsByID = (id) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM Items WHERE id = ?", [id], function (err) {
            if (err)
                reject(err);
            else
                resolve('Item deleted');
        });
    });
}

/***********************************/

/*************** Restock Order ********************/


exports.getProducts = (Id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT S.id as SKUId, description, price, quantity as qty  FROM RestockOrdersProducts ROS, SKUs S WHERE ROS.skuID =  S.id AND ROS.restockOrderID = ?",
            [Id], (err, rows) => {
                if (err)
                    reject(err);
                else {

                    const result = rows.map((row) => ({
                        SKUId: row.SKUId,
                        description: row.description,
                        price: row.price,
                        qty: row.qty,
                    }));
                    resolve(result);
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
                    const result = rows.map((row) => ({
                        SKUId: row.SKUId,
                        rfid: row.rfid,
                    }));

                    resolve(result);
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
        db.all("SELECT SKUId, S.RFID as rfid FROM SKUItems S, TestResults TR, RestockOrderSKUItems SR WHERE S.RFID = SR.RFID AND SR.restockOrderID = ? AND TR.RFID = S.RFID AND TR != 0", [Id], (err, rows) => {
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

exports.addRestockOrderSKUItems = (id, skuItems) => { }
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

///////////////////////////////////////////////////
/*************** Return Order ********************/
///////////////////////////////////////////////////

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
    return new Promise((resolve, reject) => {
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

        db.run("INSERT INTO ReturnOrdersProducts (SKUId,description,price,RFID,ReturnOrderID) VALUES (?,?,?,?,?)", [product.SKUId, product.description, product.price, product.RFID, id], function (err) {
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
            [id, returnDate, restockOrderId], function (err) {
                if (err)
                    reject(err);
                else
                    for (product in products) {
                        let s = ReturnOrder.insertProductsInRO(id, product);
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



