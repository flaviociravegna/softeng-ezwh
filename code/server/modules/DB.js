'use strict';

const sqlite = require('sqlite3');
const SKU = require('./SKU');
const SKUItem = require('./SKUItem')
const RestockOrder = require('./RestockOrder');
const ReturnOrder = require('./ReturnOrder');
const TestDescriptor = require('./TestDescriptor');
const InternalOrder = require('./InternalOrder');
const Product = require('./Product');
const Item=require('./Item');
const InternalOrdersSKUItem = require('./InternalOrdersSKUItem');
const { reject } = require('bcrypt/promises');
const res = require('express/lib/response');
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
            //console.log(row);
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
//
exports.getRestockOrderProducts =(id) =>{
    //console.log("THIS IS JUST A TEST");
    //console.log("ID:"+id);
    return new Promise((resolve, reject) => {
        //console.log("getting products");
        db.all("SELECT * FROM RestockOrdersProducts RoS WHERE RoS.restockOrderID = ?",
            [id], (err, rows) => {
                //console.log(rows);
                //console.log("------------------------");
                if(rows== undefined){
                    resolve([]);
                }
                if (err){
                    console.log(err);
                    reject(err);
                }
        
                else {
                   // console.log(rows);
                    resolve(rows);
                }
            });
    });

}


exports.getRestockOrderSkuItems = (id) => {
    //console.log("ID:"+ id);
    return new Promise((resolve,reject)=>{
        //console.log("In Promise:"+ id);
        db.all("SELECT S.RFID, S.skuID FROM RestockOrdersSKUItems ROS, SKUItems S WHERE S.RFID=ROS.RFID AND ROS.restockOrderID = ?",
        [id], (err,rows)=>{
            //console.log("in query:"+ id);
            //console.log(rows);
            if(rows== undefined)
                resolve([]);
            if(err){
                //console.log("In Error:"+ id);
                reject(err);
            }else{
                //console.log("In Resolve:"+ id);
                resolve(rows);
            }
        });
       
    });
}


exports.getRestockOrders = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM RestockOrders", [], (err, rows) => {
            if (err){
                //console.log(err);
                reject(err);
            }    
            else {
                //console.log("mapping");
                const RestockOrders = rows.map(RO => new RestockOrder(RO.id, RO.issueDate, RO.state, RO.SupplierId, RO.transportNote));
                /*for (let RO in RestockOrders) {
                    RO.products = this.getProducts(RO.id);
                    RO.skuItems = this.getSKUItems(RO.id);
                   // if (!RO.products.isArray() || RO.products.error || !RO.skuItems.isArray() || RO.skuItems.error)
                       // reject(Error());
                }*/
                //console.log(RestockOrders);
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
                const RestockOrders = rows.map(RO => new RestockOrder(RO.id, RO.issueDate, RO.state, RO.SupplierId, RO.transportNote));
               /* for (let RO in RestockOrder) {
                    RO.products = db.getProducts(RO.id);
                    RO.skuItems = db.getSKUItems(RO.id);
                   // if (!RO.products.isArray() || RO.products.error || !RO.skuItems.isArray() || RO.skuItems.error)
                   //     reject(Error());
                }*/

                resolve(RestockOrders);
            }
        });

    });
}


exports.getRestockOrderById = (Id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM RestockOrders WHERE id = ?", [Id], (err, row) => {
            //console.log("qued ROS");
            if (err)
                reject(err);
            else {
                console.log(row);
                if(row == undefined){
                    //console.log("going back");
                    resolve({error : 'error'});
                }
                    
              else{
                 let RO = new RestockOrder(row.id, row.issueDate, row.state, row.SupplierId, row.transportNote);
                resolve(RO); 
              }
               
            }
        });
    });
}


exports.getRestockOrderFailedSKUItems = (id) => {
    return new Promise((resolve, reject) => {
        //console.log("in query");
        db.all("SELECT S.skuID, SR.RFID FROM TestResults TR, SKUItems S, RestockOrdersSKUItems SR WHERE S.RFID = SR.RFID AND TR.RFID = S.RFID AND SR.restockOrderID = ?", [id], (err, rows) => {
            if (err){
                //console.log("Error");
                reject(err); 
            }
            
            if(rows == undefined){
                resolve([]);
            }    
            else {
                resolve(rows);
            }
        });
    });
}

exports.getLastPIDInOrder = (id)=>{
        return new Promise((resolve,reject)=>{
            db.get("SELECT id  FROM RestockOrdersProducts WHERE restockOrderID = ? ORDER BY id DESC LIMIT 1", [id], (err, row) => {
                if (err){
                   reject(err);
                }
    
                else
                    {
                    resolve (row == undefined ? 0 : row.id);
                    }
                    
            });
        });
        //console.log("getting PIDI");
        

}

exports.insertProductInOrder=(id, product, PId) =>{
    return new Promise((resolve, reject) => {
        
        db.run("INSERT INTO RestockOrdersProducts (restockOrderId, skuID, quantity, id) VALUES (?,?,?,?)", [id, product.SKUId, product.qty, PId], function (err) {
            if (err){
                console.log(err);
                reject(err);
            }
                

            else resolve('done');
        });

    });

}

exports.getLastIdRsO = () => {
    //console.log("getting largest id");
    return new Promise((resolve, reject) => {
        //console.log("QUERY");
        db.get("SELECT id FROM RestockOrders ORDER BY id DESC LIMIT 1", [], (err, row) => {
            
            if (err){
               //console.log(err);
                reject(err); 
            }
            else
                resolve(row == undefined ? 0 : row.id);
        });

    });

}

//need to create an entry for each item in the corresponding table.
// need to see where to put product description consider creating a class product
exports.createRestockOrder = (issueDate, products, supplierId,id) => {
    //console.log("CreateRestockOrder");
    try{
        return new Promise((resolve, reject) => {
        //console.log("creating id");
       // id = db.getLastId() + 1;
        //console.log(id);
        //console.log("inserting restockOrder"); 
        db.run("INSERT INTO RestockOrders (id, issueDate, state, supplierID) VALUES (?, ?, ?, ?)",
            [id, issueDate, 'ISSUED', supplierId], function (err) {
                if (err){
                    //console.log(err);
                    reject(err);
                }   
                else
        
                resolve('New RestockOrder inserted');
            }
        );
    });
    }catch{
        res.status(500);
    }
    
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
    //console.log("In Modify newState");
    //console.log(id + newState);
    return new Promise(async (resolve, reject) => {
        //console.log("In Promise");
        db.run("UPDATE RestockOrders SET State = ? WHERE id = ?",
            [newState, id], function (err) {
                //console.log("did Query");
                if (err)
                    reject(err);
                else
                    resolve();
            });
    });
}

exports.addRestockOrderSKUItems = (id, skuItems) => { }
//exports.issueRestockOrder = (id) => {}
//not requested by API

// for now Transport note is A string should fix it to have it in its own table
exports.addRestockOrderTransportNote = (id, transportNote) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE RestockOrders SET TransportNote = ? WHERE id = ?",
            [JSON.stringify(transportNote), id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve('RequestOrders updated');
            });
    });
};
exports.deleteRestockOrder = (id) => {
    return new Promise((resolve,reject) => {
        db.run("DELETE FROM RestockOrders WHERE id = ?",[id], function (err) {
            if (err)
                reject(err);
            else 
                resolve('deleted Restock Order');   
        });
    });
        
};


exports.deleteSkuItemsFromRestockOrder =(id)=>{
    //console.log("started query");
    return new Promise((resolve, reject)=>{
        db.run("DELETE FROM RestockOrdersSKUItems WHERE restockOrderID = ?",
             [id], function (err) {
        if (err){
            console.log(err);
            reject(err);
        }
            
        else
             resolve('Deleted');
        });

    });

}
exports.deleteProductsFromRestockOrder = (id) => {
    return new Promise((resolve, reject) => {
        //console.log("started query");
        db.run("DELETE FROM RestockOrdersProducts WHERE restockOrderID = ?",
             [id], function (err) {
        if (err){
            console.log(err);
            reject(err);
        }
            
        else
             resolve('Deleted');
        });

    });
    
}

///////////////////////////////////////////////////
/*************** Return Order ********************/
///////////////////////////////////////////////////

//gets all returnOrders
exports.getReturnOrders = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM ReturnOrders', [], (err, rows) => {
            if(rows== undefined)
             resolve([]);
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
        db.get('SELECT * FROM ReturnOrders WHERE id = ?', [id], (err, row) => {
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'ReturnOrder not found.' });
            else {
                    let RO = new ReturnOrder(row.id,row.returnDate,row.restockOrderID);
                resolve(RO);
            }
        });
    });

}

exports.getReturnOrderProducts= (id) =>{
    return new Promise((resolve,reject)=>{
        db.all('SELECT * FROM ReturnOrdersProducts WHERE ReturnOrderID = ?',[id],(err,rows)=>{
            if(err)
                reject(err);
            if(rows==undefined)
                resolve([]);
            else
                resolve(rows)
        });
    });

}

//gets las ReturnOrderId
exports.getLastReturnOrderId= () =>{

    return new Promise((resolve, reject) => {
       
        db.get("SELECT id FROM ReturnOrders ORDER BY id DESC LIMIT 1", [], (err, row) => {
            
            if (err){
                console.log(err);
                reject(err); 
            }
            else
                resolve(row == undefined ? 0 : row.id);
        });

    });


}

exports.insertProductInRO = (product,id) => {

    return new Promise((resolve, reject) => {
        if(id==undefined){
             resolve({error:'id problem'})
        }
           

        db.run("INSERT INTO ReturnOrdersProducts (SKUId,description,price,RFID,ReturnOrderID) VALUES (?,?,?,?,?)", [product.SKUId, product.description, product.price, product.RFID, id], function (err) {
            if (err) {
                console.log(err);
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
                if (err){
                    console.log(err);
                    reject(err);
                }
                    
                else
                    resolve({done:'New ReturnOrder inserted'});
            });
    });

}
//exports.commitReturnOrder = (id) => {}
// not asked by API

//delete returnOrder given its ID
exports.deleteReturnOrder = (id) => {
    return new Promise((resolve, reject)=>{
        db.run("DELETE FROM ReturnOrders WHERE id = ?",
             [id], function (err) {
        if (err)
            reject(err);
        else
             resolve('ReturnOrder Deleted');
        });

    });
    
};
exports.deleteReturnOrderProducts=(id)=>{
    return new Promise((resolve, reject)=>{
        db.run("DELETE FROM ReturnOrdersProducts WHERE ReturnOrderID = ?",
             [id], function (err) {
        if (err)
            reject(err);
        else
             resolve('ReturnOrderProducts Deleted');
        });

    });
}







