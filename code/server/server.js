'use strict';

const express = require('express');
const user_db = require('./modules/User');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { check, validationResult, body } = require('express-validator'); // validation middleware

const bcrypt = require('bcrypt');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

const position = require('./routes/Position');
const testResult = require('./routes/TestResult');
const returnOrder = require('./routes/ReturnOrder');
const SKUItem = require('./routes/SKUItem');
const SKU = require('./routes/SKU');
const testDescriptor = require('./routes/TestDescriptor');
const restockOrder = require('./routes/RestockOrder');
const internalOrder = require('./routes/InternalOrder');
const item = require('./routes/Item');

const app = new express();
const port = 3001;

app.use('/api/positions?', position);
app.use(['/api/skuitems/:rfid/testResults?', '/api/skuitems/testResult'], testResult);
app.use('/api/returnOrders?', returnOrder);
app.use(['/api/restockOrders?', '/api/restockOrdersIssued'], restockOrder);
app.use('/api/skuitems?', SKUItem);
app.use('/api/skus?', SKU);
app.use('/api/testDescriptors?', testDescriptor);
app.use(['/api/internalOrders', '/api/internalOrdersIssued', '/api/internalOrdersAccepted'], internalOrder);
app.use('/api/items?', item);


dayjs.extend(customParseFormat);

/******** General purpose functions ********/

function CheckifTypeValid(type) {
  let VALIDTYPES = ['CUSTOMER', 'QUALITY_EMPLOYEE', 'MANAGER', 'DELIVERY_EMPLOYEE', 'CLERK', 'SUPPLIER'];
  return (VALIDTYPES.includes(type));
}
function CheckifTypeAllowed(type) {
  let VALIDTYPES = ['CUSTOMER', 'QUALITY_EMPLOYEE', 'DELIVERY_EMPLOYEE', 'CLERK', 'SUPPLIER'];
  return (VALIDTYPES.includes(type));
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
  function (username, password, done) {
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
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'not authenticated' });
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


/**************** USER APIs *****************/
/*******************************************/

// POST (login)
app.post('/api/managerSessions', function (req, res, next) {
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

app.post('/api/customerSessions', function (req, res, next) {
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

app.post('/api/supplierSessions', function (req, res, next) {
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

app.post('/api/clerkSessions', function (req, res, next) {
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

app.post('/api/qualityEmployeeSessions', function (req, res, next) {
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

app.post('/api/deliveryEmployeeSessions', function (req, res, next) {
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
  check('type').custom(val => {
    return CheckifTypeValid(val);
  }),
  check('password').isString().isLength({ min: 8 }),
], async (request, response) => {

  const errors = validationResult(request);
  if (!errors.isEmpty())
    return response.status(422).json({ errors: errors.array() });

  try {
    // Set the id
    let max_id = await user_db.searchMaxID();
    if (max_id === null)
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
      response.status(409).json({ error: `Username ${request.body.username} already exist.` }); //username already exists
    else
      response.status(503).end();
  }
});

// MODIFY rights of a user, given its username
app.put('/api/users/:username', [
  check('username').isEmail(),
  check('oldType').custom(val => {
    return CheckifTypeValid(val);
  }),
  check('newType').custom(val => {
    return CheckifTypeValid(val);
  })
], async (req, res) => {
  try {
    // Check parameters
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
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
  check('type').custom(val => {
    return CheckifTypeAllowed(val);
  })
], async (request, response) => {

  const errors = validationResult(request);
  if (!errors.isEmpty())
    return response.status(422).json({ errors: errors.array() });

  try {
    await user_db.deleteUser(request.params.username, request.params.type);
    response.status(204).end();
  }
  catch (err) {
    response.status(503).json({ error: `Database error while deleting: ${request.params.username}.` });
  }
});


/************* END Users API ***************/
/******************************************/

module.exports = app;
