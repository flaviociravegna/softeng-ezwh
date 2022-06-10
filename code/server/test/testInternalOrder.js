const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const db_cleaning = require('./utils-dbCleaning');
var agent = chai.request.agent(app);

const N_InternalOrder = 4;
let io1 = { id: 1, issueDate: "2021/11/29 01:33", state: "ISSUED", products: [{ "SKUId": 1, "description": "a product", "price": 10.99, "qty": 1 }], customerId: 1 };
let io2 = { id: 2, issueDate: "2021/11/29 02:33", state: "ISSUED", products: [{ "SKUId": 2, "description": "a product", "price": 20.99, "qty": 1 }], customerId: 1 };
let io3 = { id: 3, issueDate: "2021/11/29 03:33", state: "ISSUED", products: [{ "SKUId": 3, "description": "a product", "price": 30.99, "qty": 1 }], customerId: 1 };
let io4 = { id: 4, issueDate: "2021/11/29 04:33", state: "ISSUED", products: [{ "SKUId": 4, "description": "a product", "price": 40.99, "qty": 1 }], customerId: 1 };

/*****************************************************************/
function setup() {

    //db cleanig
    db_cleaning.deleteAllInternalOrders(agent);
    db_cleaning.deleteAllSkuItems(agent);
    db_cleaning.deleteAllSKU(agent);

    // POST /api/sku (SUCCESS)
    describe('POST /api/sku', function () {
        createNewSKU(201, { "description": "a product", "weight": 10, "volume": 10, "notes": "notes 1", "price": 10.99, "availableQuantity": 1 });
        createNewSKU(201, { "description": "a product", "weight": 20, "volume": 20, "notes": "notes 2", "price": 20.99, "availableQuantity": 1 });
        createNewSKU(201, { "description": "a product", "weight": 30, "volume": 30, "notes": "notes 3", "price": 30.99, "availableQuantity": 1 });
        createNewSKU(201, { "description": "a product", "weight": 40, "volume": 40, "notes": "notes 4", "price": 40.99, "availableQuantity": 1 });
    });

    //POST /api/skuitem(success)
    describe('POST /api/skuitem (success)', function () {
        createNewSKUItem(201, { RFID: "12345678901234567890123456789011", SKUId: 1, DateOfStock: "2021/11/29" });
    });

    // POST /api/internalOrders (SUCCESS)
    describe('POST /api/internalOrders', function () {
        createNewInternalOrder(201, { "issueDate": "2021/11/29 01:33", "products": [{ "SKUId": 1, "description": "a product", "price": 10.99, "qty": 1 }], "customerId": 1 });
        createNewInternalOrder(201, { "issueDate": "2021/11/29 02:33", "products": [{ "SKUId": 2, "description": "a product", "price": 20.99, "qty": 1 }], "customerId": 1 });
        createNewInternalOrder(201, { "issueDate": "2021/11/29 03:33", "products": [{ "SKUId": 3, "description": "a product", "price": 30.99, "qty": 1 }], "customerId": 1 });
        createNewInternalOrder(201, { "issueDate": "2021/11/29 04:33", "products": [{ "SKUId": 4, "description": "a product", "price": 40.99, "qty": 1 }], "customerId": 1 });
    });
}

describe('API Test: InternalOrders', function () {
    setup();

    // POST /api/internalOrders (FAIL)
    describe('POST /api/internalOrders(erros)', function () {
        createNewInternalOrder(422);
        //prop's name wrong
        createNewInternalOrder(422, { "date": "2021/11/29 01:33", "products": [{ "SKUId": 1, "description": "a product", "price": 10.99, "qty": 1 }], "customerId": 1 });
        //product  empty
        createNewInternalOrder(503, { "issueDate": "2021/11/29 02:33", "products": [], "customerId": 1 });
        // SKUId string
        createNewInternalOrder(422, { "issueDate": "2021/11/29 03:33", "products": [{ "SKUId": "1", "description": "a product", "price": 30.99, "qty": 1 }], "customerId": 1 });
        // Price string
        createNewInternalOrder(422, { "issueDate": "2021/11/29 03:33", "products": [{ "SKUId": 1, "description": "a product", "price": "30.99", "qty": 1 }], "customerId": 1 });
        // customerId string
        createNewInternalOrder(422, { "issueDate": "2021/11/29 03:33", "products": [{ "SKUId": 1, "description": "a product", "price": 30.99, "qty": 1 }], "customerId": "1" });
        //skuId not in db
        createNewInternalOrder(422, { "issueDate": "2021/11/29 03:33", "products": [{ "SKUId": 114, "description": "a product", "price": 30.99, "qty": 1 }], "customerId": 1 });
        //date format wrong
        createNewInternalOrder(422, { "issueDate": "05:39 11-29-2021", "products": [{ "SKUId": 2, "description": "a product", "price": 40.99, "qty": 1 }], "customerId": 1 });
        //date format wrong
        createNewInternalOrder(422, { "issueDate": "2021/11/29 25:33", "products": [{ "SKUId": 2, "description": "a product", "price": 40.99, "qty": 1 }], "customerId": 1 });
        //date format wrong
        createNewInternalOrder(422, { "issueDate": "2021/11/34 21:33", "products": [{ "SKUId": 2, "description": "a product", "price": 40.99, "qty": 1 }], "customerId": 1 });
        //price should >0
        createNewInternalOrder(422, { "issueDate": "2021/11/29 04:33", "products": [{ "SKUId": 3, "description": "a product", "price": 0, "qty": 1 }], "customerId": 1 });
        //price as string
        createNewInternalOrder(422, { "issueDate": "2021/11/29 04:33", "products": [{ "SKUId": 3, "description": "a product", "price": "not a float number", "qty": 1 }], "customerId": 1 });//price as string
        //quantity < 0
        createNewInternalOrder(422, { "issueDate": "2021/11/29 04:33", "products": [{ "SKUId": 3, "description": "a product", "price": "not a float number", "qty": -1 }], "customerId": 1 });
    });

    // GET /api/internalOrders
    describe('GET /api/internalOrders', function () {
        getAllInternalOrders(200, N_InternalOrder, [io1, io2, io3, io4]);
    });

    // GET /api/internalOrders/:id
    describe('GET /api/internalOrders/:id', function () {
        getInternalOrder(200, 1, io1);
        getInternalOrder(200, 2, io2);
        getInternalOrder(200, 3, io3);
        getInternalOrder(200, 4, io4);
    });

    // GET /api/internalOrders/:id
    describe('GET /api/internalOrders/:id(erros)', function () {
        getInternalOrder(404, 114);
        getInternalOrder(422, "test");
    });

    //DELETE /api/internalOrders/:id(FAIL)
    describe('DELETE /api/internalOrders/:id(erros)', function () {
        deleteInternalOrder(422, 114);
        deleteInternalOrder(422, "test");
    })

    // PUT /api/internalOrders/:id/IO
    describe('PUT /api/internalOrders/:id/IO (success)', function () {
        /*****should be Success *****/
        updateInternalOrder(200, 4, { "newState": "ACCEPTED" });

    });

    // PUT /api/internalOrders/:id/IO(FAIL)
    describe('PUT /api/internalOrders/:id/IO (erros)', function () {
        //Illegal id
        updateInternalOrder(422, "should be a number", { "newState": "ACCEPTED" });
        updateInternalOrder(404, 114, { "newState": "ACCEPTED" });
        //wrong prop's name
        updateInternalOrder(422, 4, { "State": "ACCEPTED" });
    });

    clear();
});

function clear() {
    // Clear the data inserted
    // ITEM must be eliminated before
    // DELETE /api/skus/:id (SUCCESS)
    describe('DELETE /api/sku', function () {
        /***** Success *****/
        deleteSKU(204, 1);
        deleteSKU(204, 2);
        deleteSKU(204, 3);
        deleteSKU(204, 4);
    });

    // DELETE /api/skuitems/:rfid
    describe('DELETE /api/skuitems/:rfid (success)', function () {
        deleteSKUItem(204, "12345678901234567890123456789011");
    });

    //DELETE /api/internalOrders/:id
    describe('DELETE /api/internalOrders/:id(success)', function () {
        deleteInternalOrder(204, 1);
        deleteInternalOrder(204, 2);
        deleteInternalOrder(204, 3);
        deleteInternalOrder(204, 4);
    })

}


function createNewSKU(expectedHTTPStatus, SKU) {
    it('Inserting a new SKU', function (done) {
        if (SKU !== undefined) {
            agent.post('/api/sku')
                .set('content-type', 'application/json')
                .send(SKU)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/sku')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function getAllInternalOrders(expectedHTTPStatus, expectedLength, expectedIOs) {
    it('Get all InternalOrders', function (done) {
        agent.get('/api/internalOrders')
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    res.body.forEach(io => {

                        io.should.haveOwnProperty("id");
                        io.should.haveOwnProperty("customerID");
                        io.should.haveOwnProperty("issueDate");
                        io.should.haveOwnProperty("state");
                        io.should.haveOwnProperty("products");
                        io.products.should.be.an('array');
                        expectedIOs.some((internalorder) => { return compareInternalOrders(internalorder, io); }).should.be.equal(true);
                    });
                }
                done();
            });
    });
}

function getInternalOrder(expectedHTTPStatus, id, expectedIO) {
    it('Get InternalOrder by id', function (done) {
        agent.get('/api/internalOrders/' + id)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("id");
                    res.body.should.haveOwnProperty("customerID");
                    res.body.should.haveOwnProperty("issueDate");
                    res.body.should.haveOwnProperty("state");
                    res.body.should.haveOwnProperty("products");
                    res.body.products.should.be.an('array');
                    compareInternalOrders(expectedIO, res.body).should.be.equal(true);
                }
                done();
            });
    });
}

function compareInternalOrders(expectedIO, otherIO) {

    if (expectedIO.id != otherIO.id) return false;
    if (expectedIO.state != otherIO.state) return false;
    if (expectedIO.issueDate != otherIO.issueDate) return false;
    if (expectedIO.customerId != otherIO.customerID) return false;
    if (expectedIO.products.length != otherIO.products.length) return false;

    for (const product of expectedIO.products) {
        const found = otherIO.products.some((p) => {
            for (let expectedProduct in product) {
                for (let otherProduct in p) {
                    return expectedProduct == otherProduct;
                }
            }
            // console.log(p.price,product.price);
            // if(product.SKUId !=p.SKUId){console.log(2);console.log(product.SKUId ,p.SKUId);return false;}
            // if(product.price !=p,price) {console.log(3);return false;}
            // if(product.qty != p.qty) {console.log(4);return false;}
            // if(product.description !=p.description) {console.log(5);return false;}
            // console.log("chengle")
            // return true;
        });

        if (!found) {
            return false;
        }
    }
    return true;
}

function createNewInternalOrder(expectedHTTPStatus, IO) {
    it('Inserting a new InternalOrder', function (done) {
        if (IO !== undefined) {
            agent.post('/api/internalOrders')
                .set('content-type', 'application/json')
                .send(IO)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/internalOrders')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function createNewSKUItem(expectedHTTPStatus, SKUItem) {
    it('Inserting a new SKU Item', function (done) {
        if (SKUItem !== undefined) {
            agent.post('/api/skuitem')
                .set('content-type', 'application/json')
                .send(SKUItem)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/skuitem')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function updateInternalOrder(expectedHTTPStatus, id, IO) {
    it(`Updating InternalOrder [id: ${id}] IO`, function (done) {
        if (IO !== undefined) {
            agent.put(`/api/internalOrders/${id}`)
                .set('content-type', 'application/json')
                .send(IO)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/internalOrders/${id}`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function deleteSKUItem(expectedHTTPStatus, rfid) {
    it('Deleting a SKU Item', function (done) {
        agent.delete(`/api/skuitems/${rfid}`)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function deleteInternalOrder(expectedHTTPStatus, id) {
    it('Deleting a InternalOrder', function (done) {
        agent.delete(`/api/internalOrders/${id}`)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function deleteSKU(expectedHTTPStatus, id) {
    it('Deleting a SKU', function (done) {
        agent.delete(`/api/skus/${id}`)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
