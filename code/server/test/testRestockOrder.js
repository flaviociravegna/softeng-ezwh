const chai = require('chai');
const chaiHttp = require('chai-http');
const { createNewItem } = require('../modules/Item');
const { getRestockOrderSkuItems } = require('../modules/RestockOrder');
const { createNewTestResult, deleteTestResult } = require('../modules/testResult_db');
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
let SKUItem5 = { "RFID": "12345678901234567890123456789015", "SKUId": 1, "DateOfStock": "2021/11/29 12:30" };
let SKUItem6 = { "RFID": "12345678901234567890123456789016", "SKUId": 2, "DateOfStock": "2021/11/29 12:30" };
let SKUItem7 = { "RFID": "12345678901234567890123456789017", "SKUId": 1, "DateOfStock": "2021/11/29 12:30" };
let SKUItem8 = { "RFID": "12345678901234567890123456789018", "SKUId": 2, "DateOfStock": "2021/11/29 12:30" };

const product1 = { "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 1 };
const product2 = { "SKUId": 2, "description": "first sku", "price": 20.99, "qty": 1 };

const N_RESTOCK_ORDERS = 4;
const STATES = ["ISSUED", "DELIVERY", "DELIVERED", "TESTED", "COMPLETEDRETURN", "COMPLETED"];

let restockOrder1_issued = {
    "id": 1,
    "issueDate": "2021/11/29 09:33",
    "products": [product1, product2],
    "supplierId": 1
};

let restockOrder2_issued = {
    "id": 2,
    "issueDate": "2021/11/29 09:33",
    "products": [product1, product2],
    "supplierId": 1
};

let restockOrder3_delivery = {
    "id": 3,
    "issueDate": "2021/11/29 09:33",
    "products": [product1, product2],
    "supplierId": 1
};

let restockOrder4_delivered = {
    "id": 4,
    "issueDate": "2021/11/29 09:33",
    "products": [product1, product2],
    "supplierId": 1
};

const supplier1 = {
    "username": "user1@ezwh.com",
    "name": "Michael",
    "surname": "Jordan",
    "password": "testpassword",
    "type": "supplier"
};

const supplier2 = {
    "username": "user2@ezwh.com",
    "name": "Pippo",
    "surname": "Pluto",
    "password": "testpassword",
    "type": "supplier"
};

let item1 = {
    "id": 1,
    "description": "item 1",
    "price": 10.99,
    "SKUId": 1,
    "supplierId": 1
};

let item2 = {
    "id": 2,
    "description": "item2",
    "price": 20.99,
    "SKUId": 2,
    "supplierId": 2
};

/*****************************************************************/

describe('API Test: RESTOCK ORDER', function () {
    setup();

    const tempSI1 = { "SKUId": SKUItem1.SKUId, "rfid": SKUItem1.RFID };
    const tempSI2 = { "SKUId": SKUItem2.SKUId, "rfid": SKUItem2.RFID };

    describe('POST /api/restockOrder (success)', function () {
        createNewRestockOrder(201, restockOrder1_issued);
        createNewRestockOrder(201, restockOrder2_issued);
        createNewRestockOrder(201, restockOrder3_delivery);
        createNewRestockOrder(201, restockOrder4_delivered);
    });

    describe('GET /api/restockOrders', function () {
        getRestockOrders(200, N_RESTOCK_ORDERS, [{ ...restockOrder1_issued, "state": "ISSUED", "skuItems": [], "id": 1 }, { ...restockOrder2_issued, "state": "ISSUED", "skuItems": [], "id": 2 },
        { ...restockOrder3_delivery, "state": "DELIVERY", "skuItems": [], "id": 3 }, { ...restockOrder4_delivered, "state": "DELIVERED", "skuItems": [], "id": 4 }]);
    });

    describe('GET /api/restockOrdersIssued', function () {
        getRestockOrdersIssued(200, 2, [{ ...restockOrder1_issued, "state": "ISSUED", "skuItems": [], "id": 1 }, { ...restockOrder2_issued, "state": "ISSUED", "skuItems": [], "id": 2 }]);
    });

    describe('GET /api/restockOrders/:id (success)', function () {
        getRestockOrder(200, 1, { ...restockOrder1_issued, "state": "ISSUED", "skuItems": [], "id": 1 });
        getRestockOrder(200, 2, { ...restockOrder2_issued, "state": "ISSUED", "skuItems": [], "id": 2 });
        getRestockOrder(200, 3, { ...restockOrder3_delivery, "state": "DELIVERY", "skuItems": [], "id": 3 });
        getRestockOrder(200, 4, { ...restockOrder4_delivered, "state": "DELIVERED", "skuItems": [], "id": 4 });
    });

    describe('GET /api/skus/:id (errors)', function () {
        getRestockOrder(404, 99);
        getRestockOrder(422);
        getRestockOrder(422, -1);
    });

    describe('POST /api/restockOrder (errors)', function () {
        createNewRestockOrder(422);
        createNewRestockOrder(422, {
            "issueDate": "2021/11/41 09:33", // Wrong date format
            "products": [product1, product2],
            "supplierId": 1
        });
        createNewRestockOrder(422, {
            "issueDate": "2021/11/11 39:33", // Wrong date format
            "products": [product1, product2],
            "supplierId": 1
        });
        createNewRestockOrder(422, {
            "issueDate": "2021/11/11 09:33",
            "products": [{ "SKUId": -1, "description": "first sku", "price": 10.99, "qty": 1 }], // Wrong product format
            "supplierId": 1
        });
        createNewRestockOrder(422, {
            "issueDate": "2021/11/11 09:33",
            "products": [{ "SKUId": 1, "description": "", "price": 10.99, "qty": 1 }], // Wrong product format
            "supplierId": 1
        });
        createNewRestockOrder(422, {
            "issueDate": "2021/11/11 09:33",
            "products": [{ "SKUId": 1, "price": 10.99, "qty": 1 }], // Wrong product format
            "supplierId": 1
        });
        createNewRestockOrder(422, {
            "issueDate": "2021/11/11 09:33",
            "products": [{ "SKUId": 1, "description": "desc", "price": "aaaaaaa", "qty": 1 }], // Wrong product format
            "supplierId": 1
        });
        createNewRestockOrder(422, {
            "issueDate": "2021/11/11 09:33",
            "products": [{ "SKUId": 1, "description": "desc", "price": 10.99, "qty": "aaaaa" }], // Wrong product format
            "supplierId": 1
        });
        createNewRestockOrder(422, {
            "issueDate": "2021/11/11 09:33", "products": [product1, product2],
            "supplierId": -1 // Wrong supplierId format
        });
    });

    // Modify the state
    describe('PUT /api/restockOrder/:id (success)', function () {
        modifyRestockOrderState(200, 2, { "newState": "DELIVERED" });
        getRestockOrdersIssued(200, 1, [{ ...restockOrder1_issued, "state": "ISSUED", "skuItems": [], "id": 1 }]);
        getRestockOrder(200, 2, { ...restockOrder2_issued, "state": "DELIVERED", "skuItems": [], "id": 2 });
    });

    describe('PUT /api/restockOrder/:id (errors)', function () {
        modifyRestockOrderState(422);
        modifyRestockOrderState(404, 99);
        modifyRestockOrderState(404, 10, { "newState": "DELIVERED" });
        modifyRestockOrderState(422, -1, { "newState": "DELIVERED" });
        modifyRestockOrderState(422, "abc", { "newState": "DELIVERED" });
        modifyRestockOrderState(422, 1, { "newState": "notValidState" });
        modifyRestockOrderState(422, 1, { "newState": 1 });
        modifyRestockOrderState(422, 1, {});
        modifyRestockOrderState(422, 1);
        modifyRestockOrderState(422, 1, { "wrongFieldName": states[1] });
    });

    describe('PUT /api/restockOrder/:id/skuItems (success)', function () {
        addRestockOrderSKUItemList(200, 2, [tempSI1, tempSI2]);
        getRestockOrder(200, 2, { ...restockOrder2_issued, "state": "DELIVERED", "skuItems": [tempSI1, tempSI2], "id": 2 });
    });

    describe('GET /api/restockOrders/:id/returnItems (success)', function () {
        getRestockOrderSKUItemsToReturn(422, 2, [tempSI1, tempSI2]);
    });

    describe('GET /api/restockOrders/:id/returnItems (errors)', function () {
        getRestockOrderSKUItemsToReturn(422);
        getRestockOrderSKUItemsToReturn(422, -1, []);
        getRestockOrderSKUItemsToReturn(422, "not an int", []);

        // State != COMPLETEDRETURN
        getRestockOrderSKUItemsToReturn(422, 1, [tempSI1, tempSI2]);
        getRestockOrderSKUItemsToReturn(422, 3, [tempSI1, tempSI2]);
        getRestockOrderSKUItemsToReturn(422, 4, [tempSI1, tempSI2]);

        getRestockOrderSKUItemsToReturn(404, 99, [tempSI1, tempSI2]);
        getRestockOrderSKUItemsToReturn(404, 10, [tempSI1, tempSI2]);
    });

    describe('PUT /api/restockOrder/:id/transportNote (success)', function () {
        addTransportNote(200, 3, { "transportNote": { "deliveryDate": "2021/12/29" } })
        getRestockOrder(200, 2, { ...restockOrder3_delivery, "state": "DELIVERY", "skuItems": [], "id": 3 });
    });

    describe('PUT /api/restockOrder/:id/transportNote (errors)', function () {
        addTransportNote(422);
        addTransportNote(422, -1, { "transportNote": { "deliveryDate": "2021/12/29" } });
        addTransportNote(422, "not an int", { "transportNote": { "deliveryDate": "2021/12/29" } });
        addTransportNote(422, 3, {});
        addTransportNote(422, 3, { "wrongTransportNote": { "deliveryDate": "2021/12/29" } });
        addTransportNote(422, 3, { "transportNote": { "wrongDeliveryDate": "2021/12/29" } });
        addTransportNote(422, 3, { "transportNote": { "deliveryDate": "" } });

        addTransportNote(404, 99, { "transportNote": { "deliveryDate": "" } });
    });

    describe('DELETE /api/restockOrder/:id (success)', function () {
        deleteRestockOrder(204, restockOrder1_issued.id);
        deleteRestockOrder(204, restockOrder2_issued.id);
        deleteRestockOrder(204, restockOrder3_delivery.id);
        deleteRestockOrder(204, restockOrder4_delivered.id);
    });

    describe('DELETE /api/restockOrder/:id (errors)', function () {
        deleteRestockOrder(422);
        deleteRestockOrder(422, 99);
        deleteRestockOrder(422, -1);
        deleteRestockOrder(204, "id must be an int");
    });

    clear();
});

/*****************************************************************/

// Setup the data in order to do tests
function setup() {
    describe('Creating users...', function () {
        createNewSupplier(201, supplier1);
        createNewSupplier(201, supplier2);
    });

    describe('Creating SKUs...', function () {
        createNewSKU(201, sku1);
        createNewSKU(201, sku2);
    });

    describe('Creating SKU Items and test results...', function () {
        createNewSKUItem(201, SKUItem1);
        createNewSKUItem(201, SKUItem2);
        createNewSKUItem(201, SKUItem3);
        createNewSKUItem(201, SKUItem4);
        createNewSKUItem(201, SKUItem5);
        createNewSKUItem(201, SKUItem6);
        createNewSKUItem(201, SKUItem7);
        createNewSKUItem(201, SKUItem8);

        createTestDescriptor(201, { "name": "", "procedureDescription": "Test description 1", "idSKU": 1 });

        createNewTestResult(201, {
            "rfid": SKUItem2.RFID,
            "idTestDescriptor": 1,
            "Date": "2021/11/28",
            "Result": false
        });

        createNewTestResult(201, {
            "rfid": SKUItem2.RFID,
            "idTestDescriptor": 1,
            "Date": "2021/11/28",
            "Result": false
        });

        delete SKUItem1.DateOfStock;
        delete SKUItem2.DateOfStock;
        delete SKUItem3.DateOfStock;
        delete SKUItem4.DateOfStock;
        delete SKUItem5.DateOfStock;
        delete SKUItem6.DateOfStock;
        delete SKUItem7.DateOfStock;
        delete SKUItem8.DateOfStock;
    });

    describe('Creating Items...', function () {
        createNewItem(201, item1);
        createNewItem(201, item2);
    });
}

function clear() {
    describe('Deleting Items...', function () {
        deleteItem(204, item1.id);
        deleteItem(204, item2.id);
    });

    describe('Deleting SKU Items and test results...', function () {
        deleteTestDescriptor(204, 1);

        deleteTestResult(204, SKUItem2.RFID, 1);
        deleteTestResult(204, SKUItem2.RFID, 2);

        deleteSKUItem(204, SKUItem1.RFID);
        deleteSKUItem(204, SKUItem2.RFID);
        deleteSKUItem(204, SKUItem3.RFID);
        deleteSKUItem(204, SKUItem4.RFID);
        deleteSKUItem(204, SKUItem5.RFID);
        deleteSKUItem(204, SKUItem6.RFID);
        deleteSKUItem(204, SKUItem7.RFID);
        deleteSKUItem(204, SKUItem8.RFID);
    });

    describe('Deleting SKUs...', function () {
        deleteSKU(204, sku1.id)
        deleteSKU(204, sku2.id);
    });

    describe('Deleting users...', function () {
        deleteSupplier(201, supplier1.username, supplier1.type);
        deleteSupplier(201, supplier2.username, supplier2.type);
    });
}

/*****************************************************************/

function getRestockOrders(expectedHTTPStatus, expectedLength, expectedROs) {
    it('Get all Restock Orders', function (done) {
        agent.get('/api/restockOrders')
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
                        RO.should.haveOwnProperty("issueDate");
                        RO.should.haveOwnProperty("state");
                        RO.should.haveOwnProperty("products");
                        RO.products.should.be.an('array');
                        RO.should.haveOwnProperty("supplierId");
                        RO.should.haveOwnProperty("skuItems");
                        RO.skuItems.should.be.an('array');
                        RO.should.eventually.haveOwnProperty("transportNote");

                        expectedROs.some((xpctd) => { return compareSKUs(xpctd, RO, 1); }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function getRestockOrdersIssued(expectedHTTPStatus, expectedLength, expectedROs) {
    it('Get all Restock Orders', function (done) {
        agent.get('/api/restockOrders')
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
                        RO.should.haveOwnProperty("issueDate");
                        RO.should.haveOwnProperty("state");
                        RO.should.haveOwnProperty("products");
                        RO.products.should.be.an('array');
                        RO.should.haveOwnProperty("supplierId");
                        RO.should.haveOwnProperty("skuItems");
                        RO.skuItems.should.be.an('array');
                        RO.skuItems.should.have.lengthOf(0);

                        expectedROs.some((xpctd) => { return compareSKUs(xpctd, RO, 1); }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function getRestockOrder(expectedHTTPStatus, id, expectedRO) {
    it('Get Restock order with ID = ' + id, function (done) {
        if (expectedRestockOrder !== undefined) {
            agent.get('/api/restockOrders/' + id)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    if (expectedHTTPStatus === 200) {
                        res.should.be.json;
                        res.body.should.haveOwnProperty("id");
                        res.body.should.haveOwnProperty("issueDate");
                        res.body.should.haveOwnProperty("state");
                        res.body.should.haveOwnProperty("products");
                        res.body.products.should.be.an('array');
                        res.body.should.haveOwnProperty("supplierId");
                        res.body.should.haveOwnProperty("skuItems");
                        res.body.skuItems.should.be.an('array');
                        res.body.should.eventually.haveOwnProperty("transportNote");

                        compareRestockOrder(expectedRO, res.body, 0).should.be.equal(true);
                    }
                    done();
                });
        } else {
            agent.get('/api/restockOrders/' + id)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function getRestockOrderSKUItemsToReturn(expectedHTTPStatus, id, expectedLength, expectedSkuItems) {
    it(`Get Restock Order [${id}] SKU Items to be returned`, function (done) {
        agent.get(`/api/restockOrders/${id}/returnItems`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const SI of res.body) {
                        SI.should.haveOwnProperty("SKUid");
                        SI.shoudl.haveOwnProperty("rfid");
                        expectedSkuItems.some((item) => { compareRestockOrder(item, SI) }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function compareRestockOrder(expectedRO, otherRO, checkID) {
    if (checkID && expectedRO.id != otherRO.id) return false;
    if (expectedRO.issueDate != otherRO.issueDate) return false;
    if (expectedRO.state != otherRO.state) return false;
    if (expectedRO.supplierId != otherRO.supplierId) return false;
    if (expectedRO.transportNote != undefined && expectedRO.transportNote.deliveryDate != otherRO.transportNote.deliveryDate)
        return false

    if (expectedRO.products.length != otherRO.products.length) return false;
    for (const expectedProduct of expectedRO.products) {
        const found = otherRO.products.some((prod) => {
            return expectedProduct.SKUId == prod.SKUId && expectedProduct.description == prod.description &&
                expectedProduct.price == prod.price && expectedProduct.qty == prod.qty;
        });

        if (!found)
            return false;
    }

    if (expectedRO.skuItems.length != otherRO.skuItems.length) return false;
    for (const expectedSkuItem of expectedRO.skuItems) {
        const found = otherSKU.testDescriptors.some((SI) => {
            return expectedSkuItem.SKUId == SI.SKUId && expectedSkuItem.rfid == SI.rfid;
        });

        if (!found)
            return false;
    }

    return true;
}

/*******************************************************/

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

function addTransportNote(expectedHTTPStatus, id, transportNote) {
    it(`Adding Restock Order [id: ${id}] transport note`, function (done) {
        if (transportNote != undefined) {
            agent.post(`/api/restockOrder/${id}/transportNote`)
                .set('content-type', 'application/json')
                .send(transportNote)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post(`/api/restockOrder/${id}/transportNote`)
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
            agent.post(`/api/restockOrder/${id}/skuItems`)
                .set('content-type', 'application/json')
                .send(skuItems)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post(`/api/restockOrder/${id}/skuItems`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

/*******************************************************/

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

function createNewItem(expectedHTTPStatus, item) {
    it('Inserting a new Item', function (done) {
        if (item != undefined) {
            agent.post('/api/item')
                .set('content-type', 'application/json')
                .send(item)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/item')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

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

/*******************************************************/

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

function deleteItem(expectedHTTPStatus, id) {
    it('Deleting an Item', function (done) {
        agent.delete(`/api/items/${id}`)
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