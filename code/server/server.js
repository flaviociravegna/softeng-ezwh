'use strict';

const express = require('express');

const database = require('./modules/DB');
const position = require('./routes/Position');
const testResult = require('./routes/TestResult');
const returnOrder = require('./routes/ReturnOrder');
const SKUItem = require('./routes/SKUItem');
const SKU = require('./routes/SKU');
const testDescriptor = require('./routes/TestDescriptor');
const restockOrder = require('./routes/RestockOrder');
const internalOrder = require('./routes/InternalOrder');
const item = require('./routes/Item');
const user = require('./routes/User');

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
app.use('/', user);

/*******************************************/

database.createConnection().then(() => app.emit("db_connection_created"));

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

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
