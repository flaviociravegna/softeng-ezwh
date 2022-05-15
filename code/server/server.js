'use strict';

const express = require('express');
const DB = require('./modules/DB');
const user_db = require('./modules/User');
const Position = require('./modules/position_db');
const TestResult = require('./modules/testResult_db');
const RestockOrder = require('./modules/RestockOrder');
const ReturnOrder = require('./modules/ReturnOrder');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { check, validationResult, body } = require('express-validator'); // validation middleware

const bcrypt = require('bcrypt');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

const pos = require('./routes/Position');
const testRes = require('./routes/TestResult');
//const returnOrd = require('./routes/ReturnOrder');
const SKUItem = require('./routes/SKUItem');
const SKU = require('./routes/SKU');

const app = new express();
const port = 3001;

app.use('/api/positions?', pos);
app.use(['/api/skuitems/:rfid/testResults?', '/api/skuitems/testResult'], testRes);
//app.use('/api/returnOrders?', returnOrd);
app.use('/api/skuitems?', SKUItem);
app.use('/api/skus?', SKU);

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
