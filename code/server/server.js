'use strict';

const express = require('express');
const DB = require('./modules/DB');
const user_db = require('./modules/User');
const Position = require('./modules/Position')
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


const app = new express();
const port = 3001;

dayjs.extend(customParseFormat);

/******** General purpose functions ********/

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }
function CheckifStateValid(State) {
    let VALIDSTATES = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETEDRETURN', 'COMPLETED'];
    return (State in VALIDSTATES);
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
/*******************************************/

// init express
app.use(express.json());

// GET /api/test
app.get('/api/hello', (req, res) => {
  let message = {
    message: 'Hello World!'
  }
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
  console.log(`Server listening at http://localhost:${port}`);
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

/*********** Restock Order APIs  ********/


//Return an array containing all restock orders.
app.get('/api/restockOrders', async (req, res) => {
    try {
        const RestockOrders = await RestockOrder.getRestockOrders();
        res.status(200).json(RestockOrders);
    } catch (err) {
        res.status(500).send(err);
    }


});


//Returns an array of all restock orders in state = ISSUED.
app.get('/api/restockOrdersIssued', async (req, res) => {
    try {
        const RestockOrders = await RestockOrder.getRestockOrdersIssued();
        res.status(200).json(RestockOrders);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Return a restock order, given its id.
app.get('/api/restockOrders/:id', [check('id').exists().isInt({min:1})], async (req, res) => {
    try {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(422).json({ errors: errors.array() });

        let RO = await RestockOrder.getRestockOrderById(req.params.id);
            if (RO.error)
                return res.status(404).json(RO);

            res.status(200).json(RO);
        } catch (err) {
            res.status(500).send(err);
        }

});


//Return sku items to be returned of a restock order, given its id.
app.get('/api/restockOrders/:id/returnItems', [check('id').exists().isInt({ min: 1 })],async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let state = RestockOrder.getRestockOrderState(req.params.id);

        if (state == null || state.isEmpty() || state != 'COMPLETEDRETURN')
            return res.status(422).json();

        let Items = await RestockOrder.getRestockOrderFailedSKUItems(req.params.id);

        if (Items.error)
            return res.status(404).json(Items);

        res.status(200).json();
    } catch (err) {
        res.status(500).send(err);
    }

});


//Creates a new restock order in state = ISSUED with an empty list of skuItems.
// not sure constraints on supplier ID
// not sure how to acces issueDate
// assuming supplier exist for now
app.post('/api/restockOrder', [check('issueDate').optional({nullable: true}), check('products').optional({ nullable: true }), check('supplierId').isNumeric()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        //check date validity
        else if (req.body.issueDate != null && !CheckIfDateIsValid(req.body.issueDate))
            return res.status(422).json({ error: "Invalid date format" });
       
        await RestockOrder.createRestockOrder(req.body.issueDate, req.body.products, req.body.supplierId);
        res.status(201).end();

    } catch (err) {
        res.status(500).send(err);
    }


});


//Modify the state of a restock order, given its id.
app.put('/api/restockOrder/:id', [check('id').isNumeric()], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else if (req.body.newState == null || !CheckifStateValid(req.body.newState))
            return res.status(422).json({ error: "Invalid State" });
        else {
            let RO = await RestockOrder.getRestockOrderById(req.params.id);
            if (RO == null)
                return res.status(404).json({ error: "Not Found" });
        }

        await RestockOrder.modifyRestockOrderState(req.params.id, req.body.newState);
        res.status(200);

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
            let RO = await RestockOrder.getRestockOrderById(req.params.id);
            if (RO == null || RO.isEmpty())
                return res.status(404).json({ error: "Not Found" });
            let state = RestockOrder.getRestockOrderState(req.params.id);
            if (state == null || state.isEmpty() || state != 'DELIVERED')
                return res.status(422).json({ error: "Unprocessable Entity" });
        }

        await RestockOrder.addRestockOrderSKUItems(req.params.id, req.body.skuItems);
        res.status(200);

    }
    catch (err) {

        res.status(500).send(err);
    }


});


//Add a transport note to a restock order, given its id.
app.put('/api/restockOrder/:id/transportNote', [check('id').isNumeric(), check('transportNote').notEmpty()], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else {
            let RO = await RestockOrder.getRestockOrderById(req.params.id);
            if (RO == null || RO.isEmpty())
                return res.status(404).json({ error: "Not Found" });
        }

        let state = RestockOrder.getRestockOrderState(req.params.id);
        if (!CheckifStateValid(state) || state != 'DELIVERY')
            return res.status(422).json({ error: "unprocessable Entity" });

        if (!CheckIfDateIsValid(req.body.transportNote.deliveryDate))
            return res.status(422).json({ error: "unprocessable Entity" });
        ///////////
        /////////missing check if date is in correct oreder
        /////////


        await RestockOrder.addRestockOrderTransportNote();
        res.status(204);

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
            let RO = await RestockOrder.getRestockOrderById(req.params.id);
            if (RO == null)
                return res.status(422).json({ error: "Not Found" });
        }

        await RestockOrder.deleteRestockOrder(req.params.id);
        res.status(204);

    }
    catch (err) {

        res.status(503).send(err);
    }

});

/*********** Return Order APIs  ********/
//Return an array containing all return orders.
// need to get items in return orders.
app.get('/api/returnOrders', async (req, res) => {
  try {
        const ReturnOrders = await ReturnOrder.getReturnOrders();
        res.status(200).json(ReturnOrders);
  }
  catch (err) {
        res.status(500).send(err);
  }
});


//Return a return order, given its id.
app.get('/api/returnOrders/:id', [check('id').isNumeric()], async (req, res) => {

    try {
        const erros = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ erros: erros.array() });
        else {
            let RO = await ReturnOrder.getReturnOrderById(req.params.id);
            if (RO == null || RO.isEmpty())
                return res.status(404).json({ error: "Not Found" });
        }

        await RestockOrder.deleteRestockOrder(req.params.id);
        res.status(200);

    }
    catch (err) {

        res.status(500).send(err);
    }


});


//Creates a new return order.
app.post('/api/returnOrder', [
    check('returnDate').notEmpty(),
    check('products').notEmpty().isArray(),
    check('restockOrderID').isInt({ gte: 0 }),
], async (req, res) => {

    try {
        const erros = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ erros: erros.array() });
        else {

            let RO = RestockOrder.getRestockOrderById(req.body.restockOrderID);
            if (RO == null || RO.isEmpty()) {
                return res.status(404).json({error: "no RestockOrder associated to restockOrderID "});
            }

            ReturnOrder.createNewReturnOrder(req.body.returnDate, req.body.products, req.body.restockOrderID);
        }

       
        res.status(201);

    }
    catch (err) {

        res.status(503).send(err);
    }

});


//Delete a return order, given its id.
app.delete('/api/returnOrder/:id', [check('id').isNumeric()], async (req, res) => {
     try {
        const erros = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ erros: erros.array() });
        else {
            let RO = await ReturnOrder.getReturnOrderById(req.params.id);
            if (RO == null || RO.isEmpty())
                return res.status(422).json({ error: "Not Found" });
        }

        await ReturnOrder.deleteReturnOrder(req.params.id);
        res.status(204);

    }
    catch (err) {

        res.status(503).send(err);
    }

});

/*******************************************/


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



/************** POSITION APIs **************/
/*******************************************/

// Return an array containing all positions.
app.get('/api/positions', async (req, res) => {
  try {
    let positions = await Position.getAllPositions();
    
    const positions_array = positions.map((row) => ({
      positionID: row.positionID,
      aisleID: row.aisle,
      row: row.row,
      col: row.col,
      maxWeight: row.maxWeight,
      maxVolume: row.maxVolume,
      occupiedWeight: row.occupiedWeight,
      occupiedVolume: row.occupiedVolume,
    }));
    
    res.json(positions_array);
  }
  catch (err) {
    res.status(500).end();
  }
});

// CREATE NEW POSITION
/// TO DISCUSS: Error 409 not present in API.md
// TODO: migliorare gestione errori
app.post('/api/position', [ 
  check('positionID').isString().isLength({ min: 12, max: 12}),
  check('aisleID').isString().isLength({ min: 4, max: 4}),
  check('row').isString().isLength({ min: 4, max: 4}),
  check('col').isString().isLength({ min: 4, max: 4}),
  check('maxWeight').isInt(),
  check('maxVolume').isInt()
  ] ,async (request , response) => {
    const posId = request.body.aisleID+request.body.row+request.body.col;
    const errors = validationResult(request);
    if(!errors.isEmpty() || request.body.positionID != posId)
      return response.status(422).json({errors: errors.array()});

    try {
    
      const new_position = {
      positionID: request.body.positionID,
      aisle: request.body.aisleID,
      row: request.body.row,
      col: request.body.col,
      maxWeight: request.body.maxWeight,
      maxVolume: request.body.maxVolume,
      occupiedWeight: 0,
      occupiedVolume: 0,
      };
      
      await Position.createNewPosition(new_position);
      response.status(201).end();
      
    }
    catch (err) {
      if (err.errno == 19)
        response.status(409).json({ error: `Position ${request.body.positionID} already exist.`}); //position already exists
      else
        response.status(503).end();
    }
});


// MODIFY the positionID a position identified by positionID 
app.put('/api/position/:positionID', [
  check('positionID').isString().isLength({ min: 12, max: 12}),
  check('newAisleID').isString().isLength({ min: 4, max: 4}),
  check('newRow').isString().isLength({ min: 4, max: 4}),
  check('newCol').isString().isLength({ min: 4, max: 4}),
  check('newMaxWeight').isInt(),
  check('newMaxVolume').isInt(),
  check('newOccupiedWeight').isInt(),
  check('newOccupiedVolume').isInt()
], async (req, res) => {
  try {
    // Check parameter
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).end();

    // Check if the position exists
    let position = await Position.getPositionById(req.params.positionID);
    if (position.length == 0)
      return res.status(404).end(); //position not found

    const result = await Position.modifyPosition(req.params.positionID, req.body.newAisleID, req.body.newRow, req.body.newCol, 
                              req.body.newMaxWeight, req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedVolume);
    res.status(200).json(result);

  } catch (err) {
    res.status(503).send(err);
  }
});

// MODIFY all fields of a position identified by positionID 
app.put('/api/position/:positionID/changeID', [
  check('positionID').isString().isLength({ min: 12, max: 12}),
  check('newPositionID').isString().isLength({ min: 12, max: 12})
], async (req, res) => {
  try {
    // Check parameter
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).end();

    // Check if the position exists
    let position = await Position.getPositionById(req.params.positionID);
    if (position.length == 0)
      return res.status(404).end(); //position not found

    const result = await Position.modifyPositionID(req.params.positionID, req.body.newPositionID);
    res.status(200).json(result);

  } catch (err) {
    res.status(503).send(err);
  }
});

// DELETE the position
// TO BE REVIEWED
app.delete('/api/position/:positionID', [ 
  check('positionID').isString().isLength({ min: 12, max: 12})
  ], async (request , response) => {

  const errors = validationResult(request);
  if(!errors.isEmpty())
    return response.status(422).json({errors: errors.array()});

  try {
      await Position.deletePosition(request.params.positionID);
      response.status(204).end();
  }
  catch (err) {
      response.status(503).json({ error: `Database error while deleting: ${request.params.positionID}.`});
  }
});

/************* END Position APIs ***************/
/**********************************************/

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

    // Check if the TestResult exists
    const testResults = await TestResult.getTestResultById(req.params.rfid, req.params.id);
      if (testResults.error)
        return res.status(404).json({ error: "Test Results not found" }); //testResult not found

    //Check if SKU Item exists
    const skuItem = await DB.getSKUItemByRFID(req.params.rfid);
      if (skuItem.error)
        return res.status(404).json({ error: "SKUItem not found" });

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
// Why not 404?
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

module.exports = app;