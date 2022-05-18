const express = require('express');
const router = express.Router();
const DB = require('../modules/RestockOrder');
const SKU_db = require('../modules/SKU')
const { check, validationResult, body } = require('express-validator'); // validation middleware
router.use(express.json());
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

function CheckIfDateIsValid(date) { return dayjs(date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid(); }
function CheckifStateValid(State) {
    let VALIDSTATES = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETEDRETURN', 'COMPLETED'];
    return (VALIDSTATES.includes(State));
}

function skipThisRoute (req, res, next) {
    if (req.originalUrl == "/api/restockOrdersIssued") {
        return next('route');
    }
    return next();
}

/*******************************************/
/*********** Restock Order APIs  ***********/

//Return an array containing all restock orders.
router.get('/', skipThisRoute, async (req, res) => {
    try {

        const ROs = await DB.getRestockOrders();
        for(let i=0; i<ROs.length; i++){
            ROs[i].products = await DB.getRestockOrderProducts(ROs[i].id);
            ROs[i].skuItems = await DB.getRestockOrderSkuItems(ROs[i].id);
        }
         
        const Result = ROs.map((row) => {
            let obj = {
                id: row.id,
                issueDate: row.issueDate,
                state: row.state,
                products: row.products,
                supplierId: row.supplierId,
            }

            if (row.state != "ISSUED") 
                obj.transportNote = row.transportNote;

            if (row.state == "ISSUED" || row.state == "DELIVERY")
                obj.skuItems = [];
            else
                obj.skuItems = row.skuItems; 

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
        const ROs = await DB.getRestockOrdersIssued();
        for(let i=0; i<ROs.length; i++){
            ROs[i].products = await DB.getRestockOrderProducts(ROs[i].id);
        }

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
    check('id').exists().isNumeric({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
          return res.status(422).json({ errors: errors.array() });
        }           

        let RO = await DB.getRestockOrderById(req.params.id);
        if (RO.error)
            return res.status(404).end();

        RO.products = await DB.getRestockOrderProducts(req.params.id);

        if(RO.state == "ISSUED" || RO.state == "DELIVERY" )
            RO.skuItems = []
        else 
            RO.skuItems = await DB.getRestockOrderSkuItems(req.params.id);
        

        res.status(200).json(RO);
    } catch (err) {
        res.status(500).send(err);
    }
});


//Return sku items to be returned of a restock order, given its id.
//************************************************** */
router.get('/:id/returnItems', [
    check('id').exists().isNumeric({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let ROs = await DB.getRestockOrderById(req.params.id);

        if(ROs.error)
            return res.status(404).end();

        if (ROs.state != 'COMPLETEDRETURN')
            return res.status(422).json();

        let items = await DB.getRestockOrderFailedSKUItems(req.params.id);

        res.status(200).json(items);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Creates a new restock order in state = ISSUED with an empty list of skuItems.
// not sure how to acces issueDate
router.post('/', [
    check('supplierId').isInt({min: 1}),
    check('products').isArray(),
    check('products.*.SKUId').exists().isInt({ min: 1 }),
    check('products.*.description').isString(),
    check('products.*.price').isFloat({ gt: 0 }),
    check('products.*.qty').isInt({ min: 1 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }
      
        //check date validity
        else if (req.body.issueDate != null && !CheckIfDateIsValid(req.body.issueDate)){
            return res.status(422).json({ error: "Invalid date format" });
        }

        //check if supplierId exists
        // Better with 404 error, but not present in API
        const supplier = await DB.getSupplierById(req.body.supplierId);
        if(supplier.error)
            return res.status(422).json({ error: "Supplier Not Found"});
       
        let skuId_array = [];
        for (let prod of req.body.products) {

            if(skuId_array.includes(prod.SKUId))
                return res.status(422).json({ error: "Duplicated SKU"});
            skuId_array.push(prod.SKUId);
            let sku = await SKU_db.getSKUById(prod.SKUId);
            if (sku.error)
                 return res.status(422).send("SKUId " + prod.SKUId + " not found in the db");

        }

        const Id =  await DB.getLastIdRsO();

        await DB.createRestockOrder(req.body.issueDate, req.body.supplierId, Id + 1 );

        for (const prod of req.body.products)
            await DB.insertProductInOrder(Id + 1, prod.SKUId, prod.qty);

        res.status(201).end();

    } catch (err) {
        res.status(500).send(err);
    }
});


//Modify the state of a restock order, given its id.
router.put('/:id', [
    check('id').isInt({min: 1})
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }
        
        // Check if the new State is allowed
        if (req.body.newState == null || !CheckifStateValid(req.body.newState)){
            return res.status(422).json({ error: "Invalid State" });
        }
            
        //Check if Restock Order exists
        let RO = await DB.getRestockOrderById(req.params.id);
        if (RO.error)
            return res.status(404).json({ error: "Restock Order not Found" });

        await DB.modifyRestockOrderState(req.params.id, req.body.newState);
        res.status(200).end();

    } catch (err) {
        res.status(500).send(err);
    }
});


//Add a non empty list of skuItems to a restock order, given its id. If a restock order has already a non empty list of skuItems, merge both arrays
router.put('/:id/skuItems', [
    check('id').isInt({min: 1}),
    check('skuItems').isArray(),
    check('skuItems.*.SKUId').exists().isInt({ min: 1 }),
    check('skuItems.*.rfid').isNumeric().isLength({ min: 32, max: 32 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        
        //Check if Restock Order exists
        let RO = await DB.getRestockOrderById(req.params.id);
        if (RO.error)
            return res.status(404).json({ error: "Restock Order not Found" });

        //check if SKUId exists in Restock Order
        let skuId_array = [];
        for (let prod of req.body.skuItems) {
            if(!skuId_array.includes(prod.SKUId)){
                skuId_array.push(prod.SKUId);
                let sku = await DB.getSKUByIdFromRestockOrder(prod.SKUId, req.params.id);
                if (sku.error)
                    return res.status(422).send("SKUId " + prod.SKUId + " not found in restock Order" + req.params.id);
            }
        }
        
        if (RO.state == 'DELIVERED') {
            for (const prod of req.body.skuItems) {
                await DB.addRestockOrderSKUItems(req.params.id, prod.rfid, prod.SKUId);
            }
        } else {
            return res.status(422).json({ error: "Restock order not delivered" });
        }
        
        res.status(200).end();

    } catch (err) {
        res.status(500).send(err);
    }
});


//Add a transport note to a restock order, given its id.
router.put('/:id/transportNote', [
    check('id').isInt({ min : 1}),
    check('transportNote').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let ROs= await DB.getRestockOrderById(req.params.id);
        
        if(ROs.error){
            return  res.status(404).json({ error:" No restock Order Found)" }).end();
        }

        if (ROs.state != 'DELIVERY'){
            return res.status(422).json({ error: "unprocessable Entity" });
        }
        
        //console.log("state: " + ROs.state);
        if (!CheckIfDateIsValid(req.body.transportNote.deliveryDate))
            return res.status(422).json({ error: "unprocessable Entity" });
        ///////////
        /////////missing check if date is in correct oreder
        /////////

        console.log("putting note");
        await DB.addRestockOrderTransportNote(req.params.id, req.body.transportNote);
        console.log("Done");
        res.status(204).end();

    } catch (err) {
        res.status(503).send(err);
    }



});


//Delete a restock order, given its id.
router.delete('/:id', [
    check('id').isInt({ min : 1})
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else {
            let RO = await DB.getRestockOrderById(req.params.id);
            if (RO.error)
                return res.status(422).json({ error: "Not Found" });
        }
        
        await DB.deleteSkuItemsFromRestockOrder(req.params.id);
        await DB.deleteProductsFromRestockOrder(req.params.id);
        await DB.deleteRestockOrder(req.params.id);
        res.status(204).end();

    } catch (err) {
        res.status(503).send(err);
    }

});


module.exports = router;

