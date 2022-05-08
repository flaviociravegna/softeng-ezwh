'use strict';

const express = require('express');
const DB = require('./modules/DB');

const app = new express();
const port = 3001;

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

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

/**************** SKU APIs *****************/
// NB: No authN check at the moment (no error <401 Unauthorized>)
// To return error 422 a validator should be used 

// Return an array containing all SKUs
app.get('/api/skus', async (req, res) => {
  try {
    let skus = await DB.getAllSKU();
    const test_descriptors = await DB.getAllTestDescriptors();

    skus.forEach(sku => { sku.testDescriptors = test_descriptors.filter(td => td.idSKU == sku.id).map(td => td.id) });
    res.status(200).json(skus);
  } catch (err) {
    res.status(500).end();
  }
});

// Return a SKU, given its id
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

// Creates a new SKU
app.post('/api/sku', async (req, res) => {
  try {
    const lastId = await DB.getLastSKUId();
    const result = await DB.createNewSKU(lastId + 1, req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, null, req.body.availableQuantity);

    res.status(201).json(result);
  } catch (err) {
    res.status(503).end();
  }
});

// Modify an existing SKU
app.put('/api/sku/:id', async (req, res) => {
  try {
    // Check if the SKU exists
    let sku = await DB.getSKUById(req.params.id);
    if (sku.error)
      res.status(404).json(sku);

    const result = await DB.modifySKU(req.params.id, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity);
    res.status(200).json(result);
  } catch (err) {
    res.status(503).end();
  }
});

// Add or modify position of a SKU
app.put('/api/sku/:id/position', async (req, res) => {
  try {
    // Check if the SKU exists
    let sku = await DB.getSKUById(req.params.id);
    if (sku.error)
      res.status(404).json(sku);

    //TODO: check if position exists
    if (false)
      res.status(404).json(sku);

    const result = await DB.addOrModifyPositionSKU(req.params.id, req.body.position);
    res.status(200).json(result);
  } catch (err) {
    res.status(503).end();
  }
});

// Don't delete an SKU if there are connected SKU items to it

/*********** Restock Order APIs  ********/

app.get('/api/restockOrders',async(req,res)=>{});

app.get('/api/restockOrdersIssued', async (req, res)=>{});

app.get('/api/restockOrders/:id', async (req, res)=>{});

app.get('/api/restockOrders/:id/returnItems', async (req, res)=>{});

app.post('/api/restockOrder', async (req, res)=>{});

app.put(async ('/api/restockOrder/:id',req, res)=>{});

app.put(async ('/api/restockOrder/:id/skuItems', async (req, res)=>{});

app.put(async ('/api/restockOrder/:id/transportNote', async (req, res)=>{});

app.delete('/api/restockOrder/:id', async (req, res)=>{});

/*********** Return Order APIs  ********/

app.get('/api/returnOrders',async(req,res)=>{});

app.get('/api/returnOrders/:id', async (req, res)=>{});

app.post('/api/returnOrder', async (req, res)=>{});

app.delete('/api/returnOrder/:id', async (req, res)=>{});

/*********************************/

module.exports = app;