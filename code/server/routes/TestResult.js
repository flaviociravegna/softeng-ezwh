'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const TestResult = require('../modules/testResult_db');
const DB = require('../modules/DB');
const { check, validationResult } = require('express-validator'); // validation middleware
router.use(express.json());
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

/******** General purpose functions ********/
function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }
function BooleanTranslate(bool) {
    if (bool == 0) return false;
    return true;
}

dayjs.extend(customParseFormat);
/************* TestResult APIs ****************/
/**********************************************/

// Return a Test Result given a RFID and Test Id.
router.get('/:id', [
    check('rfid').isNumeric().isLength({ min: 32, max: 32 }),
    check('id').isInt()
], async (req, res) => {

    try {
        // Check parameter
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).end();

        //Check if SKU Item exists
        const skuItem = await DB.getSKUItemByRFID(req.params.rfid);
        if (skuItem.error)
            return res.status(404).end(); //skuItem not found

        let testResults = await TestResult.getTestResultById(req.params.rfid, req.params.id);
        if (testResults.error)
            return res.status(404).json({ error: "Test Results not found" }); //testResult not found

        const result = {
            id: testResults.id,
            date: testResults.date,
            result: BooleanTranslate(testResults.result),
            idTestDescriptor: testResults.idTestDescriptor,
        };

        res.json(result);

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
        const skuItem = await DB.getSKUItemByRFID(req.params.rfid);
        if (skuItem.error)
            return res.status(404).end(); //skuItem not found

        let testResults = await TestResult.getAllTestResultByRFID(req.params.rfid);

        const testResult_array = testResults.map((row) => ({
            id: row.id,
            date: row.date,
            result: BooleanTranslate(row.result),
            idTestDescriptor: row.idTestDescriptor,
        }));

        res.json(testResult_array);

    } catch (err) {
        res.status(500).end();
    }
});

// CREATE NEW TEST Result
router.post('/', [
    check('rfid').isString().isLength({ min: 32, max: 32 }),
    check('idTestDescriptor').isInt(),
    check('result').isBoolean()
], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        //check date validity
        if (!CheckIfDateIsValid(req.body.date))
            return res.status(422).json({ error: "Invalid date format" });

        //Check if SKU Item exists
        const skuItem = await DB.getSKUItemByRFID(req.body.rfid);
        if (skuItem.error)
            return res.status(404).json({ error: "SKUItem not found" });

        //Check if TestDescriptor exists
        const test_descriptor = await DB.getTestDescriptorsIdById(req.body.idTestDescriptor);
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
            date: req.body.date,
            result: req.body.result,
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
    check('rfid').isString().isLength({ min: 32, max: 32 }),
    check('id').isInt(),
    check('newIdTestDescriptor').isInt(),
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
        const skuItem = await DB.getSKUItemByRFID(req.params.rfid);
        if (skuItem.error)
            return res.status(404).json({ error: "SKUItem not found" });

        // Check if the TestResult exists
        const testResults = await TestResult.getTestResultById(req.params.rfid, req.params.id);
        if (testResults.error)
            return res.status(404).json({ error: "Test Results not found" }); //testResult not found

        //Check if TestDescriptor exists
        const test_descriptor = await DB.getTestDescriptorsIdById(req.body.newIdTestDescriptor);
        if (test_descriptor.error)
            return res.status(404).json({ error: "Test Descriptor not found" }); //test_descriptor not found

        const result = await TestResult.modifyTestResult(req.params.id, req.body.newIdTestDescriptor, req.body.newResult, req.body.newDate);
        res.status(200).json(result);

    } catch (err) {
        res.status(503).send(err);
    }
});

// DELETE a test result, given its id for a certain sku item identified by RFID
router.delete('/:id', [
    check('rfid').isString().isLength({ min: 32, max: 32 }),
    check('id').isInt()
], async (request, response) => {

    try {
        const errors = validationResult(request);
        if (!errors.isEmpty())
            return response.status(422).json({ errors: errors.array() });

        let testResults = await TestResult.getTestResultById(request.params.rfid, request.params.id);
        if (testResults.error)
            return response.status(404).json({ error: "Test Results not found" }); //testResult not found

        await TestResult.deleteTestResult(request.params.rfid, request.params.id);
        response.status(204).end();

    } catch (err) {
        response.status(503).json({ error: `Database error while deleting: ${request.params.id}.` });
    }
});

module.exports = router;