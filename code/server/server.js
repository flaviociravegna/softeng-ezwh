'use strict';

const express = require('express');
const DB = require('./modules/DB');

const app = new express();
const port = 3001;

/*******************************************/

// init express
app.use(express.json());

//GET /api/test
app.get('/api/hello', (req, res) => {
  let message = {
    message: 'Hello World!'
  }
  return res.status(200).json(message);
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

/**************** SKU APIs *****************/
//NB: No authN check at the moment (no error <401 Unauthorized>)

//Return an array containing all SKUs
app.get('/api/skus', async (req, res) => {
  try {
    let skus = await DB.getAllSKU();
    const test_descriptors = await DB.getAllTestDescriptors();
    if (skus.error)
      skus.status(404).json(skus);

    skus.forEach(sku => { sku.testDescriptors = test_descriptors.filter(td => td.idSKU == sku.id).map(td => td.id) });
    res.status(200).json(skus);
  } catch (err) {
    res.status(500).end();
  }
});

//Return a SKU, given its id
app.get('/api/skus/:id', async (req, res) => {
  try {
    let sku = await DB.getSKUById(req.params.id);
    if (sku.error)
      res.status(404).json(sku);

    const associatedTestDescriptors = await DB.getTestDescriptorsIdBySKUId(sku.id);
    sku.testDescriptors = [...associatedTestDescriptors];

    res.status(200).json(sku);
  } catch (err) {
    res.status(500).end();
  }
});

/*******************************************/

module.exports = app;