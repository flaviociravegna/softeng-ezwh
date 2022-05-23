const express = require('express');
const router = express.Router();
const RestockOrder_DAO = require('../modules/RestockOrder');
const SKU_db = require('../modules/SKU')
const { check, validationResult, body } = require('express-validator'); // validation middleware
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

router.use(express.json());
dayjs.extend(customParseFormat);

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }

function skipThisRoute(req, res, next) { return (req.originalUrl == "/api/restockOrdersIssued") ? next('route') : next(); }

/*******************************************/
/*********** Restock Order APIs  ***********/

//Return an array containing all restock orders.
router.get('/', skipThisRoute, async (req, res) => {
    try {
        let ROs = await RestockOrder_DAO.getRestockOrders();
        for (let ro of ROs) {
            ro.products = await RestockOrder_DAO.getRestockOrderProducts(ro.id);
            ro.skuItems = await RestockOrder_DAO.getRestockOrderSkuItems(ro.id);

            ro.transportNote = await RestockOrder_DAO.getRestockOrderTransportNote(ro.id);
        }

        const Result = ROs.map((row) => {
            let obj = {
                id: row.id,
                issueDate: row.issueDate,
                state: row.state,
                products: row.products,
                supplierId: row.supplierId,
                skuItems: (row.state == "ISSUED" || row.state == "DELIVERY") ? [] : row.skuItems
            }

            if (row.state != "ISSUED")
                obj.transportNote = row.transportNote;

            return obj;
        });

        res.status(200).json(Result);
    } catch (err) {
        res.status(500).send(err);
    }
});


//Returns an array of all restock orders in state = ISSUED.
router.get('/', async (req, res) => {
    try {
        let ROs = await RestockOrder_DAO.getRestockOrdersIssued();
        for (let ro of ROs)
            ro.products = await RestockOrder_DAO.getRestockOrderProducts(ro.id);

        const Result = ROs.map((row) => ({
            id: row.id,
            issueDate: row.issueDate,
            state: row.state,
            products: row.products,
            supplierId: row.supplierId,
            skuItems: []
        }));

        res.status(200).json(Result);
    } catch (err) {
        res.status(500).send(err);
    }
});


//Return a restock order, given its id.
router.get('/:id', [
    check('id').notEmpty().isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let RO = await RestockOrder_DAO.getRestockOrderById(req.params.id);
        if (RO.error)
            return res.status(404).end();

        RO.products = await RestockOrder_DAO.getRestockOrderProducts(req.params.id);
        RO.transportNote = await RestockOrder_DAO.getRestockOrderTransportNote(req.params.id);

        if (RO.state == "ISSUED" || RO.state == "DELIVERY") {
            RO.skuItems = []
            if (RO.state == "ISSUED")
                delete RO.transportNote;
        } else
            RO.skuItems = await RestockOrder_DAO.getRestockOrderSkuItems(req.params.id);



        res.status(200).json(RO);
    } catch (err) {
        res.status(500).send(err);
    }
});


//Return sku items to be returned of a restock order, given its id.
//************************************************** */
router.get('/:id/returnItems', [
    check('id').notEmpty().isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let ROs = await RestockOrder_DAO.getRestockOrderById(req.params.id);
        if (ROs.error)
            return res.status(404).end();

        if (ROs.state != 'COMPLETEDRETURN')
            return res.status(422).send("State is not COMPLETEDRETURN");

        const items = await RestockOrder_DAO.getRestockOrderFailedSKUItems(req.params.id);

        res.status(200).json(items);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Creates a new restock order in state = ISSUED with an empty list of skuItems.
// not sure how to acces issueDate
router.post('/', [
    check('issueDate').isString(),
    check('supplierId').isInt({ min: 1 }),
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

        //check date validity
        if (!CheckIfDateIsValid(req.body.issueDate))
            return res.status(422).json({ error: "Invalid date format" });

        //check if supplierId exists
        // Better with 404 error, but not present in API
        const supplier = await DB.getSupplierById(req.body.supplierId);
        if (supplier.error)
            return res.status(422).json({ error: "Supplier Not Found" });

        let skuId_array = [];
        for (let prod of req.body.products) {

            if (skuId_array.includes(prod.SKUId))
                return res.status(422).json({ error: "Duplicated SKU" });

            skuId_array.push(prod.SKUId);
            let sku = await SKU_db.getSKUById(prod.SKUId);
            if (sku.error)
                return res.status(422).send("SKUId " + prod.SKUId + " not found in the db");

        }

        const Id = await ROProductsTableID.getLastIdRsO();
        await ROProductsTableID.createRestockOrder(req.body.issueDate, req.body.supplierId, Id + 1);

        const ROProductsTableID = await RestockOrder_DAO.getLastPIDInOrder(Id);
        for (const prod of req.body.products)
            await ROProductsTableID.insertProductInOrder(Id + 1, ROProductsTableID, prod.SKUId, prod.qty);

        res.status(201).end();
    } catch (err) {
        res.status(503).send(err);
    }
});


//Modify the state of a restock order, given its id.
router.put('/:id', [
    check('id').isInt({ min: 1 }),
    check('newState').exists().isString().toUpperCase()     // Check if the new State is allowed
        .isIn(['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETEDRETURN', 'COMPLETED'])
        .withMessage('<newState> must be [ISSUED, DELIVERY, DELIVERED, TESTED, COMPLETEDRETURN, COMPLETED]')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        //Check if Restock Order exists
        let RO = await RestockOrder_DAO.getRestockOrderById(req.params.id);
        if (RO.error)
            return res.status(404).end();

        await RestockOrder_DAO.modifyRestockOrderState(req.params.id, req.body.newState);
        res.status(200).end();
    } catch (err) {
        res.status(503).send(err);
    }
});


//Add a non empty list of skuItems to a restock order, given its id. If a restock order has already a non empty list of skuItems, merge both arrays
router.put('/:id/skuItems', [
    check('id').isInt({ min: 1 }),
    check('skuItems').isArray(),
    check('skuItems.*.SKUId').exists().isInt({ min: 1 }),
    check('skuItems.*.rfid').isNumeric().isLength({ min: 32, max: 32 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        //Check if Restock Order exists
        let RO = await RestockOrder_DAO.getRestockOrderById(req.params.id);
        if (RO.error)
            return res.status(404).end();

        if (RO.state != 'DELIVERED')
            return res.status(422).json({ error: "Restock order not delivered" });

        //check if SKUId exists in Restock Order
        let skuId_array = [];
        for (let prod of req.body.skuItems) {
            if (!skuId_array.includes(prod.SKUId)) {
                skuId_array.push(prod.SKUId);

                let sku = await RestockOrder_DAO.getSKUByIdFromRestockOrder(prod.SKUId, req.params.id);
                if (sku.error)
                    return res.status(422).send("SKUId " + prod.SKUId + " not found in restock Order " + req.params.id);
            }
        }

        for (const prod of req.body.skuItems)
            await RestockOrder_DAO.addRestockOrderSKUItems(req.params.id, prod.rfid);

        res.status(200).end();
    } catch (err) {
        res.status(503).send(err);
    }
});


//Add a transport note to a restock order, given its id.
router.put('/:id/transportNote', [
    check('id').isInt({ min: 1 }),
    check('transportNote').notEmpty().isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let ROs = await RestockOrder_DAO.getRestockOrderById(req.params.id);
        if (ROs.error)
            return res.status(404).json({ error: " No restock Order Found)" }).end();

        if (ROs.state != 'DELIVERY')
            return res.status(422).json({ error: "Order state must be DELIVERY" });

        if (!CheckIfDateIsValid(req.body.transportNote.deliveryDate))
            return res.status(422).json({ error: "transportNote.deliveryDate format not valid" });

        // Check if deliveryDate is before issueDate
        if (dayjs(req.body.transportNote.deliveryDate).isBefore(dayjs(ROs.issueDate)))
            return res.status(422).json({ error: "Delivery date is before issue date" });

        await RestockOrder_DAO.addRestockOrderTransportNote(req.params.id, req.body.transportNote);
        res.status(200).end();
    } catch (err) {
        res.status(503).send(err);
    }
});


//Delete a restock order, given its id.
router.delete('/:id', [
    check('id').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        const RO = await RestockOrder_DAO.getRestockOrderById(req.params.id);
        if (RO.error)
            return res.status(422).json({ error: "Not Found" });

        await RestockOrder_DAO.deleteSkuItemsFromRestockOrder(req.params.id);
        await RestockOrder_DAO.deleteProductsFromRestockOrder(req.params.id);
        await RestockOrder_DAO.deleteRestockOrderTransportNote(req.params.id);
        await RestockOrder_DAO.deleteRestockOrder(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(503).send(err);
    }
});

module.exports = router;