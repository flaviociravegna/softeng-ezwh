'use strict';

const express = require('express');
const router = express.Router();
const returnOrder_DAO = require('../modules/ReturnOrder');
const restockOrder_DAO = require('../modules/RestockOrder');
const { check, validationResult } = require('express-validator'); // validation middleware
router.use(express.json());
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }


/*********** Return Order APIs  ********/
//Return an array containing all return orders.
router.get('/', async (req, res) => {
    try {
      const RO = await returnOrder_DAO.getReturnOrders();

      for (let returnOrder of RO) {
        returnOrder.products = await returnOrder_DAO.getReturnOrderProducts(returnOrder.id);
      }
    
      res.status(200).json(RO);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
  
//Return a return order, given its id.
router.get('/:id', [
    check('id').isNumeric({min: 1})
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            res.status(422).json({ erros: errors.array() });

        let RO = await returnOrder_DAO.getReturnOrderById(req.params.id);
        if (RO.error) {
            return res.status(404).json({ error: "Not Found" });
        }
  
        RO.products = await returnOrder_DAO.getReturnOrderProducts(req.params.id);
        res.status(200).json(RO);;
  
    } catch (err) {
        res.status(500).send(err);
    }
});
  

//Creates a new return order.
router.post('/', [
    check('returnDate').notEmpty(),
    check('products').isArray(),
    check('products.*.SKUId').exists().isInt({ min: 1 }),
    check('products.*.description').isString(),
    check('products.*.price').isFloat({ gt: 0 }),
    check('products.*.RFID').isNumeric().isLength({ min: 32, max: 32 }),
    check('restockOrderId').isNumeric({ gt: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ erros: errors.array() });
        } else {

            let RO = await restockOrder_DAO.getRestockOrderById(req.body.restockOrderId);
            if (RO.error) {
                return res.status(404).json({ error: "no RestockOrder associated to restockOrderID " });
            }

            if (!CheckIfDateIsValid(req.body.returnDate))
                return res.status(422).json({ error: "wrong date format" });

            //check if SKUItem exists in Restock Order
            for (let SKUItem of req.body.products) {
                let sku = await returnOrder_DAO.getRFIDFromRestockOrder(SKUItem.RFID, req.body.restockOrderId);
                    if (sku.error)
                        return res.status(422).send("RFID " + SKUItem.RFID + " not found in restock Order" + req.body.restockOrderId);
                }
            }

            let id = await returnOrder_DAO.getLastReturnOrderId();
            let temp = await returnOrder_DAO.createNewReturnOrder(req.body.returnDate, req.body.restockOrderId, id + 1);

            for (let product of req.body.products) {
                await returnOrder_DAO.insertProductInRO(product, id + 1);
            }
        
        res.status(201).end();

    } catch (err) {
        res.status(503).send(err);
    }

});
  
  
//Delete a return order, given its id.
router.delete('/:id', [
    check('id').isNumeric({min: 1})
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ erros: errors.array() });
        else {
            let RO = await returnOrder_DAO.getReturnOrderById(req.params.id);
            if (RO.error)
                return res.status(422).json({ error: "Not Found" });
        }

        await returnOrder_DAO.deleteReturnOrderProducts(req.params.id);
        await returnOrder_DAO.deleteReturnOrder(req.params.id);

        res.status(204).end();

    } catch (err) {
        res.status(503).send(err);
    }

});

module.exports = router;