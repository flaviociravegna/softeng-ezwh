'use strict';

const express = require('express');
const router = express.Router();
const SKU_DAO = require('../modules/SKU');
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
                io.products = InternalOrdersProduct.filter(ip => ip.internalOrderID == io.id).map(ip => ({ "SKUId": ip.skuID, "description": ip.description, "price": ip.price, "qty": ip.quantity }));
            } else {
                io.products = InternalOrdersSKUItems.filter(is => is.internalOrderID == io.id).map(is => ({ "SKUId": is.skuID, "description": is.description, "price": is.price, "RFID": is.RFID }));
            }
        });

        res.status(200).json(internalOrders);
    } catch (err) {
        res.status(500).end();
    }
});

// GET /api/internalOrdersAccepted
router.get('/', skipThisRoute2, async (req, res) => {
    try {
        let internalOrders = await internalOrder_DAO.getInternalOrderByState("ACCEPTED");
        let InternalOrdersProduct = await internalOrder_DAO.getAllInternalOrdersProduct();
        internalOrders.forEach(io => {
            io.products = [...InternalOrdersProduct.filter(ip => ip.internalOrderID == io.id).map(ip => ({ "SKUId": ip.skuID, "description": ip.description, "price": ip.price, "qty": ip.quantity }))];
        });

        res.status(200).json(internalOrders);
    } catch (err) {
        res.status(500).end();
    }
});

// GET /api/internalOrdersIssued
router.get('/', async (req, res) => {
    try {
        let internalOrders = await internalOrder_DAO.getInternalOrderByState("ISSUED");
        let InternalOrdersProduct = await internalOrder_DAO.getAllInternalOrdersProduct();
        internalOrders.forEach(io => {
            io.products = [...InternalOrdersProduct.filter(ip => ip.internalOrderID == io.id).map(ip => ({ "SKUId": ip.skuID, "description": ip.description, "price": ip.price, "qty": ip.quantity }))];
        });

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
        if (internalOrders.error) return res.status(404).json(internalOrders);

        let InternalOrdersProduct = await internalOrder_DAO.getInternalOrdersProductById(req.params.id);
        let InternalOrdersSKUItems = await internalOrder_DAO.getInternalOrdersSKUItemById(req.params.id);

        if (internalOrders.state != "COMPLETED") {
            internalOrders.products = [...InternalOrdersProduct.map(ip => ({ "SKUId": ip.skuID, "description": ip.description, "price": ip.price, "qty": ip.quantity }))];
        } else {
            internalOrders.products = [...InternalOrdersSKUItems.map(ip => ({ "SKUId": ip.skuID, "description": ip.description, "price": ip.price, "RFID": ip.RFID }))];
        }
        res.status(200).json(internalOrders);
    } catch (err) {
        res.status(500).end();
    }
});

// POST /api/internalOrders
router.post('/', [
    check('customerId').exists().not().isString().isInt({ min: 1 }),
    check('issueDate').isString(),
    check('products').isArray(),
    check('products.*.SKUId').exists().not().isString().isInt({ min: 1 }),
    check('products.*.description').isString(),
    check('products.*.price').not().isString().isFloat({ gt: 0 }),
    check('products.*.qty').not().isString().isInt({ min: 1 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        if (!CheckIfDateIsValid(req.body.issueDate))
            return res.status(422).send("issueDate is not valid");

        //Verify whether the SKU is available and is not duplicated in the order
        const array_length = req.body.products.reduce((a, b) => a.SKUId > b.SKUId ? a.SKUId : b.SKUId);
        let array_SKUs_already_found = new Array(array_length).fill(false);

        for (let p of req.body.products) {
            let product = await SKU_DAO.getSKUById(p.SKUId);
            if (product.error)
                return res.status(422).send("Product (SKUId: " + p.SKUId + ") not found in the SKU list");
            else if (array_SKUs_already_found[p.SKUId] == true)
                return res.status(422).send("Product (SKUId: " + p.SKUId + ") duplicated in the internal order");

            array_SKUs_already_found[p.SKUId] = true;
        }

        const lastId = await internalOrder_DAO.getLastInternalOrderId();
        await internalOrder_DAO.createNewInternalOrder(lastId + 1, req.body.issueDate, "ISSUED", req.body.customerId);
        for (const p of req.body.products)
            await internalOrder_DAO.addInternalOrdersProducts(lastId + 1, p.SKUId, p.qty);

        res.status(201).end();
    } catch (err) {
        res.status(503).end();
    }
});

// PUT /api/internalOrders/:id
// Products array is ignored if newState != 'COMPLETED'
router.put('/:id', [
    check('id').exists().isInt({ min: 1 }),
    check('newState').exists().isString().toUpperCase()
        .isIn(['ISSUED', 'ACCEPTED', 'REFUSED', 'CANCELED', 'COMPLETED'])
        .withMessage('<newState> must be [ISSUED, ACCEPTED, REFUSED, CANCELED, COMPLETED]'),
    check('products')
        .if(check('newState').exists().isString().isIn(['COMPLETED']))
        .exists()
        .withMessage('<products> is required if <newState> is COMPLETED')
        .isArray({ min: 1 })
        .withMessage('<products> must be an array'),
    check('products.*.SkuID')
        .if(check('newState').exists().isString().isIn(['COMPLETED']))
        .if(check('products').exists()).exists().not().isString().isInt({ min: 1 }),
    check('products.*.RFID')
        .if(check('newState').exists().isString().isIn(['COMPLETED']))
        .if(check('products').exists()).exists().isString().isNumeric().isLength({ min: 32, max: 32 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let internalOrder = await internalOrder_DAO.getInternalOrderById(req.params.id);
        if (internalOrder.error)
            return res.status(404).json(internalOrder);

        if (req.body.newState == "COMPLETED") {
            for (const p of req.body.products) {
                await internalOrder_DAO.addInternalOrdersSKUItems(req.params.id, p.RFID);
            }
        }

        await internalOrder_DAO.modifyInternalOrder(internalOrder.id, internalOrder.issueDate, req.body.newState, internalOrder.customerID);
        res.status(200).end();
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
            return res.status(422).json(io);

        await internalOrder_DAO.deleteInternalOrderByID(req.params.id);
        await internalOrder_DAO.deleteInternalOrderProducts(req.params.id);
        if (io.state == "COMPLETED")
            await internalOrder_DAO.deleteInternalOrderSKUItems(req.params.id);

        res.status(204).end();
    } catch (err) {
        res.status(503).end();
    }
});

module.exports = router;