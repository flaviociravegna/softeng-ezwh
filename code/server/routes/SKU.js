'use strict';

const express = require('express');
const router = express.Router({mergeParams: true});
const DB = require('../modules/DB');
const { check, validationResult } = require('express-validator'); // validation middleware
router.use(express.json());


/**************** SKU APIs *****************/
/*******************************************/
// NB: No authN check at the moment (no error <401 Unauthorized>)

// Return an array containing all SKUs
router.get('/', async (req, res) => {
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
router.get('/:id', [
    check('id').exists().isInt({ min: 1 })
    ], async (req, res) => {
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
router.post('/', [
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
router.put('/:id', [
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
router.put('/:id/position', [
    check('position').exists().notEmpty()
    ], async (req, res) => {
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
router.delete('/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
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
  



module.exports = router;
