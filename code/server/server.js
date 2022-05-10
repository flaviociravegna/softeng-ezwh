'use strict';

const express = require('express');
const DB = require('./modules/DB');
const RestockOrder = require('./modules/RestockOrder');
const ReturnOrder = require('./modules/ReturnOrder');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const { check, validationResult, body } = require('express-validator'); // validation middleware

const app = new express();
const port = 3001;

dayjs.extend(customParseFormat);

/******** General purpose functions ********/

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }

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
app.get('/api/restockOrders', async (req, res) => { });


//Returns an array of all restock orders in state = ISSUED.
app.get('/api/restockOrdersIssued', async (req, res) => {

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

        let state = await RestockOrder.getRestockOrderState(req.params.id)

        if (state.error)
            return res.status(422).json()

        let Items = await RestockOrder.getRestockOrderFailedSKUItems(req.params.id);

        if (Items.error)
            return res.status(404).json(Items);

        res.status(200).json();
    } catch (err) {
        res.status(500).send(err);
    }

});


//Creates a new restock order in state = ISSUED with an empty list of skuItems.
app.post('/api/restockOrder', async (req, res) => {



});


//Modify the state of a restock order, given its id.
app.put('/api/restockOrder/:id', async (req, res) => {


});


//Add a non empty list of skuItems to a restock order, given its id. If a restock order has already a non empty list of skuItems, merge both arrays
app.put('/api/restockOrder/:id/skuItems', async (req, res) => {


});


//Add a transport note to a restock order, given its id.
app.put('/api/restockOrder/:id/transportNote', async (req, res) => {


});


//Delete a restock order, given its id.
app.delete('/api/restockOrder/:id', async (req, res) => {


});

/*********** Return Order APIs  ********/
//Return an array containing all return orders.
// need to get items in return orders.
app.get('/api/returnOrders', async (req, res) => {
  try {
    const ReturnOrders = await ReturnOrder.getReturnOrders();
    res.status(200).json(ReturnOrders);
  } catch (err) {
    res.status(500).send(err);
  }
  });


//Return a return order, given its id.
app.get('/api/returnOrders/:id', async (req, res) => {



});


//Creates a new return order.
app.post('/api/returnOrder', async (req, res) => { });


//Delete a return order, given its id.
app.delete('/api/returnOrder/:id', async (req, res) => {


});

/*********************************/

module.exports = app;