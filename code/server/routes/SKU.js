'use strict';

const express = require('express');
const router = express.Router();
const SKU_DAO = require('../modules/SKU');
const SKUItem_DAO = require('../modules/SKUItem');
const Position_DAO = require('../modules/position_db');
const TestDesc_DAO = require('../modules/TestDescriptor');
const { check, validationResult } = require('express-validator'); // validation middleware

router.use(express.json());

/**************** SKU APIs *****************/
/*******************************************/
// NB: No authN check at the moment (no error <401 Unauthorized>)

// Return an array containing all SKUs
router.get('/', async (req, res) => {
    try {
        let skus = await SKU_DAO.getAllSKU();
        const test_descriptors = await TestDesc_DAO.getAllTestDescriptors();

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

        let sku = await SKU_DAO.getSKUById(req.params.id);
        if (sku.error)
            return res.status(404).json(sku);

        const associatedTestDescriptors = await TestDesc_DAO.getTestDescriptorsIdBySKUId(sku.id);
        sku.testDescriptors = [...associatedTestDescriptors];
        res.status(200).json(sku);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Creates a new SKU
router.post('/', [
    check('description').notEmpty().isString(),
    check('weight').not().isString().isInt({ gt: 0 }),
    check('volume').not().isString().isInt({ gt: 0 }),
    check('price').not().isString().isFloat({ gt: 0 }),
    check('notes').notEmpty().isString(),
    check('availableQuantity').not().isString().isInt({ min: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        const lastId = await SKU_DAO.getLastSKUId();
        await SKU_DAO.createNewSKU(lastId + 1, req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, null, req.body.availableQuantity);

        res.status(201).end();
    } catch (err) {
        res.status(503).send(err);
    }
});

// Modify an existing SKU
router.put('/:id', [
    check('id').exists().isInt({ min: 1 }),
    check('newDescription').notEmpty(),
    check('newWeight').not().isString().isInt({ gt: 0 }),
    check('newVolume').not().isString().isInt({ gt: 0 }),
    check('newPrice').not().isString().isFloat({ gt: 0 }),
    check('newNotes').notEmpty(),
    check('newAvailableQuantity').not().isString().isInt({ min: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        // Check if the SKU exists
        let sku = await SKU_DAO.getSKUById(req.params.id);
        if (sku.error)
            return res.status(404).json(sku);

        // Check if position is not capable enough in weight or in volume with the inserted newAvailableQuantity
        const pos = await Position_DAO.getPositionById(sku.position);
        if (!pos.error) {   // If position exists and is associated to the SKU
            if (pos.maxWeight < req.body.newWeight * req.body.newAvailableQuantity)
                return res.status(422).json({ errors: "Position is not capable to satisfy weight constraints" });
            else if (pos.maxVolume < req.body.newVolume * req.body.newAvailableQuantity)
                return res.status(422).json({ errors: "Position is not capable to satisfy volume constraints" });

            await Position_DAO.modifyPosition(sku.position, pos.aisle, pos.row, pos.col, pos.maxWeight, pos.maxVolume, req.body.newWeight * req.body.newAvailableQuantity, req.body.newVolume * req.body.newAvailableQuantity)
        }

        await SKU_DAO.modifySKU(req.params.id, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity);
        res.status(200).end();
    } catch (err) {
        res.status(503).send(err);
    }
});

// Add or modify position of a SKU
router.put('/:id/position', [
    check('id').exists().isInt({ min: 1 }),
    check('position').isString().isNumeric().isLength({ min: 12, max: 12 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        // Check if the SKU exists
        const sku = await SKU_DAO.getSKUById(req.params.id);
        if (sku.error)
            return res.status(404).json(sku);

        // check if position exists
        let pos = await Position_DAO.getPositionById(req.body.position);
        if (pos.error)
            return res.status(404).json(pos);

        const idOfThePositionSku = await SKU_DAO.getSKUIdByPosition(req.body.position);
        if (!idOfThePositionSku.error)
            return res.status(422).json({ errors: "Position already assigned to a SKU" });

        // If position isn't capable to satisfy volume and weight constraints for available quantity of sku
        if (pos.maxWeight < sku.weight * sku.availableQuantity)
            return res.status(422).json({ errors: "Position is not capable to satisfy weight constraints" });
        else if (pos.maxVolume < sku.volume * sku.availableQuantity)
            return res.status(422).json({ errors: "Position is not capable to satisfy volume constraints" });

        // Update the occupied volume and weight of the position
        await Position_DAO.modifyPosition(req.body.position, pos.aisle, pos.row, pos.col, pos.maxWeight, pos.maxVolume, sku.weight, sku.volume)
        await SKU_DAO.addOrModifyPositionSKU(req.params.id, req.body.position);

        res.status(200).end();
    } catch (err) {
        res.status(503).send(err);
    }
});

// Delete an SKU
router.delete('/:id', [check('id').exists().isInt()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        // Check if the SKU exists
        /*let sku = await SKU_DAO.getSKUById(req.params.id);
        if (sku.error)
            return res.status(422).json(sku);*/

        // If there are still SKU items -> error
       /* const skuItems = await SKUItem_DAO.getSKUItemsBySkuID(req.params.id);
        if (skuItems.length != 0)
            return res.status(422).json({ error: "There are SKU Items connected to the SKU id" });*/

        await SKU_DAO.deleteSKU(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(503).send(err);
    }
});

module.exports = router;