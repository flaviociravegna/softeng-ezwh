'use strict';

const express = require('express');
const router = express.Router();
const item_DAO = require('../moduleS/Item');
const { check, validationResult } = require('express-validator'); // validation middleware
router.use(express.json());
const dayjs = require('dayjs');
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
        let items = await item_DAO.getItemsById(req.params.id);
        res.status(200).json(items);
    } catch (err) {
        res.status(500).end();
    }
});

// POST /api/items
router.post('/', async (req, res) => {
    try {

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