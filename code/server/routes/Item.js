'use strict';

const express = require('express');
const router = express.Router();
const item_DAO = require('../modules/Item');
const { check, validationResult } = require('express-validator'); // validation middleware
const dayjs = require('dayjs');
const SKU_DAO = require('../modules/SKU');
const customParseFormat = require('dayjs/plugin/customParseFormat');

router.use(express.json());
dayjs.extend(customParseFormat);

function CheckItemsSameID(id, supplierID, itemList) {
    let res = true;
    itemList.forEach(i => {
        if (i.id == id && i.supplierId == supplierID) res = false;
    });

    return res;
}

function CheckItemsSameSKUId(skuid, supplierID, itemList) {
    let res = true;
    itemList.forEach(i => {
        if (i.SKUId == skuid && i.supplierId == supplierID) res = false;
    });

    return res;
}

/**************** ITEMS *****************/

// GET /api/items
router.get('/', async (req, res) => {
    try {
        let items = await item_DAO.getAllItems();
        res.status(200).json(items);
    } catch (err) {
        res.status(500).end();
    }
});

// GET /api/items/:id
router.get('/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        const item = await item_DAO.getItemsById(req.params.id);
        if (item.error)
            return res.status(404).json(item);

        res.status(200).json(item);
    } catch (err) {
        res.status(500).end();
    }
});

// POST /api/items
// DB triple primary-key
router.post('/', [
    check('id').exists().isInt({ min: 1 }),
    check('description').notEmpty().isString(),
    check('price').not().isString().isFloat({ gt: 0 }),
    check('SKUId').not().isString().isInt({ gt: 0 }),
    check('supplierId').exists().not().isString().isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let sku = await SKU_DAO.getSKUById(req.body.SKUId);
        if (sku.error)
            return res.status(404).json(sku);

        // Check if this supplier already sells an item with the same SKUId or
        // supplier already sells an Item with the same ID
        let itemList = await item_DAO.getAllItems();
        if (CheckItemsSameID(req.body.id, req.body.supplierId, itemList) != true) {
            return res.status(422).json({
                errors: "This supplier already sells an Item with the same ID."
            });
        }

        if (CheckItemsSameSKUId(req.body.SKUId, req.body.supplierId, itemList) != true) {
            return res.status(422).json({
                errors: "This supplier already sells an Item with the same SKUId."
            });
        }

        await item_DAO.createNewItem(req.body.id, req.body.price, req.body.SKUId, req.body.supplierId, req.body.description)
        return res.status(201).end();
    }
    catch (err) {
        res.status(503).end();
    }
});

// PUT /api/items/:id
router.put('/:id', [
    check('id').exists().isInt({ min: 1 }),
    check('newDescription').notEmpty().isString(),
    check('newPrice').not().isString().isFloat({ gt: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        const item = await item_DAO.getItemsById(req.params.id);
        if (item.error)
            return res.status(404).json(item);

        await item_DAO.modifyItem(req.params.id, req.body.newPrice, item.SKUId, item.supplierId, req.body.newDescription);
        res.status(200).end();
    } catch (err) {
        res.status(503).end();
    }
});

// DELETE /api/items/:id
router.delete('/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        const item = await item_DAO.getItemsById(req.params.id);
        if (item.error)
            return res.status(422).json(item);

        await item_DAO.deleteItemsByID(req.params.id);
        res.status(204).end();
    } catch {
        res.status(503).end();
    }
});

/*
    Message from Prof. Morisio about these APIs:

    "[GET /api/items/:id, PUT /api/item/:id, DELETE /api/items/:id] should also receive [/:id/:supplierId]
    because Item.id is not enough to identify an Item. For the moment we don't change the APIs,
    and the result of these functions could be ambiguous - it will not be tested by the official test cases.
    This issue remains open and will be fixed later"
*/

module.exports = router;
