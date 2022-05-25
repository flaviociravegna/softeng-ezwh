'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const TestResult = require('../modules/testResult_db');
const SkuItem_db = require('../modules/SKUItem');
const TestDesc_db = require('../modules/TestDescriptor');
const { check, validationResult } = require('express-validator'); // validation middleware
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

router.use(express.json());
dayjs.extend(customParseFormat);

/******** General purpose functions ********/

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }
function BooleanTranslate(bool) {
    if (bool == 0) return false;
    return true;
}

/************* TestResult APIs ****************/
/**********************************************/

// Return a Test Result given a RFID and Test Id.
router.get('/:id', [
    check('rfid').notEmpty().isString().isNumeric().isLength({ min: 32, max: 32 }),
    check('id').isInt({ min: 1 })
], async (req, res) => {
    try {
        // Check parameter
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).end();

        //Check if SKU Item exists
        const skuItem = await SkuItem_db.getSKUItemByRFID(req.params.rfid);
        if (skuItem.error)
            return res.status(404).end(); //skuItem not found

        let testResults = await TestResult.getTestResultById(req.params.rfid, req.params.id);
        if (testResults.error)
            return res.status(404).json({ error: "Test Results not found" }); //testResult not found

        const result = {
            id: testResults.id,
            Date: testResults.date,
            Result: BooleanTranslate(testResults.result),
            idTestDescriptor: testResults.idTestDescriptor,
        };

        res.status(200).json(result);
    } catch (err) {
        res.status(500).end();
    }
});

// Return an array containing all testResults for a SKUItem
router.get('/', [
    check('rfid').isNumeric().isLength({ min: 32, max: 32 })
], async (req, res) => {

    try {
        // Check parameter
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).end();

        //Check if SKU Item exists
        const skuItem = await SkuItem_db.getSKUItemByRFID(req.params.rfid);
        if (skuItem.error)
            return res.status(404).end(); //skuItem not found

        let testResults = await TestResult.getAllTestResultByRFID(req.params.rfid);
        const testResult_array = testResults.map((row) => ({
            id: row.id,
            Date: row.date,
            Result: BooleanTranslate(row.result),
            idTestDescriptor: row.idTestDescriptor,
        }));

        res.status(200).json(testResult_array);

    } catch (err) {
        res.status(500).end();
    }
});

// CREATE NEW TEST Result
router.post('/', [
    check('rfid').isString().isNumeric().isLength({ min: 32, max: 32 }),
    check('idTestDescriptor').not().isString().isInt({ min: 1 }),
    check('Date').notEmpty().isString(),
    check('Result').isBoolean()
], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        //check date validity
        if (!CheckIfDateIsValid(req.body.Date))
            return res.status(422).json({ error: "Invalid date format" });

        //Check if SKU Item exists
        const skuItem = await SkuItem_db.getSKUItemByRFID(req.body.rfid);
        if (skuItem.error)
            return res.status(404).json({ error: "SKUItem not found" });

        //Check if TestDescriptor exists
        const test_descriptor = await TestDesc_db.getTestDescriptorById(req.body.idTestDescriptor);
        if (test_descriptor.error)
            return res.status(404).json({ error: "Test Descriptor not found" }); //test_descriptor not found

        //set max id
        let max_id = await TestResult.searchMaxID();
        if (max_id === null)
            max_id = 1;
        else
            max_id++;

        const new_testResult = {
            id: max_id,
            date: req.body.Date,
            result: req.body.Result,
            rfid: req.body.rfid,
            idTestDescriptor: req.body.idTestDescriptor
        };

        await TestResult.createNewTestResult(new_testResult);
        res.status(201).end();

    } catch (err) {
        res.status(503).end();
    }
});

// MODIFY a test Result identified by id for a certain sku item identified by RFID.
router.put('/:id', [
    check('rfid').notEmpty().isString().isNumeric().isLength({ min: 32, max: 32 }),
    check('id').isInt({ min: 1 }),
    check('newIdTestDescriptor').not().isString().isInt({ min: 1 }),
    check('newDate').notEmpty().isString(),
    check('newResult').isBoolean()
], async (req, res) => {
    try {
        // Check parameters
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).end();
        if (!CheckIfDateIsValid(req.body.newDate))
            return res.status(422).json({ error: "Invalid date format" });

        //Check if SKU Item exists
        const skuItem = await SkuItem_db.getSKUItemByRFID(req.params.rfid);
        if (skuItem.error)
            return res.status(404).json({ error: "SKUItem not found" });

        // Check if the TestResult exists
        const testResults = await TestResult.getTestResultById(req.params.rfid, req.params.id);
        if (testResults.error)
            return res.status(404).json({ error: "Test Results not found" }); //testResult not found

        //Check if TestDescriptor exists
        const test_descriptor = await TestDesc_db.getTestDescriptorById(req.body.newIdTestDescriptor);
        if (test_descriptor.error)
            return res.status(404).json({ error: "Test Descriptor not found" }); //test_descriptor not found

        await TestResult.modifyTestResult(req.params.id, req.body.newIdTestDescriptor, req.body.newResult, req.body.newDate);
        res.status(200).end();
    } catch (err) {
        res.status(503).send(err);
    }
});

// DELETE a test result, given its id for a certain sku item identified by RFID
router.delete('/:id', [
    check('rfid').notEmpty().isString().isNumeric().isLength({ min: 32, max: 32 }),
    check('id').notEmpty().isInt({ min: 1 })
], async (request, response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty())
            return response.status(422).json({ errors: errors.array() });

        let testResults = await TestResult.getTestResultById(request.params.rfid, request.params.id);
        if (testResults.error)
            return response.status(422).json({ error: "Test Results not found" }); //testResult not found

        await TestResult.deleteTestResult(request.params.rfid, request.params.id);
        response.status(204).end();
    } catch (err) {
        response.status(503).json({ error: `Database error while deleting: ${request.params.id}.` });
    }
});

module.exports = router;
