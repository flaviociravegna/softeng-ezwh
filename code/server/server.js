'use strict';

const express = require('express');
const DB = require('./modules/DB');
const user_db = require('./modules/User');
const Position = require('./modules/position_db')
const TestResult = require('./modules/TestResult')
const RestockOrder = require('./modules/RestockOrder');
const ReturnOrder = require('./modules/ReturnOrder');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const { check, validationResult, body } = require('express-validator'); // validation middleware

const bcrypt = require('bcrypt');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

const pos = require('./routes/Position');
//const RetO = require('./routes/ReturnOrder');
//const ResO = require('./routes/RestockOrder');

const app = new express();
const port = 3001;

app.use('/', pos);
//app.use('/', RetO);
//app.use('/', ResO);


dayjs.extend(customParseFormat);

/******** General purpose functions ********/

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }
function CheckifStateValid(State) {
    let VALIDSTATES = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETEDRETURN', 'COMPLETED'];
    return (VALIDSTATES.includes(State));
}
function CheckifTypeValid(type) {
  let VALIDTYPES = ['CUSTOMER', 'QUALITY_EMPLOYEE', 'MANAGER', 'DELIVERY_EMPLOYEE', 'CLERK', 'SUPPLIER'];
  return (VALIDTYPES.includes(type));
}
function CheckifTypeAllowed(type) {
  let VALIDTYPES = ['CUSTOMER', 'QUALITY_EMPLOYEE', 'DELIVERY_EMPLOYEE', 'CLERK', 'SUPPLIER'];
  return (VALIDTYPES.includes(type));
}
function BooleanTranslate(bool) { 
  if (bool == 0) return false;
  return true;
}
 function CheckItems (id,skuid,supplierID,itemList){
   let check = true
  itemList.forEach(i=>{
    if(i.id==id)  check= false;
    else if(i.skuID==skuid&&i.supplierID==supplierID) check= false;
  })
  return check;
}
/*******************************************/

// init express
app.use(express.json());

// GET /api/test
app.get('/api/hello', (req, res) => {
  let message = {
    message: 'Hello World!'
  }
  //console.log("testing");
  return res.status(200).json(message);
});

/**************** SETUP *****************/
/*** Set up Passport ***/
passport.use(new LocalStrategy(
  function(username, password, done) {
      user_db.getUserInfo(username, password).then((user) => {
          if (!user)
              return done(null, false, { message: 'Incorrect username and/or password.' });
          return done(null, user);
      })
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  user_db.getUserInfoById(id)
      .then(user => {
          done(null, user); // available in req.user
      }).catch(err => {
          done(err, null);
      });
}); 
 
// custom middleware
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
      return next();
  }
  return res.status(401).json({ error: 'not authenticated'});
}

// set up the session
app.use(session({
  secret: '- very strong and secret secret -',
  resave: false,
  saveUninitialized: false 
}));

app.use(passport.initialize());
app.use(passport.session());

// activate the server
app.listen(port, () => {
  //console.log(`Server listening at http://localhost:${port}`);
});

/*******************************************/
/**************** SKU APIs *****************/
/*******************************************/
// NB: No authN check at the moment (no error <401 Unauthorized>)

// Return an array containing all SKUs
app.get('/api/skus', async (req, res) => {
  try {
    let skus = await DB.getAllSKU();
    const test_descriptors = await DB.getAllTestDescriptors();

    skus.forEach(sku => { sku.testDescriptors = test_descriptors.filter(td => td.idSKU == sku.id).map(td => td.id) });
    res.status(200).json(skus);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Return a SKU, given its id
app.get('/api/skus/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    let sku = await DB.getSKUById(req.params.id);
    if (sku.error)
      return res.status(404).json(sku);

    const associatedTestDescriptors = await DB.getTestDescriptorsIdBySKUId(sku.id);
    sku.testDescriptors = [...associatedTestDescriptors];
    res.status(200).json(sku);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Creates a new SKU
app.post('/api/sku', [
  check('description').notEmpty(),
  check('weight').isInt({ gt: 0 }),
  check('volume').isInt({ gt: 0 }),
  check('price').isFloat({ gt: 0 }),
  check('notes').notEmpty(),
  check('availableQuantity').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const lastId = await DB.getLastSKUId();
    await DB.createNewSKU(lastId + 1, req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, null, req.body.availableQuantity);

    res.status(201).end();
  } catch (err) {
    res.status(503).send(err);
  }
});

// Modify an existing SKU
// TODO: Check if position is not capable enough in weight or in volume with the inserted newAvailableQuantity
app.put('/api/sku/:id', [
  check('newDescription').notEmpty(),
  check('newWeight').isInt({ gt: 0 }),
  check('newVolume').isInt({ gt: 0 }),
  check('newPrice').isFloat({ gt: 0 }),
  check('newNotes').notEmpty(),
  check('newAvailableQuantity').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    /* TODO: Check position */
    /* if(.....) */

    // Check if the SKU exists
    let sku = await DB.getSKUById(req.params.id);
    if (sku.error)
      return res.status(404).json(sku);

    const result = await DB.modifySKU(req.params.id, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity);
    res.status(200).json(result);
  } catch (err) {
    res.status(503).send(err);
  }
});

// Add or modify position of a SKU
app.put('/api/sku/:id/position', [check('position').exists().notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    //else {
    /* TODO: Check if the position is valid:
    * 1) Validation of position through the algorithm
    * 2) Position isn't capable to satisfy volume and weight constraints for available quantity of sku 
    * 3) Position is already assigned to a sku)
    */
    //}

    // Check if the SKU exists
    let sku = await DB.getSKUById(req.params.id);
    if (sku.error)
      return res.status(404).json(sku);

    //TODO: check if position exists
    if (false)
      return res.status(404).json(sku);

    const result = await DB.addOrModifyPositionSKU(req.params.id, req.body.position);
    res.status(200).json(result);
  } catch (err) {
    res.status(503).send(err);
  }
});

// Delete an SKU
app.delete('/api/skus/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    // Check if the SKU exists
    let sku = await DB.getSKUById(req.params.id);
    if (sku.error)
      return res.status(404).json(sku);

    // If there are still SKU items -> error
    const skuItems = await DB.getSKUItemsBySkuID(req.params.id);
    if (skuItems.length != 0)
      return res.status(422).json({ error: "There are SKU Items connected to the SKU id" });

    await DB.deleteSKU(req.params.id);
    res.status(204).end();
  } catch {
    res.status(503).send(err);
  }
});

/*****************************************/
/************ SKU Items APIs *************/
/*****************************************/

// Return an array containing all SKU Items
app.get('/api/skuitems', async (req, res) => {
  try {
    const skuItems = await DB.getAllSKUItems();
    res.status(200).json(skuItems);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Return an array containing all SKU items for a certain SKUId with Available = 1
app.get('/api/skuitems/sku/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const sku = await DB.getSKUById(req.params.id);
    if (sku.error)
      return res.status(404).json(sku);

    const skuItems = await DB.getSKUItemsBySkuID(req.params.id);
    skuItems.map(si => ({
      RFID: si.RFID,
      SKUId: si.skuID,
      DateOfStock: si.dateOfStock
    }));

    res.status(200).json(skuItems);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Return a SKU item, given its RFID
app.get('/api/skuitems/:rfid', [check('rfid').exists().isNumeric().isLength({ min: 32, max: 32 })], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const skuItem = await DB.getSKUItemByRFID(req.params.rfid);
    if (skuItem == undefined)
      return res.status(404).json(sku);

    res.status(200).json(skuItem);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Creates a new SKU item with Available = 0
// DateOfStock can be null, in the format "YYYY/MM/DD" or in format "YYYY/MM/DD HH:MM"
app.post('/api/skuitem', [
  check('RFID').isNumeric().isLength({ min: 32, max: 32 }),
  check('SKUId').isInt({ gt: 0 }),
  check('DateOfStock').optional({ nullable: true })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    else if (req.body.DateOfStock != null && !CheckIfDateIsValid(req.body.DateOfStock))
      return res.status(422).json({ error: "Invalid date format" });

    // Check if there is an SKU associated to SKUId
    const sku = await DB.getSKUById(req.body.SKUId);
    if (sku.error)
      return res.status(404).json(sku);

    await DB.createNewSKUItem(req.body.RFID, 0, req.body.DateOfStock, req.body.SKUId);
    res.status(201).end();
  } catch (err) {
    res.status(503).send(err);
  }
});

// Modify RFID, available and date of stock fields of an existing SKU Item
app.put('/api/skuitems/:rfid', [
  check('rfid').isNumeric().isLength({ min: 32, max: 32 }),
  check('RFID').isNumeric().isLength({ min: 32, max: 32 }),
  check('newAvailable').isInt({ min: 0, max: 1 }),
  check('newDateOfStock').optional({ nullable: true })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    else if (req.body.newDateOfStock != null && !CheckIfDateIsValid(req.body.newDateOfStock))
      return res.status(422).json({ error: "Invalid date format" });

    // Check if the SKU Item exists
    let skuItem = await DB.getSKUItemByRFID(req.params.rfid);
    if (skuItem.error)
      return res.status(404).json(sku);

    const result = await DB.modifySKUItem(req.params.rfid, req.body.RFID, req.body.newAvailable, req.body.newDateOfStock);

    const oldAvailable = skuItem.available;
    if (req.body.newAvailable == 0 && oldAvailable != req.body.newAvailable)
      await DB.decreaseSKUavailableQuantity(skuItem.skuID);
    else if (req.body.newAvailable == 1 && oldAvailable != req.body.newAvailable)
      await DB.increaseSKUavailableQuantity(skuItem.skuID);

    res.status(200).json(result);
  } catch (err) {
    res.status(503).send(err);
  }
});

// Delete an SKU Item
app.delete('/api/skuitems/:rfid', [check('rfid').isNumeric().isLength({ min: 32, max: 32 })], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    // Check if the SKU Item exists
    let skuItem = await DB.getSKUItemByRFID(req.params.rfid);
    if (skuItem.error)
      return res.status(404).json(skuItem);

    // Delete and then decrease the related availableQuantity in SKU table
    await DB.deleteSKU(req.params.id);
    await DB.decreaseSKUavailableQuantity(skuItem.skuID);

    res.status(204).end();
  } catch {
    res.status(503).send(err);
  }
});



/*******************************************/
/*********** Restock Order APIs  ********/


//Return an array containing all restock orders.
app.get('/api/restockOrders', async (req, res) => {
    try {
      //console.log("getting restock Orders");
      const ROs = await DB.getRestockOrders();
      //console.log("getting restock Orders Products");
      //console.log(ROs);
      //console.log(ROs.length);
      for(let i=0; i<ROs.length; i++){
       // console.log(ROs[i].id + ".getting products");
        ROs[i].products = await DB.getRestockOrderProducts(ROs[i].id);
       // console.log(ROs[i].id + ".getting SkuItems")
        ROs[i].skuItems = await DB.getRestockOrderSkuItems(ROs[i].id);
       // console.log(ROs[i].id + ".Got SkuItems")
        }
         
      const Result = ROs.map((row) => ({
          id: row.id,
          issueDate: row.issueDate,
          state: row.state,
          products: row.products,
          supplierId: row.supplierId,
          transportNote: row.transportNote,
          skuItems: row.skuItems,
      }));

      

      res.status(200).json(Result);

    } catch (err) {
      console.log("Error");

        res.status(500).send(err);
    }


});


//Returns an array of all restock orders in state = ISSUED.
app.get('/api/restockOrdersIssued', async (req, res) => {
    try {
        const ROs = await DB.getRestockOrdersIssued();
        for(let i=0; i<ROs.length; i++){
          ROs[i].products = await DB.getRestockOrderProducts(ROs[i].id);
          //console.log(ROs[i].id + ".getting SkuItems")
          ROs[i].skuItems = await DB.getRestockOrderSkuItems(ROs[i].id);
          //console.log(ROs[i].id + ".Got SkuItems") 
          
        }
        const Result = ROs.map((row) => ({
            id: row.id,
            issueDate: row.issueDate,
            state: row.state,
            products: row.products,
            supplierId: row.supplierId,
            //transportNote: row.transportNote, // ignored by request of the API
            skuItems: row.skuItems,
        }));

        

        res.status(200).json(Result);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Return a restock order, given its id.
app.get('/api/restockOrders/:id', [check('id').exists().isNumeric({ min: 1 })], async (req, res) => {
    try {
        //console.log("step 1");
        const errors = validationResult(req);
        if (!errors.isEmpty()){
          //console.log("Erros");
          return res.status(422).json({ errors: errors.array() });
        }
        //console.log("step 2");
           

        let RO = await DB.getRestockOrderById(req.params.id);
        //console.log("step 3");
        //console.log(RO.error);
        //console.log("*****************************************");
        //console.log(RO);

        if (!RO.id)
            return res.status(404).end();
            //console.log("No Error");
        //console.log("step 4");
        RO.products = await DB.getRestockOrderProducts(RO.id);
        //console.log("step 5");
        RO.skuItems = await DB.getRestockOrderSkuItems(RO.id);
        res.status(200).json(RO);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Return sku items to be returned of a restock order, given its id.
//************************************************** */
// NEED TESTING
//************************************************** */


app.get('/api/restockOrders/:id/returnItems', [check('id').exists().isNumeric({ min: 1 })], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let ROs = await DB.getRestockOrderById(req.params.id);
        //console.log(ROs);

        if(ROs.error)
          return res.status(404).end();

        

        if (ROs.state != 'COMPLETEDRETURN')
          return res.status(422).json();
        //console.log("geting items");
        let Items = await DB.getRestockOrderFailedSKUItems(req.params.id);
        //console.log("got items");
        res.status(200).json(Items);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Creates a new restock order in state = ISSUED with an empty list of skuItems.
// not sure constraints on supplier ID
// not sure how to acces issueDate
// assuming supplier exist for now
app.post('/api/restockOrder', [check('issueDate').optional({ nullable: true }), check('products').optional({ nullable: true }), check('supplierId').isNumeric()], async (req, res) => {
    try {
       //console.log("Checking Validation");
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            //console.log(errors);
            return res.status(422).json({ errors: errors.array() });
        }
      
        //check date validity
        
        else if (req.body.issueDate != null && !CheckIfDateIsValid(req.body.issueDate)){
            return res.status(422).json({ error: "Invalid date format" });
        }
        //console.log("Passed Validation");
        const Id =  await DB.getLastIdRsO();
        await DB.createRestockOrder(req.body.issueDate, req.body.products, req.body.supplierId,Id + 1 );
        res.status(201).end();

    } catch (err) {
        res.status(500).send(err);
    }


});


//Modify the state of a restock order, given its id.
app.put('/api/restockOrder/:id', [check('id').isNumeric()], async (req, res) => {
    console.log("In PUT newState");
    try {
        const errors = validationResult(req);
        console.log("checking errors");
        if (!errors.isEmpty()){
          console.log("In Errors");
          return res.status(422).json({ errors: errors.array() });
        }
            
        else if (req.body.newState == null || !CheckifStateValid(req.body.newState)){
          console.log("Problem With newState");
          return res.status(422).json({ error: "Invalid State" });
        }
            
        else {
            console.log("checking if ROS exists");
            let RO = await DB.getRestockOrderById(req.params.id);
            console.log("Got ROs");
            if (!RO)
                return res.status(404).json({ error: "Not Found" });
        }
        console.log("Modifiying state");
        await DB.modifyRestockOrderState(req.params.id, req.body.newState);
        console.log("Modified new state");
         res.status(200).end();

    }
    catch (err) {

        res.status(500).send(err);
    }
});


//Add a non empty list of skuItems to a restock order, given its id. If a restock order has already a non empty list of skuItems, merge both arrays
app.put('/api/restockOrder/:id/skuItems', [check('id').isNumeric(), check('skuItems').notEmpty()], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else {
            let RO = await DB.getRestockOrderById(req.params.id);

            if (RO.error)
                return res.status(404).json({ error: "Not Found" });
           // console.log(RO);
            if (RO.state != 'DELIVERED')
                return res.status(422).json({ error: "Unprocessable Entity" });
        }

        await DB.addRestockOrderSKUItems(req.params.id, req.body.skuItems);
        res.status(200).end();

    }
    catch (err) {

        res.status(500).send(err);
    }


});


//Add a transport note to a restock order, given its id.
app.put('/api/restockOrder/:id/transportNote', [check('id').isNumeric({ min : 1}), check('transportNote').notEmpty()], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        let ROs= await DB.getRestockOrderById(req.params.id);
        
        if(ROs.error){
          return  res.status(404).json({ error:" No restock Order Found)" }).end();
        }

        if (ROs.state != 'DELIVERY'){
          return res.status(422).json({ error: "unprocessable Entity" });
        }
        
        //console.log("state: " + ROs.state);
        if (!CheckIfDateIsValid(req.body.transportNote.deliveryDate))
            return res.status(422).json({ error: "unprocessable Entity" });
        ///////////
        /////////missing check if date is in correct oreder
        /////////

        console.log("putting note");
        await DB.addRestockOrderTransportNote(req.params.id, req.body.transportNote);
        console.log("Done");
        res.status(204).end();

    }
    catch (err) {

        res.status(503).send(err);
    }



});


//Delete a restock order, given its id.
app.delete('/api/restockOrder/:id', [check('id').isNumeric()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else {
            let RO = await DB.getRestockOrderById(req.params.id);
            if (RO.error)
                return res.status(422).json({ error: "Not Found" });
        }

        
        await DB.deleteSkuItemsFromRestockOrder(req.params.id);
        await DB.deleteProductsFromRestockOrder(req.params.id);
        await DB.deleteRestockOrder(req.params.id);
        res.status(204).end();

    }
    catch (err) {

        res.status(503).send(err);
    }

});

/*********** Return Order APIs  ********/
//Return an array containing all return orders.
app.get('/api/returnOrders', async (req, res) => {
    try {
        //console.log("step1");
        const RO = await DB.getReturnOrders();
        //console.log("step2");
        
        for(let i=0; i< RO.length; i++){
         // console.log("step3");
          RO[i].products= DB.getReturnOrderProducts(RO[i].id);
        }
        //console.log(RO);
        res.status(200).json(RO);
    }
    catch (err) {
        res.status(500).send(err);
    }
});


//Return a return order, given its id.
app.get('/api/returnOrders/:id', [check('id').isNumeric()], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            res.status(422).json({ erros: errors.array() });

        //console.log("step1");
        let RO = await DB.getReturnOrderById(req.params.id);
        if (RO.error){
          return res.status(404).json({ error: "Not Found" });
        }
       
        RO.products = await DB.getReturnOrderProducts(RO.id);

        res.status(200).json(RO);;

    }
    catch (err) {

        res.status(500).send(err);
    }


});


//Creates a new return order.

app.post('/api/returnOrder', [
    check('returnDate').notEmpty(),
    check('products').notEmpty(),
    check('restockOrderId').isNumeric({ gt: -1 })
], async (req, res) => {

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()){
          return res.status(422).json({ erros: errors.array() });
        }else {
          
            let RO = await DB.getRestockOrderById(req.body.restockOrderId);
            if (RO.error) {
                return res.status(404).json({ error: "no RestockOrder associated to restockOrderID " });
            }

            if (!CheckIfDateIsValid(req.body.returnDate))
                return res.status(422).json({ error: "wrong date format"});

            let id= await DB.getLastReturnOrderId();    
            let temp= await DB.createNewReturnOrder(req.body.returnDate, req.body.restockOrderId, id+1);
        
            console.log("created new order");
            console.log(temp);
            
            if(temp.error)
             return res.status(503).send(err);

            for(let i=0; i< req.body.products.length; i++){
                console.log("inserting Products");
                temp= await DB.insertProductInRO(req.body.products[i], id+1);
                if(temp.error){
                  console.log("error inserting product" + i );
                  res.status(504);
                }
               
            }
            
        }
        res.status(201).end();

    }
    catch (err) {
        //console.log("We got an error");
        res.status(503).send(err);
    }

});


//Delete a return order, given its id.
app.delete('/api/returnOrder/:id', [check('id').isNumeric()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ erros: errors.array() });
        else {
            let RO = await DB.getReturnOrderById(req.params.id);
            if (RO.error)
                return res.status(422).json({ error: "Not Found" });
        }

        await DB.deleteReturnOrderProducts(req.params.id);
        await DB.deleteReturnOrder(req.params.id);
        
        res.status(204).end();

    }
    catch (err) {

        res.status(503).send(err);
    }

});



/**************** USER APIs *****************/
/*******************************************/

// POST (login)
app.post('/api/managerSessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
      if (err)
          return next(err);
      if (!user) 
          return res.status(401).json(info); 
  
      req.login(user, (err) => {
          if (err)
              return next(err);
          return res.json(req.user); 
      });
  })(req, res, next);
});

app.post('/api/customerSessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
      if (err)
          return next(err);
      if (!user) 
          return res.status(401).json(info); 
      req.login(user, (err) => {
          if (err)
              return next(err);
          
          return res.json(req.user); 
      });
  })(req, res, next);
});

app.post('/api/supplierSessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
      if (err)
          return next(err);
      if (!user) {
          return res.status(401).json(info); 
      }
      req.login(user, (err) => {
          if (err)
              return next(err);
          
          return res.json(req.user); 
      });
  })(req, res, next);
});

app.post('/api/clerkSessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
      if (err)
          return next(err);
      if (!user) {
          return res.status(401).json(info); 
      }
      req.login(user, (err) => {
          if (err)
              return next(err);
          
          return res.json(req.user); 
      });
  })(req, res, next);
});

app.post('/api/qualityEmployeeSessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
      if (err)
          return next(err);
      if (!user) {
          return res.status(401).json(info); 
      }
      req.login(user, (err) => {
          if (err)
              return next(err);
          
          return res.json(req.user); 
      });
  })(req, res, next);
});

app.post('/api/deliveryEmployeeSessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
      if (err)
          return next(err);
      if (!user) {
          return res.status(401).json(info); 
      }
      req.login(user, (err) => {
          if (err)
              return next(err);
          
          return res.json(req.user); 
      });
  })(req, res, next);
});

// Return an array containing all users excluding managers
app.get('/api/users', async (req, res) => {
  try {
    let users = await user_db.getAllUsersExceptManagers();

    const users_array = users.map((row) => ({
      id: row.userId,
      name: row.name,
      surname: row.surname,
      email: row.username,
      type: row.type
    }));
    
    res.json(users_array);
  }
  catch (err) {
    res.status(500).end();
  }
});

// Return an array containing all suppliers.
app.get('/api/suppliers', async (req, res) => {
  try {
    let suppliers = await user_db.getAllSuppliers();

    const suppliers_array = suppliers.map((row) => ({
      id: row.userId,
      name: row.name,
      surname: row.surname,
      email: row.username,
    }));
    
    res.json(suppliers_array);
  }
  catch (err) {
    res.status(500).end();
  }
});

// DELETE (logout)
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// CREATE NEW USER
app.post('/api/newUser', [ 
  check('name').isString(),
  check('surname').isString(),
  check('username').isEmail(),
  check('type').custom( val => {
    return CheckifTypeValid(val);
  }),
  check('password').isString().isLength({ min: 8 }),
  ] ,async (request , response) => {

    const errors = validationResult(request);
    if(!errors.isEmpty())
      return response.status(422).json({errors: errors.array()});

    try {
      // Set the id
      let max_id = await user_db.searchMaxID();
        if(max_id === null) 
            max_id = 1;
        else
            max_id++;

      // Encrypt password
      const hash = await bcrypt.hash(request.body.password, 10);
    
      const new_user = {
        id: max_id,
        username: request.body.username,
        name: request.body.name,
        surname: request.body.surname,
        hash: hash,
        type: request.body.type,
      };
      
      await user_db.createNewUser(new_user);
      response.status(201).end();
      
    }
    catch (err) {
      if (err.errno == 19)
        response.status(409).json({ error: `Username ${request.body.username} already exist.`}); //username already exists
      else
        response.status(503).end();
    }
});

// MODIFY rights of a user, given its username
app.put('/api/users/:username', [
  check('username').isEmail(),
  check('oldType').custom( val => {
    return CheckifTypeValid(val);
  }),
  check('newType').custom( val => {
    return CheckifTypeValid(val);
  })
], async (req, res) => {
  try {
    // Check parameters
    const errors = validationResult(req);

    if (!errors.isEmpty()){
      return res.status(422).end();
    }

    // Check if the User exists
    let user = await user_db.getUserByUsernameAndType(req.params.username, req.body.oldType);
    if (user.length == 0)
      return res.status(404).end(); //user not found

    const result = await user_db.modifyUserRights(req.params.username, req.body.oldType, req.body.newType);
    res.status(200).json(result);

  } catch (err) {
    res.status(503).send(err);
  }
});

// DELETE the user identified by username (email) and type.
app.delete('/api/users/:username/:type', [ 
    check('username').isEmail(),
    check('type').custom( val => {
      return CheckifTypeAllowed(val);
      }) 
    ], async (request , response) => {

  const errors = validationResult(request);
  if(!errors.isEmpty())
    return response.status(422).json({errors: errors.array()});

  try {
      await user_db.deleteUser(request.params.username, request.params.type);
      response.status(204).end();
  }
  catch (err) {
      response.status(503).json({ error: `Database error while deleting: ${request.params.username}.`});
  }
});


/************* END Users API ***************/
/******************************************/



/************* TestResult APIs ****************/
/**********************************************/

// Return an array containing all testResults for a SKUItem
app.get('/api/skuitems/:rfid/testResults', [
        check('rfid').isNumeric().isLength({ min: 32, max: 32 })
    ], async (req, res) => {
    try {
      // Check parameter
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).end();

      //Check if SKU Item exists
      const skuItem = await DB.getSKUItemByRFID(req.params.rfid);
      if (skuItem.error)
        return res.status(404).end(); //skuItem not found

      let testResults = await TestResult.getAllTestResultByRFID(req.params.rfid);

      const testResult_array = testResults.map((row) => ({
        id: row.id,
        date: row.date,
        result: BooleanTranslate(row.result),
        idTestDescriptor: row.idTestDescriptor,
      }));
      
      res.json(testResult_array);
    }
    catch (err) {
      res.status(500).end();
    }
});

// Return a Test Result given a RFID and Test Id.
app.get('/api/skuitems/:rfid/testResults/:id', [
  check('rfid').isNumeric().isLength({ min: 32, max: 32 }),
  check('id').isInt()
], async (req, res) => {
    try {
        // Check parameter
        const errors = validationResult(req);
        if (!errors.isEmpty())
          return res.status(422).end();

        //Check if SKU Item exists
        const skuItem = await DB.getSKUItemByRFID(req.params.rfid);
        if (skuItem.error)
          return res.status(404).end(); //skuItem not found

        let testResults = await TestResult.getTestResultById(req.params.rfid, req.params.id);
        if (testResults.error)
          return res.status(404).json({ error: "Test Results not found" }); //testResult not found

        const result = {
            id: testResults.id,
            date: testResults.date,
            result: BooleanTranslate(testResults.result),
            idTestDescriptor: testResults.idTestDescriptor,
        };

        res.json(result);
    }
      catch (err) {
        res.status(500).end();
      }
});

// CREATE NEW TEST Result
app.post('/api/skuitems/testResult', [ 
  check('rfid').isString().isLength({ min: 32, max: 32}),
  check('idTestDescriptor').isInt(),
  check('result').isBoolean()
  ] ,async (req , res) => {
    
    const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        //check date validity
        else if (!CheckIfDateIsValid(req.body.date))
            return res.status(422).json({ error: "Invalid date format" });

    try {
    
      //Check if SKU Item exists
      const skuItem = await DB.getSKUItemByRFID(req.body.rfid);
      if (skuItem.error)
        return res.status(404).json({ error: "SKUItem not found" });

      //Check if TestDescriptor exists
      const test_descriptor = await DB.getTestDescriptorsIdById(req.body.idTestDescriptor);
      if (test_descriptor.error)
        return res.status(404).json({ error: "Test Descriptor not found" }); //test_descriptor not found

      //set max id
      let max_id = await TestResult.searchMaxID();
        if(max_id === null) 
            max_id = 1;
        else
            max_id++;

      const new_testResult = {
        id: max_id,
        date: req.body.date,
        result: req.body.result,
        rfid: req.body.rfid,
        idTestDescriptor: req.body.idTestDescriptor
      };
      
      await TestResult.createNewTestResult(new_testResult);
      res.status(201).end();
      
    }
    catch (err) {
      res.status(503).end();
    }
});

// MODIFY a test Result identified by id for a certain sku item identified by RFID.
app.put('/api/skuitems/:rfid/testResult/:id', [
  check('rfid').isString().isLength({ min: 32, max: 32}),
  check('id').isInt(),
  check('newIdTestDescriptor').isInt(),
  check('newResult').isBoolean()
], async (req, res) => {
  try {
    // Check parameters
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).end();
    else if (!CheckIfDateIsValid(req.body.newDate))
      return res.status(422).json({ error: "Invalid date format" });
    
    //Check if SKU Item exists
    const skuItem = await DB.getSKUItemByRFID(req.params.rfid);
      if (skuItem.error)
        return res.status(404).json({ error: "SKUItem not found" });

    // Check if the TestResult exists
    const testResults = await TestResult.getTestResultById(req.params.rfid, req.params.id);
      if (testResults.error)
        return res.status(404).json({ error: "Test Results not found" }); //testResult not found

    //Check if TestDescriptor exists
    const test_descriptor = await DB.getTestDescriptorsIdById(req.body.newIdTestDescriptor);
      if (test_descriptor.error)
        return res.status(404).json({ error: "Test Descriptor not found" }); //test_descriptor not found

    const result = await TestResult.modifyTestResult(req.params.id, req.body.newIdTestDescriptor, req.body.newResult, req.body.newDate);
    res.status(200).json(result);
    
  } catch (err) {
    res.status(503).send(err);
  }
});

// DELETE a test result, given its id for a certain sku item identified by RFID
app.delete('/api/skuitems/:rfid/testResult/:id', [ 
  check('rfid').isString().isLength({ min: 32, max: 32}),
  check('id').isInt()
  ], async (request , response) => {

  const errors = validationResult(request);
  if(!errors.isEmpty())
    return response.status(422).json({errors: errors.array()});

  try {
      await TestResult.deleteTestResult(request.params.rfid, request.params.id);
      response.status(204).end();
  }
  catch (err) {
      response.status(503).json({ error: `Database error while deleting: ${request.params.id}.`});
  }
});

/**************** INTERNAL ORDER *****************/

app.get('/api/internalOrders',async (req,res)=>{
try {
    let internalOrders = await DB.getAllInternalOrders();
    let InternalOrdersProduct = await DB.getAllInternalOrdersProduct();
    let InternalOrdersSKUItems = await DB.getAllInternalOrdersSKUItems();
  internalOrders.forEach(io => {if(io.state != "COMPLETED"){
     //console.log("state is not COMPLETED.");
    io.products=InternalOrdersProduct.filter(ip => ip.internalOrderID == io.id).map(ip => ip);
  }
  else{
     //console.log("state is COMPLETE.");
     io.products=InternalOrdersSKUItems.filter(is => is.internalOrderID == io.id).map(is => is);
  }})
    res.status(200).json(internalOrders);
  } catch (err) {
    res.status(500).end();
  }
});

app.get('/api/internalOrdersAccepted',async (req,res)=>{
  try {
      let internalOrders = await DB.getInternalOrderByState("ACCEPTED");
      // console.log(internalOrders);
      res.status(200).json(internalOrders);
    } catch (err) {
      res.status(500).end();
    }
  });

app.get('/api/internalOrdersIssued',async (req,res)=>{
  try {
      let internalOrders = await DB.getInternalOrderByState("ISSUED");
      // console.log(internalOrders);
      res.status(200).json(internalOrders);
    } catch (err) {
      res.status(500).end();
    }
  });

  app.get('/api/internalOrders/:id',async (req,res)=>{
    try {
        let internalOrders = await DB.getInternalOrderById(req.params.id);
        if (internalOrders.error) res.status(404).json(internalOrders);

        let InternalOrdersProduct = await DB.getInternalOrdersProductById(req.params.id);
        let InternalOrdersSKUItems = await DB.getInternalOrdersSKUItemById(req.params.id);
        
        if(internalOrders.state != "COMPLETED"){
          internalOrders.products=[...InternalOrdersProduct];
       }
       else{
          internalOrders.products=[...InternalOrdersSKUItems];
       }
         res.status(200).json(internalOrders);
       } catch (err) {
         res.status(500).end();
       }
    });

    app.post('/api/internalOrders', async (req, res) => {
      try {
        
         //Verify whether the product is available in the DB
         for(let p of req.body.products){
           console.log(p.SKUId);
          let product = await DB.getInternalOrdersProductBySKUId(p.SKUId);
           if (product.error){
             console.log(product);
             res.status(404).end();
           }
          }
        const lastId = await DB.getLastInternalOrderId()
        const result = await DB.createNewInternalOrder(lastId + 1, req.body.issueDate,"ISSUED", req.body.customerId);
        
        res.status(201).json(result);
      } catch (err) {
        res.status(503).end();
      }
    });

  
    
      app.put('/api/internalOrders/:id',async (req,res)=>{
        try {
      
          let internalOrder = await DB.getInternalOrderById(req.params.id);

          if (internalOrder.error)
            res.status(404).json(internalOrder);
          if(req.body.newState=="COMPLETED"){
            for(const p of req.body.products){
          const SI = await DB.modifyInternalOrderSKUItems(req.params.id,p.RFID);
          }}
          const result = await DB.modifyInternalOrder(req.params.id, req.body.newIssueDate,req.body.newState,req.body.newCustomerId);
          res.status(200).json(result);
        } catch (err) {
          res.status(503).end();
        }
        });

      app.delete('/api/internalOrders/:id',async (req,res)=>{
        try {
          await DB.deleteInternalOrderByID(req.params.id);
          res.status(204).end();
        } catch {
          res.status(503).end();
        }
        });
      
        /**************** ITEMS *****************/

      app.get('/api/items',async (req,res)=>{
        try {
            let items = await DB.getAllItems();
            res.status(200).json(items);
          } catch (err) {
            res.status(500).end();
          }
        });

      
      app.get('/api/items/:id',async (req,res)=>{
        try {
            let items = await DB.getItemsById(req.params.id);
             res.status(200).json(items);
            } catch (err) {
             res.status(500).end();
          }
         });


         app.post('/api/items',async (req,res)=>{
          try {
            
            let itemList =await DB.getAllItems();
           if(CheckItems(req.body.id,req.body.SKUId,req.body.supplierId,itemList)!=true){ 
             res.status(422).json(
               { 
               errors: "This supplier already sells an item with the same SKUId or supplier already sells an Item with the same ID." 
            }
            );
          }
            else{
              let items = await DB.createNewItem(req.body.id,req.body.price,req.body.SKUId,req.body.supplierId,req.body.description)
              res.status(201).json(items);}
            }
             catch (err) {
              res.status(503).end();
            }
          });

          app.put('/api/items/:id',async (req,res)=>{
            try {
      
              let item = await DB.getItemsById(req.params.id);
              if (item.error)
                res.status(404).json(item);
          
              const result = await DB.modifyItem(req.params.id, req.body.newPrice,req.body.newSKUId,req.body.newSupplierId,req.body.newDescription);
              res.status(200).json(result);
            } catch (err) {
              res.status(503).end();
            }
             });

            app.delete('/api/items/:id',async (req,res)=>{
              try {
                let item = await DB.getItemsById(req.params.id);
              if (item.error)
                res.status(404).json(item);
                await DB.deleteItemsByID(req.params.id);
                res.status(204).end();
              } catch {
                res.status(503).end();
              }
            });

module.exports = app;
