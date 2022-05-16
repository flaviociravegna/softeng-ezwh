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
      //console.log("step1");
      const RO = await returnOrder_DAO.getReturnOrders();
      //console.log("step2");
  
      for (let i = 0; i < RO.length; i++) {
        // console.log("step3");
        RO[i].products = await returnOrder_DAO.getReturnOrderProducts(RO[i].id);
        console.log(RO[i].products);
      }
      //console.log(RO);
      res.status(200).json(RO);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
  
//Return a return order, given its id.
router.get('/:id', [
    check('id').isNumeric()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            res.status(422).json({ erros: errors.array() });

        //console.log("step1");
        let RO = await returnOrder_DAO.getReturnOrderById(req.params.id);
        if (RO.error) {
            return res.status(404).json({ error: "Not Found" });
        }
  
        RO.products = await returnOrder_DAO.getReturnOrderProducts(RO.id);
    
        res.status(200).json(RO);;
  
    } catch (err) {
        res.status(500).send(err);
    }
});
  
  
//Creates a new return order.
router.post('/', [
    check('returnDate').notEmpty(),
    check('products').notEmpty(),
    check('restockOrderId').isNumeric({ gt: -1 })
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

            let id = await returnOrder_DAO.getLastReturnOrderId();
            let temp = await returnOrder_DAO.createNewReturnOrder(req.body.returnDate, req.body.restockOrderId, id + 1);

            console.log("created new order");
            console.log(temp);

            if (temp.error)
                return res.status(503).send(err);

            for (let i = 0; i < req.body.products.length; i++) {
                console.log("inserting Products");
                temp = await returnOrder_DAO.insertProductInRO(req.body.products[i], id + 1);
                if (temp.error) {
                    console.log("error inserting product" + i);
                    res.status(504);
                }
            }
        }
        
        res.status(201).end();

    } catch (err) {
        //console.log("We got an error");
        console.log(err);
        res.status(503).send(err);
    }

});
  
  
//Delete a return order, given its id.
router.delete('/:id', [
    check('id').isNumeric()
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