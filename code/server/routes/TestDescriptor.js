'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const SKU_DAO = require('../modules/SKU');
const TestDesc_DAO = require('../modules/TestDescriptor');
const { check, validationResult } = require('express-validator'); // validation middleware

router.use(express.json());

// Return an array containing all test descriptors
router.get('/', async (req, res) => {
    try {
        const testDescriptors = await TestDesc_DAO.getAllTestDescriptors();
        res.status(200).json(testDescriptors);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Return a td, given its id
router.get('/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let td = await TestDesc_DAO.getTestDescriptorById(req.params.id);
        if (td.error)
            return res.status(404).json(td);

        res.status(200).json(td);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Creates a new TD
router.post('/', [
    check('name').notEmpty().isString(),
    check('procedureDescription').notEmpty().isString(),
    check('idSKU').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        // Check if the SKU associated to the skuID exists
        const sku = await SKU_DAO.getSKUById(req.body.idSKU);
        if (sku.error)
            return res.status(404).end();

        const lastId = await TestDesc_DAO.getLastTestDescriptorsId();
        await TestDesc_DAO.createNewTestDescriptor(lastId + 1, req.body.name, req.body.procedureDescription, req.body.idSKU);

        res.status(201).end();
    } catch (err) {
        res.status(503).send(err);
    }
});

// Modify a testDescriptor, given its id
router.put('/:id', [
    check('id').exists().isInt({ min: 1 }),
    check('newName').notEmpty().isString(),
    check('newProcedureDescription').notEmpty().isString(),
    check('newIdSKU').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() })
                ;
        // Check if the TD exists
        const td = await TestDesc_DAO.getTestDescriptorById(req.params.id);
        if (td.error)
            return res.status(404).json(td);

        // Check if the SKU exists
        const sku = await SKU_DAO.getSKUById(req.body.newIdSKU);
        if (sku.error)
            return res.status(404).json(sku);

        await TestDesc_DAO.modifyTestDescriptor(req.params.id, req.body.newName, req.body.newProcedureDescription, req.body.newIdSKU);
        res.status(200).end();
    } catch (err) {
        res.status(503).send(err);
    }
});

// Delete a TD
router.delete('/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        // Check if the TD exists
        const td = await TestDesc_DAO.getTestDescriptorById(req.params.id);
        if (td.error)
            return res.status(422).end();

        await TestDesc_DAO.deleteTestDescriptor(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(503).send(err);
    }
});

module.exports = router;