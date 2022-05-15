'use strict';

const express = require('express');
const router = express.Router({mergeParams: true});
const DB = require('../modules/DB');
const { check, validationResult} = require('express-validator'); // validation middleware
router.use(express.json());
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

/******** General purpose functions ********/
function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }

dayjs.extend(customParseFormat);


/************ SKU Items APIs *************/
/*****************************************/

// Return an array containing all SKU Items
router.get('/', async (req, res) => {
    try {
      const skuItems = await DB.getAllSKUItems();
      res.status(200).json(skuItems);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
// Return an array containing all SKU items for a certain SKUId with Available = 1
router.get('/sku/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
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
router.get('/:rfid', [
    check('rfid').exists().isNumeric().isLength({ min: 32, max: 32 })
    ], async (req, res) => {
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
router.post('/', [
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
router.put('/:rfid', [
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
router.delete('/:rfid', [check('rfid').isNumeric().isLength({ min: 32, max: 32 })], async (req, res) => {
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

/*******************************************/

  
module.exports = router;
