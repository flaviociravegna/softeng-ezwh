'use strict';

const express = require('express');
const router = express.Router();
const item_DAO = require('../modules/Item');
const { check, validationResult } = require('express-validator'); // validation middleware
router.use(express.json());
const dayjs = require('dayjs');
const SKU_DAO = require('../modules/SKU');
const customParseFormat = require('dayjs/plugin/customParseFormat');

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }

function CheckItems(id, skuid, supplierID, itemList) {
    let check = true
    itemList.forEach(i => {
        if (i.id == id) check = false;
        else if (i.skuID == skuid && i.supplierID == supplierID) check = false;
    })
    return check;
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
router.get('/:id', async (req, res) => {
    try {
        if (isNaN(req.params.id)) {
            res.status(422).send("Id is not valid");
        }
        let items = await item_DAO.getItemsById(req.params.id);
        if (items.error) res.status(404).json(items);
        res.status(200).json(items);
    } catch (err) {
        res.status(500).end();
    }
});

// POST /api/items
router.post('/', async (req, res) => {
    try {
        if (isNaN(req.body.id)) {
            res.status(422).send("Id is not valid");
        }
        if (isNaN(req.body.SKUId)) {
            res.status(422).send("SKUId is not valid");
        }
        if (isNaN(req.body.supplierId)) {
            res.status(422).send("supplierId is not valid");
        }
        let sku = await SKU_DAO.getSKUById(req.body.SKUId);
        if (sku.error)
            return res.status(404).json(sku);
        let itemList = await item_DAO.getAllItems();
        if (CheckItems(req.body.id, req.body.SKUId, req.body.supplierId, itemList) != true) {
            res.status(422).json(
                {
                    errors: "This supplier already sells an item with the same SKUId or supplier already sells an Item with the same ID."
                }
            );
        }
        else {
            let items = await item_DAO.createNewItem(req.body.id, req.body.price, req.body.SKUId, req.body.supplierId, req.body.description)
            res.status(201).json(items);
        }
    }
    catch (err) {
        res.status(503).end();
    }
});

// PUT /api/items/:id
router.put('/:id', async (req, res) => {
    try {
        if (isNaN(req.params.id)) {
            res.status(422).send("Id is not valid");
        }
        if (isNaN(req.body.newSKUIdd)) {
            res.status(422).send("SKUId is not valid");
        }
        if (isNaN(req.body.newSupplierId)) {
            res.status(422).send("supplierId is not valid");
        }
        if (isNaN(req.body.newPrice)) {
            res.status(422).send("Price is not valid");
        }
        let item = await item_DAO.getItemsById(req.params.id);
        if (item.error)
            res.status(404).json(item);

        const result = await item_DAO.modifyItem(req.params.id, req.body.newPrice, req.body.newSKUId, req.body.newSupplierId, req.body.newDescription);
        res.status(200).json(result);
    } catch (err) {
        res.status(503).end();
    }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
        if (isNaN(req.params.id)) {
            res.status(422).send("Id is not valid");
        }

        let item = await item_DAO.getItemsById(req.params.id);
        if (item.error)
            res.status(404).json(item);


        await item_DAO.deleteItemsByID(req.params.id);
        res.status(204).end();
    } catch {
        res.status(503).end();
    }
});

module.exports = router;
