'use strict';

const express = require('express');
const router = express.Router();
const ReturnOrder = require('../modules/ReturnOrder');
const RestockOrder = require('../modules/RestockOrder');
const { check, validationResult, body } = require('express-validator'); // validation middleware
router.use(express.json());

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }


/*********** Return Order APIs  ********/
//Return an array containing all return orders.
router.get('/api/returnOrders', async (req, res) => {
    try {
        const ReturnOrders = await ReturnOrder.getReturnOrders();
        const Result = ReturnOrders.map((row) => ({
            id: row.id,
            returnDate: row.returnDate,
            products: row.products,
            restockOrderId: row.restockOrderId,
        }));
        res.status(200).json(Result);
    }
    catch (err) {
        res.status(500).send(err);
    }
});


//Return a return order, given its id.
router.get('/api/returnOrders/:id', [check('id').isNumeric()], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ erros: erros.array() });


        let RO = await ReturnOrder.getReturnOrderById(req.params.id);
        if (RO == null || RO.isEmpty())
            return res.status(404).json({ error: "Not Found" });

        const Result = RO.map((row) => ({
            id: row.id,
            returnDate: row.returnDate,
            products: row.products,
            restockOrderId: row.restockOrderId
        }));
       
        res.status(200).json(Result);;

    }
    catch (err) {

        res.status(500).send(err);
    }


});


//Creates a new return order.

router.post('/api/returnOrder', [
    check('returnDate').notEmpty(),
    check('products').notEmpty().isArray(),
    check('restockOrderID').isInt({ gte: 0 }),
], async (req, res) => {

    try {
        const erros = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ erros: erros.array() });
        else {

            let RO = RestockOrder.getRestockOrderById(req.body.restockOrderID);
            if (RO == null || RO.isEmpty()) {
                return res.status(404).json({ error: "no RestockOrder associated to restockOrderID " });
            }
            if (!CheckIfDateIsValid(req.body.returnDate))
                return res.status(422).json({ erros: erros.array() });

            ReturnOrder.createNewReturnOrder(req.body.returnDate, req.body.products, req.body.restockOrderID);
        }


        res.status(201);

    }
    catch (err) {

        res.status(503).send(err);
    }

});


//Delete a return order, given its id.
router.delete('/api/returnOrder/:id', [check('id').isNumeric()], async (req, res) => {
    try {
        const erros = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ erros: erros.array() });
        else {
            let RO = await ReturnOrder.getReturnOrderById(req.params.id);
            if (RO == null || RO.isEmpty())
                return res.status(422).json({ error: "Not Found" });
        }

        await ReturnOrder.deleteReturnOrder(req.params.id);
        res.status(204);

    }
    catch (err) {

        res.status(503).send(err);
    }

});