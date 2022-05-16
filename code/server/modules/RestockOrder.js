'use strict';

const sqlite = require('sqlite3');

// open the database 
const db = new sqlite.Database('ezwh.db', (err) => {
    if (err) throw err;
});

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
