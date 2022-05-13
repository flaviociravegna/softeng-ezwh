const express = require('express');
const router = express.Router();
const RestockOrder = require('../modules/RestockOrder');
const { check, validationResult, body } = require('express-validator'); // validation middleware
router.use(express.json());

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }
function CheckifStateValid(State) {
    let VALIDSTATES = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETEDRETURN', 'COMPLETED'];
    return (VALIDSTATES.includes(State));
}


/*********** Restock Order APIs  ********/


//Return an array containing all restock orders.
router.get('/api/restockOrders', async (req, res) => {
    try {
        const RestockOrders = await RestockOrder.getRestockOrders();
        const Result = RestockOrders.map((row) => ({
            id: row.id,
            issueDate: row.issueDate,
            state: row.state,
            products: row.products,
            supplierId: row.supplierId,
            transportNote: row.transportNote,
            skuItems: row.skuItems,
        }));

        res.status(200).json(Result);
    } catch (err) {
        res.status(500).send(err);
    }


});


//Returns an array of all restock orders in state = ISSUED.
router.get('/api/restockOrdersIssued', async (req, res) => {
    try {
        const RestockOrders = await RestockOrder.getRestockOrdersIssued();
        const Result = RestockOrders.map((row) => ({
            id: row.id,
            issueDate: row.issueDate,
            state: row.state,
            products: row.products,
            supplierId: row.supplierId,
            //transportNote: row.transportNote, // ignored by request of the API
            skuItems: row.skuItems,
        }));

        res.status(200).json(Result);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Return a restock order, given its id.
router.get('/api/restockOrders/:id', [check('id').exists().isInt({ min: 1 })], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let RO = await RestockOrder.getRestockOrderById(req.params.id);
        if (RO.error)
            return res.status(404);

        const Result = RO.map((row) => ({
            id: row.id,
            issueDate: row.issueDate,
            state: row.state,
            products: row.products,
            supplierId: row.supplierId,
            transportNote: row.transportNote,
            skuItems: row.skuItems,
        }));

        res.status(200).json(Result);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Return sku items to be returned of a restock order, given its id.
router.get('/api/restockOrders/:id/returnItems', [check('id').exists().isInt({ min: 1 })], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let state = RestockOrder.getRestockOrderState(req.params.id);

        if (state == null || state.isEmpty() || state != 'COMPLETEDRETURN')
            return res.status(422).json();

        let Items = await RestockOrder.getRestockOrderFailedSKUItems(req.params.id);

        if (Items.error)
            return res.status(404);

        res.status(200).json(Items);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Creates a new restock order in state = ISSUED with an empty list of skuItems.
// not sure constraints on supplier ID
// not sure how to acces issueDate
// assuming supplier exist for now
router.post('/api/restockOrder', [check('issueDate').optional({ nullable: true }), check('products').optional({ nullable: true }), check('supplierId').isNumeric()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        //check date validity
        else if (req.body.issueDate != null && !CheckIfDateIsValid(req.body.issueDate))
            return res.status(422).json({ error: "Invalid date format" });

        await RestockOrder.createRestockOrder(req.body.issueDate, req.body.products, req.body.supplierId);
        res.status(201).end();

    } catch (err) {
        res.status(500).send(err);
    }


});


//Modify the state of a restock order, given its id.
router.put('/api/restockOrder/:id', [check('id').isNumeric()], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else if (req.body.newState == null || !CheckifStateValid(req.body.newState))
            return res.status(422).json({ error: "Invalid State" });
        else {
            let RO = await RestockOrder.getRestockOrderById(req.params.id);
            if (RO == null)
                return res.status(404).json({ error: "Not Found" });
        }

        await RestockOrder.modifyRestockOrderState(req.params.id, req.body.newState);
        res.status(200);

    }
    catch (err) {

        res.status(500).send(err);
    }
});


//Add a non empty list of skuItems to a restock order, given its id. If a restock order has already a non empty list of skuItems, merge both arrays
router.put('/api/restockOrder/:id/skuItems', [check('id').isNumeric(), check('skuItems').notEmpty()], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else {
            let RO = await RestockOrder.getRestockOrderById(req.params.id);
            if (RO == null || RO.isEmpty())
                return res.status(404).json({ error: "Not Found" });
            let state = RestockOrder.getRestockOrderState(req.params.id);
            if (state == null || state.isEmpty() || state != 'DELIVERED')
                return res.status(422).json({ error: "Unprocessable Entity" });
        }

        await RestockOrder.addRestockOrderSKUItems(req.params.id, req.body.skuItems);
        res.status(200);

    }
    catch (err) {

        res.status(500).send(err);
    }


});


//Add a transport note to a restock order, given its id.
router.put('/api/restockOrder/:id/transportNote', [check('id').isNumeric(), check('transportNote').notEmpty()], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else {
            let RO = await RestockOrder.getRestockOrderById(req.params.id);
            if (RO == null || RO.isEmpty())
                return res.status(404).json({ error: "Not Found" });
        }

        let state = RestockOrder.getRestockOrderState(req.params.id);
        if (!CheckifStateValid(state) || state != 'DELIVERY')
            return res.status(422).json({ error: "unprocessable Entity" });

        if (!CheckIfDateIsValid(req.body.transportNote.deliveryDate))
            return res.status(422).json({ error: "unprocessable Entity" });
        ///////////
        /////////missing check if date is in correct oreder
        /////////


        await RestockOrder.addRestockOrderTransportNote();
        res.status(204);

    }
    catch (err) {

        res.status(503).send(err);
    }



});


//Delete a restock order, given its id.
router.delete('/api/restockOrder/:id', [check('id').isNumeric()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else {
            let RO = await RestockOrder.getRestockOrderById(req.params.id);
            if (RO == null)
                return res.status(422).json({ error: "Not Found" });
        }

        await RestockOrder.deleteRestockOrder(req.params.id);
        res.status(204);

    }
    catch (err) {

        res.status(503).send(err);
    }

});




