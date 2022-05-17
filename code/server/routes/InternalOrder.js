'use strict';

const express = require('express');
const router = express.Router();
const internalOrder_DAO = require('../modules/InternalOrder');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { check, validationResult } = require('express-validator'); // validation middleware

router.use(express.json());
dayjs.extend(customParseFormat);

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }

function skipThisRoute(req, res, next) {
    if (req.originalUrl == "/api/internalOrdersAccepted" || req.originalUrl == "/api/internalOrdersIssued") {
        return next('route');
    }
    return next();
}

function skipThisRoute2(req, res, next) {
    if (req.originalUrl == "/api/internalOrdersIssued") {
        return next('route');
    }
    return next();
}

/**************** INTERNAL ORDER *****************/
// GET /api/internalOrders
router.get('/', skipThisRoute, async (req, res) => {
    try {
        let internalOrders = await internalOrder_DAO.getAllInternalOrders();
        let InternalOrdersProduct = await internalOrder_DAO.getAllInternalOrdersProduct();
        let InternalOrdersSKUItems = await internalOrder_DAO.getAllInternalOrdersSKUItems();
        internalOrders.forEach(io => {
            if (io.state != "COMPLETED") {
                //console.log("state is not COMPLETED.");
                io.products = InternalOrdersProduct.filter(ip => ip.internalOrderID == io.id).map(ip => ip);
            } else {
                //console.log("state is COMPLETE.");
                io.products = InternalOrdersSKUItems.filter(is => is.internalOrderID == io.id).map(is => is);
            }
        })
        res.status(200).json(internalOrders);
    } catch (err) {
        res.status(500).end();
    }
});

// GET /api/internalOrdersAccepted
router.get('/', skipThisRoute2, async (req, res) => {
    try {
        let internalOrders = await internalOrder_DAO.getInternalOrderByState("ACCEPTED");
        // console.log(internalOrders);
        res.status(200).json(internalOrders);
    } catch (err) {
        res.status(500).end();
    }
});

// GET /api/internalOrdersIssued
router.get('/', async (req, res) => {
    try {
        let internalOrders = await internalOrder_DAO.getInternalOrderByState("ISSUED");
        // console.log(internalOrders);
        res.status(200).json(internalOrders);
    } catch (err) {
        res.status(500).end();
    }
});

// GET /api/internalOrders/:id
router.get('/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let internalOrders = await internalOrder_DAO.getInternalOrderById(req.params.id);
        if (internalOrders.error) res.status(404).json(internalOrders);

        let InternalOrdersProduct = await internalOrder_DAO.getInternalOrdersProductById(req.params.id);
        let InternalOrdersSKUItems = await internalOrder_DAO.getInternalOrdersSKUItemById(req.params.id);

        if (internalOrders.state != "COMPLETED") {
            internalOrders.products = [...InternalOrdersProduct];
        } else {
            internalOrders.products = [...InternalOrdersSKUItems];
        }
        res.status(200).json(internalOrders);
    } catch (err) {
        res.status(500).end();
    }
});

// POST /api/internalOrders
router.post('/', [
    check('customerId').exists().isInt({ min: 1 }),
    check('issueDate').isString(),
    check('products').isArray(),
    check('products.*.SKUId').exists().isInt({ min: 1 }),
    check('products.*.description').isString(),
    check('products.*.price').isFloat({ gt: 0 }),
    check('products.*.qty').isInt({ min: 1 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        if (!CheckIfDateIsValid(req.body.issueDate))
            res.status(422).send("issueDate is not valid");

        //Verify whether the product is available in the internalOrder_DAO
        for (let p of req.body.products) {
            let product = await internalOrder_DAO.getInternalOrdersProductBySKUId(p.SKUId);
            if (product.error)
                res.status(422).end();
        }

        const lastId = await internalOrder_DAO.getLastInternalOrderId()
        const result = await internalOrder_DAO.createNewInternalOrder(lastId + 1, req.body.issueDate, "ISSUED", req.body.customerId);

        res.status(201).json(result);
    } catch (err) {
        res.status(503).end();
    }
});

// PUT /api/internalOrders/:id
// Products array is ignored if newState != 'COMPLETED'
router.put('/:id', [
    check('id').exists().isInt({ min: 1 }),
    check('newState').exists().isString()
        .isIn(['ISSUED', 'ACCEPTED', 'REFUSED', 'CANCELED', 'COMPLETED'])
        .withMessage('<newState> must be [ISSUED, ACCEPTED, REFUSED, CANCELED, COMPLETED]'),
    check('products').optional()
        .if(check('newState').exists().isString().isIn(['COMPLETED'])).isArray({ min: 1 }),
    check('products.*.SkuID')
        .if(check('newState').exists().isString().isIn(['COMPLETED']))
        .if(check('products').exists()).exists().isInt({ min: 1 }),
    check('products.*.RFID')
        .if(check('newState').exists().isString().isIn(['COMPLETED']))
        .if(check('products').exists()).exists().isNumeric().isLength({ min: 32, max: 32 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let internalOrder = await internalOrder_DAO.getInternalOrderById(req.params.id);
        if (internalOrder.error)
            res.status(404).json(internalOrder);

        if (req.body.newState == "COMPLETED") {
            for (const p of req.body.products) {
                await internalOrder_DAO.modifyInternalOrderSKUItems(req.params.id, p.RFID);
            }
        }
        const result = await internalOrder_DAO.modifyInternalOrder(req.params.id, req.body.newIssueDate, req.body.newState, req.body.newCustomerId);
        res.status(200).json(result);
    } catch (err) {
        res.status(503).end();
    }
});

//DELETE /api/internalOrders/:id
router.delete('/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let io = await internalOrder_DAO.getInternalOrderById(req.params.id);
        if (io.error)
            return res.status(404).json(io);
        await internalOrder_DAO.deleteInternalOrderByID(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(503).end();
    }
});

module.exports = router;