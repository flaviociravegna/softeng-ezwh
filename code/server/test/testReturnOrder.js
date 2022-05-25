const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

let sku1 = { id: 1, description: "SKU 1", weight: 10, volume: 10, notes: "notes 1", position: "800234523411", availableQuantity: 1, price: 10.99, testDescriptors: [] }
let sku2 = { id: 2, description: "SKU 2", weight: 20, volume: 20, notes: "notes 2", position: "800234523412", availableQuantity: 1, price: 20.99, testDescriptors: [] }

let SKUItem1 = { "RFID": "12345678901234567890123456789011", "SKUId": 1, "DateOfStock": "2021/11/29 12:30" };
let SKUItem2 = { "RFID": "12345678901234567890123456789012", "SKUId": 2, "DateOfStock": "2021/11/29 12:30" };
let SKUItem3 = { "RFID": "12345678901234567890123456789013", "SKUId": 1, "DateOfStock": "2021/11/29 12:30" };
let SKUItem4 = { "RFID": "12345678901234567890123456789014", "SKUId": 2, "DateOfStock": "2021/11/29 12:30" };

const product1 = { "SKUId": sku1.id, "description": sku1.description, "price": sku1.price, "qty": 1 };
const product2 = { "SKUId": sku2.id, "description": sku2.description, "price": sku2.price, "qty": 1 };

let restockOrder1 = {
    "id": 1,
    "issueDate": "2021/11/29 09:33",
    "products": [product1, product2],
    "supplierId": 7
};

let restockOrder2 = {
    "id": 2,
    "issueDate": "2021/11/29 09:33",
    "products": [product1, product2],
    "supplierId": 7
};

const supplier1 = {
    "username": "supplier2@ezwh.com",
    "name": "Michael",
    "surname": "Jordan",
    "password": "testpassword",
    "type": "supplier"
};

const returnOrder1 = {
    "returnDate":"2021/11/29 09:33",
    "products": [{"SKUId":1,"description":"SKU 1", "price":10.99, "RFID":"12345678901234567890123456789011"},
                {"SKUId":1,"description":"SKU 2", "price":20.99, "RFID":"12345678901234567890123456789012"}],
    "restockOrderId" : 1
}

const returnOrder2 = {
    "returnDate":"2021/11/29 09:33",
    "products": [{"SKUId":1,"description":"SKU 1","price":10.99, "RFID":"12345678901234567890123456789013"}],
    "restockOrderId" : 2
}

 /************************************************************************ */
 describe('API Test: RETURN ORDER', function () {
    setup();

    describe('POST /api/returnOrder (success)', function () {
        createNewReturnOrder(201, returnOrder1);
        createNewReturnOrder(201, returnOrder2);
    });

    describe('POST /api/returnOrder (error test)', function () {
        // No restock order Id
        createNewReturnOrder(404, {
            "returnDate":"2021/11/29 09:33",
            "products": [{"SKUId":1,"description":"SKU 1","price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : 100
        });
        // Invalid Date
        createNewReturnOrder(422, {
            "returnDate":"",
            "products": [{"SKUId":1,"description":"SKU 1","price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : 2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/29 09:",
            "products": [{"SKUId":1,"description":"SKU 1","price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : 2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/29 09:99",
            "products": [{"SKUId":1,"description":"SKU 1","price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : 2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/79 09:10",
            "products": [{"SKUId":1,"description":"SKU 1","price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : 2
        });
        //Invalid products field
        createNewReturnOrder(422, {
            "returnDate":"2021/11/19 09:10",
            "products": { "SKUId":1, "description":"SKU 1", "price":10.99, "RFID":"12345678901234567890123456789013"},
            "restockOrderId" : 2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/19 09:10",
            "products": [{ "SKUId":"ab", "description":"SKU 1", "price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : 2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/19 09:10",
            "products": [{ "SKUId":-12, "description":"SKU 1", "price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : 2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/19 09:10",
            "products": [{ "SKUId":1, "description": 1, "price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : 2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/19 09:10",
            "products": [{ "SKUId":1,"description":"SKU 1", "price":"wrong", "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : 2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/19 09:10",
            "products": [{ "SKUId":1, "description":"SKU 1", "price":10.99, "RFID":"12345678901234567890123456789013555555555555"}],
            "restockOrderId" : 2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/19 09:10",
            "products": [{ "SKUId":1, "description":"SKU 1", "price":10.99, "RFID":""}],
            "restockOrderId" : 2
        });
        // Invalid Restock Id
        createNewReturnOrder(422, {
            "returnDate":"2021/11/19 09:10",
            "products": [{ "SKUId":1, "description":"SKU 1", "price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : -2
        });
        createNewReturnOrder(422, {
            "returnDate":"2021/11/19 09:10",
            "products": [{ "SKUId":1, "description":"SKU 1", "price":10.99, "RFID":"12345678901234567890123456789013"}],
            "restockOrderId" : "abc"
        });
        createNewReturnOrder(422);

    });

    describe('GET /api/returnOrders', function () {
        getReturnOrders(200, 2, [{...returnOrder1, "id":1}, {...returnOrder2, "id":2}]);
    });

    describe('GET /api/returnOrders/:id (success)', function () {
        getReturnOrderById(200, {...returnOrder1, "id":1}, 1);
    });

    describe('GET /api/returnOrders/:id (error test)', function () {
        getReturnOrderById(404, {...returnOrder1, "id":12}, 12);
        getReturnOrderById(422, {...returnOrder1, "id":1}, "abc");
        getReturnOrderById(422, {...returnOrder1, "id":1}, -12);
        getReturnOrderById(422, {...returnOrder1, "id":1});
    });

    describe('DELETE /api/returnOrder/:id (error test)', function () {
        deleteReturnOrder(422, 12);
        deleteReturnOrder(422, "abc");
        deleteReturnOrder(422, -12);
        deleteReturnOrder(422);
    });

    restore();
 });


 // Setup the data in order to do tests
function setup() {
    describe('Populating DB...', function () {
        createNewSupplier(201, supplier1); //id 7

        createNewSKU(201, sku1);
        createNewSKU(201, sku2);

        createNewSKUItem(201, SKUItem1);
        createNewSKUItem(201, SKUItem2);
        createNewSKUItem(201, SKUItem3);
        createNewSKUItem(201, SKUItem4);

        createTestDescriptor(201, { "name": "test 1", "procedureDescription": "Test description 1", "idSKU": 1 });

        createNewTestResult(201, {
            "rfid": SKUItem1.RFID,
            "idTestDescriptor": 1,
            "Date": "2021/11/28",
            "Result": false
        });

        createNewTestResult(201, {
            "rfid": SKUItem1.RFID,
            "idTestDescriptor": 1,
            "Date": "2021/11/28",
            "Result": false
        });

        createNewRestockOrder(201, restockOrder1);
        modifyRestockOrderState(200, restockOrder1.id, { "newState": "DELIVERED" });
        addRestockOrderSKUItemList(200, restockOrder1.id, { "skuItems": [{"SKUId": SKUItem1.SKUId, "rfid":SKUItem1.RFID }, {"SKUId": SKUItem2.SKUId, "rfid":SKUItem2.RFID }]});
        
        createNewRestockOrder(201, restockOrder2);
        modifyRestockOrderState(200, restockOrder2.id, { "newState": "DELIVERED" });
        addRestockOrderSKUItemList(200, restockOrder2.id, { "skuItems": [{"SKUId": SKUItem3.SKUId, "rfid":SKUItem3.RFID }, {"SKUId": SKUItem4.SKUId, "rfid":SKUItem4.RFID }]});

    });
}

function restore () {
    describe('Restoring db', function () {
        deleteRestockOrder(204, 1);
        deleteRestockOrder(204, 2);

        deleteTestResult(204, SKUItem1.RFID, 1);
        deleteTestResult(204, SKUItem1.RFID, 2);

        deleteTestDescriptor(204, 1);

        deleteSKUItem(204, SKUItem1.RFID);
        deleteSKUItem(204, SKUItem2.RFID);
        deleteSKUItem(204, SKUItem3.RFID);
        deleteSKUItem(204, SKUItem4.RFID);

        deleteSKU(204, sku1.id);
        deleteSKU(204, sku2.id);

        deleteSupplier(204, supplier1.username, supplier1.type);

        deleteReturnOrder(204, 1);
        deleteReturnOrder(204, 2);
    });
}

/****************** FUNCTIONS FOR DB POPULATION ****************/
function createNewSupplier(expectedHTTPStatus, supplier) {
    it('Inserting a new supplier', function (done) {
        if (supplier != undefined) {
            agent.post('/api/newUser')
                .set('content-type', 'application/json')
                .send(supplier)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/newUser')
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
        if (SKUItem != undefined) {
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

function createTestDescriptor(expectedHTTPStatus, testDescriptor) {
    it('Inserting a new test descriptor', function (done) {
        if (testDescriptor !== undefined) {
            agent.post('/api/testDescriptor')
                .set('content-type', 'application/json')
                .send(testDescriptor)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/testDescriptor')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function createNewTestResult(expectedHTTPStatus, testResult) {
    it('Inserting a new test result', function (done) {
        if (testResult !== undefined) {
            agent.post('/api/skuitems/testResult')
                .set('content-type', 'application/json')
                .send(testResult)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/skuitems/testResult')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function createNewSKU(expectedHTTPStatus, SKU) {
    it('Inserting a new SKU', function (done) {
        if (SKU != undefined) {
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

function createNewRestockOrder(expectedHTTPStatus, restockOrder) {
    it('Inserting a new Restock Order', function (done) {
        if (restockOrder != undefined) {
            agent.post('/api/restockOrder')
                .set('content-type', 'application/json')
                .send(restockOrder)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/restockOrder')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function modifyRestockOrderState(expectedHTTPStatus, id, newState) {
    it(`Updating Restock Order state [id = ${id}]`, function (done) {
        if (newState !== undefined) {
            agent.put('/api/restockOrder/' + id)
                .set('content-type', 'application/json')
                .send(newState)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put('/api/restockOrder/' + id)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function addRestockOrderSKUItemList(expectedHTTPStatus, id, skuItems) {
    it(`Adding Restock order [id: ${id}] SKU Item list`, function (done) {
        if (skuItems !== undefined) {
            agent.put(`/api/restockOrder/${id}/skuItems`)
                .set('content-type', 'application/json')
                .send(skuItems)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/restockOrder/${id}/skuItems`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

/******************** FUNCTIONS FOT RESTORE DB  ********************/

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

function deleteSupplier(expectedHTTPStatus, username, type) {
    it('Deleting a supplier', function (done) {
        agent.delete(`/api/users/${username}/${type}`)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function deleteRestockOrder(expectedHTTPStatus, id) {
    it(`Deleting Restock Order [id = ${id}]`, function (done) {
        agent.delete('/api/restockOrder/' + id)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function deleteTestDescriptor(expectedHTTPStatus, testDescriptorID) {
    it('Deleting a test descriptor', function (done) {
        agent.delete(`/api/testDescriptor/${testDescriptorID}`)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function deleteTestResult(expectedHTTPStatus, rfid, testResultID) {
    it('Deleting a test result', function (done) {
        agent.delete(`/api/skuitems/${rfid}/testResult/${testResultID}`)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}


/********************** RETURN ORDER APIS ****************************/

function createNewReturnOrder(expectedHTTPStatus, returnOrder) {
    it('Inserting a new Return Order', function (done) {
        if (returnOrder != undefined) {
            agent.post('/api/returnOrder')
                .set('content-type', 'application/json')
                .send(returnOrder)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/returnOrder')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function deleteReturnOrder(expectedHTTPStatus, id) {
    it(`Deleting Return Order [id = ${id}]`, function (done) {
        agent.delete('/api/returnOrder/' + id)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function getReturnOrders(expectedHTTPStatus, expectedLength, expectedReturnOrder) {
    it('Get All Return order ', function (done) {
        if (expectedReturnOrder !== undefined) {
            agent.get('/api/returnOrders')
                .end(function (err, res) {
                    if (err)
                        done(err);
                    res.should.have.status(expectedHTTPStatus);
                    if (expectedHTTPStatus === 200) {
                        res.should.be.json;
                        res.body.should.be.an('array');
                        res.body.should.have.lengthOf(expectedLength);

                        for (const RO of res.body) {
                            RO.should.haveOwnProperty("id");
                            RO.should.haveOwnProperty("returnDate");
                            RO.should.haveOwnProperty("restockOrderId");
                            RO.should.haveOwnProperty("products");
                            RO.products.should.be.an('array');

                            expectedReturnOrder.some((exp) => { 
                                return compareReturnOrder(exp, RO);
                            }).should.be.equal(true);
                        }
                    }
                    done();
                });
        } else {
            agent.get('/api/returnOrders')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function getReturnOrderById(expectedHTTPStatus, expectedReturnOrder, id) {
    it('Get All Return order ', function (done) {
        if (expectedReturnOrder !== undefined) {
            agent.get('/api/returnOrders/' + id)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    res.should.have.status(expectedHTTPStatus);
                    if (expectedHTTPStatus === 200) {
                        res.should.be.json;                     
                        res.body.should.haveOwnProperty("id");
                        res.body.should.haveOwnProperty("returnDate");
                        res.body.should.haveOwnProperty("restockOrderId");
                        res.body.should.haveOwnProperty("products");
                        res.body.products.should.be.an('array');
                        
                        compareReturnOrder(expectedReturnOrder, res.body).should.be.equal(true);
                        
                    }
                    done();
                });
        } else {
            agent.get('/api/returnOrders/'+id)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function compareReturnOrder(expectedReturnOrder, returnOrder) {
    if(expectedReturnOrder.id != returnOrder.id) return false;
    if(expectedReturnOrder.returnDate != returnOrder.returnDate) return false;
    if(expectedReturnOrder.restockOrderId != returnOrder.restockOrderId) return false;
    if(expectedReturnOrder.products.length != returnOrder.products.length) return false;
    for (const expectedProduct of expectedReturnOrder.products) {
        const found = returnOrder.products.some((prod) => {
            return expectedProduct.SKUId == prod.SKUId && expectedProduct.description == prod.description && expectedProduct.price == prod.price && expectedProduct.RFID == prod.RFID;
        });
        if (!found) return false;
    }
    
    return true;
}