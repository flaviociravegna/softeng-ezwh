'use strict';

const express = require('express');
const router = express.Router();
const internalOrder_DAO = require('../modules/InternalOrder');
const { check, validationResult } = require('express-validator'); // validation middleware
router.use(express.json());
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }

function skipThisRoute (req, res, next) {
    if (req.originalUrl == "/api/internalOrdersAccepted" || req.originalUrl == "/api/internalOrdersIssued") {
        return next('route');
    }
    return next();
}

function skipThisRoute2 (req, res, next) {
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
router.get('/:id', async (req, res) => {
    try {
        let internalOrders = await internalOrder_DAO.getInternalOrderById(req.params.id);
        if (internalOrders.error) res.status(404).json(internalOrders);

        let InternalOrdersProduct = await internalOrder_DAO.getInternalOrdersProductById(req.params.id);
        let InternalOrdersSKUItems = await internalOrder_DAO.getInternalOrdersSKUItemById(req.params.id);

        if (internalOrders.state != "COMPLETED") {
            internalOrders.products = [...InternalOrdersProduct];
        }
        else {
            internalOrders.products = [...InternalOrdersSKUItems];
        }
        res.status(200).json(internalOrders);
    } catch (err) {
        res.status(500).end();
    }
});

// POST /api/internalOrders
router.post('/', async (req, res) => {
    try {

        //Verify whether the product is available in the internalOrder_DAO
        for (let p of req.body.products) {
            console.log(p.SKUId);
            let product = await internalOrder_DAO.getInternalOrdersProductBySKUId(p.SKUId);
            if (product.error) {
                console.log(product);
                res.status(404).end();
            }
        }
        const lastId = await internalOrder_DAO.getLastInternalOrderId()
        const result = await internalOrder_DAO.createNewInternalOrder(lastId + 1, req.body.issueDate, "ISSUED", req.body.customerId);

        res.status(201).json(result);
    } catch (err) {
        res.status(503).end();
    }
});

// PUT /api/internalOrders/:id
router.put('/:id', async (req, res) => {
    try {

        let internalOrder = await internalOrder_DAO.getInternalOrderById(req.params.id);

        if (internalOrder.error)
            res.status(404).json(internalOrder);
        if (req.body.newState == "COMPLETED") {
            for (const p of req.body.products) {
                const SI = await internalOrder_DAO.modifyInternalOrderSKUItems(req.params.id, p.RFID);
            }
        }
        const result = await internalOrder_DAO.modifyInternalOrder(req.params.id, req.body.newIssueDate, req.body.newState, req.body.newCustomerId);
        res.status(200).json(result);
    } catch (err) {
        res.status(503).end();
    }
});

//DELETE /api/internalOrders/:id
router.delete('/:id', async (req, res) => {
    try {
        await internalOrder_DAO.deleteInternalOrderByID(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(503).end();
    }
});

module.exports = router;