const express = require('express');
const router = express.Router();
const DB = require('../modules/RestockOrder');
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
/*********** Restock Order APIs  ********/


//Return an array containing all restock orders.
router.get('/', skipThisRoute, async (req, res) => {
    try {
        //console.log("getting restock Orders");
        const ROs = await DB.getRestockOrders();
        //console.log("getting restock Orders Products");
        //console.log(ROs);
        //console.log(ROs.length);
        for(let i=0; i<ROs.length; i++){
        // console.log(ROs[i].id + ".getting products");
            ROs[i].products = await DB.getRestockOrderProducts(ROs[i].id);
        // console.log(ROs[i].id + ".getting SkuItems")
            ROs[i].skuItems = await DB.getRestockOrderSkuItems(ROs[i].id);
        // console.log(ROs[i].id + ".Got SkuItems")
        }
         
        const Result = ROs.map((row) => ({
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
        console.log("Error");
        console.log(err);
        res.status(500).send(err);
    }
});


//Returns an array of all restock orders in state = ISSUED.
router.get('/', async (req, res) => {
    try {
        const ROs = await DB.getRestockOrdersIssued();
        for(let i=0; i<ROs.length; i++){
            ROs[i].products = await DB.getRestockOrderProducts(ROs[i].id);
            //console.log(ROs[i].id + ".getting SkuItems")
            ROs[i].skuItems = await DB.getRestockOrderSkuItems(ROs[i].id);
            //console.log(ROs[i].id + ".Got SkuItems") 
        }

        const Result = ROs.map((row) => ({
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
router.get('/:id', [
    check('id').exists().isNumeric({ min: 1 })
], async (req, res) => {
    try {
        //console.log("step 1");
        const errors = validationResult(req);
        if (!errors.isEmpty()){
          //console.log("Erros");
          return res.status(422).json({ errors: errors.array() });
        }
        //console.log("step 2");
           

        let RO = await DB.getRestockOrderById(req.params.id);
        //console.log("step 3");
        //console.log(RO.error);
        //console.log("*****************************************");
        //console.log(RO);

        if (!RO.id)
            return res.status(404).end();
            //console.log("No Error");
        //console.log("step 4");
        RO.products = await DB.getRestockOrderProducts(RO.id);
        //console.log("step 5");
        RO.skuItems = await DB.getRestockOrderSkuItems(RO.id);
        res.status(200).json(RO);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Return sku items to be returned of a restock order, given its id.
//************************************************** */
// NEED TESTING
//************************************************** */


router.get('/:id/returnItems', [
    check('id').exists().isNumeric({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        let ROs = await DB.getRestockOrderById(req.params.id);
        //console.log(ROs);

        if(ROs.error)
            return res.status(404).end();

        if (ROs.state != 'COMPLETEDRETURN')
            return res.status(422).json();
        //console.log("geting items");
        let Items = await DB.getRestockOrderFailedSKUItems(req.params.id);
        //console.log("got items");
        res.status(200).json(Items);
    } catch (err) {
        res.status(500).send(err);
    }

});


//Creates a new restock order in state = ISSUED with an empty list of skuItems.
// not sure constraints on supplier ID
// not sure how to acces issueDate
// assuming supplier exist for now
router.post('/', [
    check('issueDate').optional({ nullable: true }), 
    check('products').optional({ nullable: true }), 
    check('supplierId').isNumeric()
], async (req, res) => {
    try {
       //console.log("Checking Validation");
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            //console.log(errors);
            return res.status(422).json({ errors: errors.array() });
        }
      
        //check date validity
        
        else if (req.body.issueDate != null && !CheckIfDateIsValid(req.body.issueDate)){
            return res.status(422).json({ error: "Invalid date format" });
        }
        console.log("Passed Validation");
        const Id =  await DB.getLastIdRsO();
        console.log("len: "+ req.body.products.length);
        await DB.createRestockOrder(req.body.issueDate, req.body.products, req.body.supplierId,Id + 1 );
        let pId=0;
       // console.log("len: "+ req.body.products.length);
        for(let i=0; i<req.body.products.length; i++ ){

            pId= await DB.getLastPIDInOrder(Id+1);
            console.log("PID:"+pId);
            let temp = await DB.insertProductInOrder(Id+1, req.body.products[i], pId+1);
            console.log("temp"+temp);
            if (temp.error)
                res.status(501).send(err);
      
        }
        res.status(201).end();

    } catch (err) {
        res.status(500).send(err);
    }
});


//Modify the state of a restock order, given its id.
router.put('/:id', [
    check('id').isNumeric()
], async (req, res) => {
    console.log("In PUT newState");
    try {
        const errors = validationResult(req);
        console.log("checking errors");
        if (!errors.isEmpty()){
            console.log("In Errors");
            return res.status(422).json({ errors: errors.array() });
        }
            
        else if (req.body.newState == null || !CheckifStateValid(req.body.newState)){
            console.log("Problem With newState");
            return res.status(422).json({ error: "Invalid State" });
        }
            
        else {
            console.log("checking if ROS exists");
            let RO = await DB.getRestockOrderById(req.params.id);
            console.log("Got ROs");
            if (!RO)
                return res.status(404).json({ error: "Not Found" });
        }

        console.log("Modifiying state");
        await DB.modifyRestockOrderState(req.params.id, req.body.newState);
        console.log("Modified new state");
        res.status(200).end();

    } catch (err) {
        res.status(500).send(err);
    }
});


//Add a non empty list of skuItems to a restock order, given its id. If a restock order has already a non empty list of skuItems, merge both arrays
router.put('/:id/skuItems', [
    check('id').isNumeric(), 
    check('skuItems').notEmpty()
], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else {
            let RO = await DB.getRestockOrderById(req.params.id);

            if (RO.error)
                return res.status(404).json({ error: "Not Found" });
           // console.log(RO);
            if (RO.state != 'DELIVERED')
                return res.status(422).json({ error: "Unprocessable Entity" });
        }

        await DB.addRestockOrderSKUItems(req.params.id, req.body.skuItems);
        res.status(200).end();

    } catch (err) {
        res.status(500).send(err);
    }


});


//Add a transport note to a restock order, given its id.
router.put('/:id/transportNote', [
    check('id').isNumeric({ min : 1}),
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
    check('id').isNumeric()
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

