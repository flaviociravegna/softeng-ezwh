const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const db_cleaning = require('./utils-dbCleaning');
var agent = chai.request.agent(app);

const N_SKU_ITEMS = 4;
let skuItem1 = { RFID: "12345678901234567890123456789011", SKUId: 1, Available: 0, DateOfStock: "2021/11/29" }
let skuItem2 = { RFID: "12345678901234567890123456789012", SKUId: 1, Available: 0, DateOfStock: "2021/11/29 12:30" }
let skuItem3 = { RFID: "12345678901234567890123456789013", SKUId: 1, Available: 0, DateOfStock: "2021/11/29 13:30" }
let skuItem4 = { RFID: "12345678901234567890123456789014", SKUId: 1, Available: 0, DateOfStock: "2021/11/29 14:30" }
let skuItem1_available = { RFID: "12345678901234567890123456789011", SKUId: 1, Available: 0, DateOfStock: "2021/11/29" }
let skuItem2_available = { RFID: "12345678901234567890123456789012", SKUId: 1, Available: 0, DateOfStock: "2021/11/29 12:30" }
let skuItem3_available = { RFID: "12345678901234567890123456789013", SKUId: 1, Available: 0, DateOfStock: "2021/11/29 13:30" }
let skuItem4_available = { RFID: "12345678901234567890123456789014", SKUId: 1, Available: 0, DateOfStock: "2021/11/29 14:30" }

/*****************************************************************/

describe('API Test: SKU Items', function () {
    setup();

    // POST
    describe('POST /api/skuitem (errors)', function () {
        // Empty body
        createNewSKUItem(422)

        // Wrong RFID (30 numbers instead of 32), number and missing
        createNewSKUItem(422, { RFID: "123456789012345678901234567890", SKUId: 1, DateOfStock: "2021/11/29" });
        createNewSKUItem(422, { RFID: "1234567890123456789012345678901111111", SKUId: 1, DateOfStock: "2021/11/29" });
        createNewSKUItem(422, { RFID: 12345678901234567890123456789011, SKUId: 1, DateOfStock: "2021/11/29" });
        createNewSKUItem(422, { SKUId: 1, DateOfStock: "2021/11/29" });

        // SKUId string
        createNewSKUItem(422, { RFID: "12345678901234567890123456789011", SKUId: "not an int", DateOfStock: "2021/11/29" });
        createNewSKUItem(422, { RFID: "12345678901234567890123456789011", SKUId: "1", DateOfStock: "2021/11/29" });

        // rfid instead of RFID
        createNewSKUItem(422, { rfid: "12345678901234567890123456789011", SKUId: 1, DateOfStock: "2021/11/29" });

        // Missing field SKUId
        createNewSKUItem(422, { RFID: "12345678901234567890123456789011", DateOfStock: "2021/11/29" });

        // Wrong date formats
        createNewSKUItem(422, { RFID: "12345678901234567890123456789011", SKUId: 1, DateOfStock: "2021/11/39" });
        createNewSKUItem(422, { RFID: "12345678901234567890123456789011", SKUId: 1, DateOfStock: "2021/11/29 12:" });
        createNewSKUItem(422, { RFID: "12345678901234567890123456789011", SKUId: 1, DateOfStock: "2021/11/29 25:30" });
        createNewSKUItem(422, { RFID: "12345678901234567890123456789011", SKUId: 1, DateOfStock: "2021/11/29 12:60" });

        // no SKU associated to SKUId
        createNewSKUItem(404, { RFID: "12345678901234567890123456789011", SKUId: 99, DateOfStock: "2021/11/29" });
        createNewSKUItem(422, { RFID: "12345678901234567890123456789011", SKUId: -1, DateOfStock: "2021/11/29" });
    });

    // GET /api/skus
    describe('GET /api/skus', function () {
        getAllSKUItems(200, N_SKU_ITEMS, [skuItem1, skuItem2, skuItem3, skuItem4]);
    });

    // GET /api/skuitems/sku/:id (with Available = 1)
    describe('GET /api/skuitems/sku/:id (success)', function () {
        getSKUItemsBySkuID(200, 1, 0);
    });

    describe('GET /api/skuitems/sku/:id (errors)', function () {

        // no SKU associated to id
        getSKUItemsBySkuID(404, 10, N_SKU_ITEMS, [skuItem1, skuItem2, skuItem3, skuItem4]);

        // wrong id
        getSKUItemsBySkuID(422, -1, N_SKU_ITEMS, [skuItem1, skuItem2, skuItem3, skuItem4]);
        getSKUItemsBySkuID(422, undefined, N_SKU_ITEMS, [skuItem1, skuItem2, skuItem3, skuItem4]);
        getSKUItemsBySkuID(422, "aaaaa", N_SKU_ITEMS, [skuItem1, skuItem2, skuItem3, skuItem4]);

        getSKUItemsBySkuID(422);
    });

    // GET /api/skus/:id
    describe('GET /api/skuitems/:id (success)', function () {
        getSKUItemByRFID(200, "12345678901234567890123456789011", skuItem1);
        getSKUItemByRFID(200, "12345678901234567890123456789012", skuItem2);
        getSKUItemByRFID(200, "12345678901234567890123456789013", skuItem3);
        getSKUItemByRFID(200, "12345678901234567890123456789014", skuItem4);
    });

    describe('GET /api/skus/:id (errors)', function () {
        getSKUItemByRFID(422, "12345678901234567890123456789014543213", skuItem4);
        getSKUItemByRFID(422, "1234567890123456789012345678901", skuItem1);
        getSKUItemByRFID(422, 12345678901234567890123456789011, skuItem2);
        getSKUItemByRFID(422);
        getSKUItemByRFID(404, "12345678901234567890123456789099", skuItem1);
    });

    // PUT /api/skuitems/:rfid
    describe('PUT /api/skuitems/:rfid (success)', function () {
        updateSKUItem(200, "12345678901234567890123456789011", { newRFID: "12345678901234567890123456789011", newAvailable: 1, newDateOfStock: "2021/11/29" });
        updateSKUItem(200, "12345678901234567890123456789012", { newRFID: "12345678901234567890123456789012", newAvailable: 1, newDateOfStock: "2021/11/29 12:30" });
        updateSKUItem(200, "12345678901234567890123456789013", { newRFID: "12345678901234567890123456789013", newAvailable: 1, newDateOfStock: "2021/11/29 13:30" });
        updateSKUItem(200, "12345678901234567890123456789014", { newRFID: "12345678901234567890123456789014", newAvailable: 1, newDateOfStock: "2021/11/29 14:30" });
        getSKUItemsBySkuID(200, 1, N_SKU_ITEMS, [skuItem1_available, skuItem2_available, skuItem3_available, skuItem4_available]);

        // Null date must be accepted. Change of RFID
        updateSKUItem(200, "12345678901234567890123456789011", { newRFID: "12345678901234567890123456789015", newAvailable: 1, newDateOfStock: null });
        getSKUItemByRFID(200, "12345678901234567890123456789015", { RFID: "12345678901234567890123456789015", SKUId: 1, Available: 1, DateOfStock: null });
    });

    describe('PUT /api/skuitems/:rfid (errors)', function () {
        // wrong RFID and newRFID formats
        updateSKUItem(422, "1234567890123456789012345678901", { newRFID: "12345678901234567890123456789015", newAvailable: 1, newDateOfStock: "2021/11/29" });
        updateSKUItem(422, "123456789012345678901234567890113", { newRFID: "12345678901234567890123456789015", newAvailable: 1, newDateOfStock: "2021/11/29" });
        updateSKUItem(422, "12345678901234567890123456789011", { newRFID: "123456789012345678901234567890155", newAvailable: 1, newDateOfStock: "2021/11/29" });
        updateSKUItem(422, "1234567890123456789012345678901", { newRFID: "12345678901234567890123456789015", newAvailable: 1, newDateOfStock: "2021/11/29" });
        updateSKUItem(422, "12345678901234567890123456789011", { newRFID: 12345678901234567890123456789015, newAvailable: 1, newDateOfStock: "2021/11/29" });
        updateSKUItem(422, "12345678901234567890123456789011", { newRFID: "12345678901234567890123456789015", newAvailable: "1", newDateOfStock: "2021/11/29" });
        updateSKUItem(422, "12345678901234567890123456789011", { newRFID: "12345678901234567890123456789015", newAvailable: "not an int", newDateOfStock: "2021/11/29" });
        updateSKUItem(422, "12345678901234567890123456789011", { newRFID: "123456789012345678901234567890155", newAvailable: 1, newDateOfStock: "2021/11/49" });

        // wrong date formats
        updateSKUItem(422, "12345678901234567890123456789011", { newRFID: "12345678901234567890123456789015", newAvailable: 1, newDateOfStock: "2021/11/39" });
        updateSKUItem(422, "12345678901234567890123456789011", { newRFID: "12345678901234567890123456789015", newAvailable: 1, newDateOfStock: "2021/11/29 12:" });
        updateSKUItem(422, "12345678901234567890123456789011", { newRFID: "12345678901234567890123456789015", newAvailable: 1, newDateOfStock: "2021/11/29 12:60" });

        // newAvailable != [0, 1]
        updateSKUItem(422, "12345678901234567890123456789011", { newRFID: "12345678901234567890123456789015", newAvailable: 5, newDateOfStock: "2021/11/29 12:" });

        // newRFID already used
        updateSKUItem(422, "12345678901234567890123456789015", { newRFID: "12345678901234567890123456789012", newAvailable: 1, newDateOfStock: null });

        // SKU Item not found
        updateSKUItem(404, "12345678901234567890123456789099", { newRFID: "12345678901234567890123456789015", newAvailable: 1, newDateOfStock: "2021/11/29" });
    });

    // DELETE /api/skus/:id (errors)
    describe('DELETE /api/sku (errors)', function () {
        deleteSKUItem(422);
        deleteSKUItem(422, "1234567890123456789012345");
        deleteSKUItem(422, "12345678901234567890123458901234589012345");
        deleteSKUItem(422, "12345678901234567890123456789099");
        deleteSKUItem(422, 12345678901234567890123456789011);
    });

    clear();
});

/*****************************************************************/

// Setup the data in order to do tests
function setup() {

    //db cleanig
    db_cleaning.deleteAllSkuItems(agent);
    db_cleaning.deleteAllSKU(agent);
    db_cleaning.deleteAllPositions(agent);

    // Create position
    describe('POST /api/position', function () {
        createPosition(201, { "positionID": "800234523411", "aisleID": "8002", "row": "3452", "col": "3411", "maxWeight": 10000, "maxVolume": 10000 })
    });

    // Create sku
    describe('POST /api/sku', function () {
        createNewSKU(201, { "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "price": 10.99, "availableQuantity": 0 });
    });

    // Associate position to sku
    describe('PUT /api/sku/:id/position (success)', function () {
        updatePositionSKU(200, 1, { position: "800234523411" });
    });

    describe('POST /api/skuitem (success)', function () {
        createNewSKUItem(201, { RFID: "12345678901234567890123456789011", SKUId: 1, DateOfStock: "2021/11/29" });
        createNewSKUItem(201, { RFID: "12345678901234567890123456789012", SKUId: 1, DateOfStock: "2021/11/29 12:30" });
        createNewSKUItem(201, { RFID: "12345678901234567890123456789013", SKUId: 1, DateOfStock: "2021/11/29 13:30" });
        createNewSKUItem(201, { RFID: "12345678901234567890123456789014", SKUId: 1, DateOfStock: "2021/11/29 14:30" });
    });
}

function clear() {
    // DELETE /api/skuitems/:rfid
    describe('DELETE /api/skuitems/:rfid (success)', function () {
        deleteSKUItem(204, "12345678901234567890123456789015");    // Old "12345678901234567890123456789014"
        deleteSKUItem(204, "12345678901234567890123456789012");
        deleteSKUItem(204, "12345678901234567890123456789013");
        deleteSKUItem(204, "12345678901234567890123456789014");
    });

    // DELETE /api/skus/:id (SUCCESS)
    describe('DELETE /api/sku', function () {
        deleteSKU(204, 1);
    });

    describe('DELETE /api/position', function () {
        deletePosition(204, "800234523411");
    });
}

/*****************************************************************/

function getAllSKUItems(expectedHTTPStatus, expectedLength, expectedSKUitems) {
    it('Get all SKU Items', function (done) {
        agent.get('/api/skuitems')
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const skuitem of res.body) {
                        skuitem.should.haveOwnProperty("RFID");
                        skuitem.should.haveOwnProperty("SKUId");
                        skuitem.should.haveOwnProperty("Available");
                        skuitem.should.haveOwnProperty("DateOfStock");

                        expectedSKUitems.some((xpctd) => { return compareSKUItems(xpctd, skuitem, 1); }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function getSKUItemByRFID(expectedHTTPStatus, RFID, expectedSKUItem) {
    it('Get SKU Item by RFID', function (done) {
        agent.get('/api/skuitems/' + RFID)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("RFID");
                    res.body.should.haveOwnProperty("SKUId");
                    res.body.should.haveOwnProperty("Available");
                    res.body.should.haveOwnProperty("DateOfStock");
                    compareSKUItems(expectedSKUItem, res.body, 1).should.be.equal(true);
                }
                done();
            });
    });
}

function getSKUItemsBySkuID(expectedHTTPStatus, id, expectedLength, expectedSKUItems) {
    it('Get SKU Items by SKU ID', function (done) {
        agent.get('/api/skuitems/sku/' + id)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const skuitem of res.body) {
                        skuitem.should.haveOwnProperty("RFID");
                        skuitem.should.haveOwnProperty("SKUId");
                        skuitem.should.haveOwnProperty("DateOfStock");

                        expectedSKUItems.some((xpctd) => { return compareSKUItems(xpctd, skuitem, 0); }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function compareSKUItems(expectedSKUItem, otherSKUItem, checkAvailable) {
    if (expectedSKUItem.RFID != otherSKUItem.RFID) return false;
    if (expectedSKUItem.SKUId != otherSKUItem.SKUId) return false;
    if (checkAvailable && expectedSKUItem.Available != otherSKUItem.Available) return false;
    if (expectedSKUItem.DateOfStock != otherSKUItem.DateOfStock) return false;

    return true;
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

function createPosition(expectedHTTPStatus, position) {
    it('Inserting a new position', function (done) {
        if (position !== undefined) {
            agent.post('/api/position')
                .set('content-type', 'application/json')
                .send(position)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/position')
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function updateSKUItem(expectedHTTPStatus, rfid, skuItem) {
    it(`Updating SKU Item [RFID: ${rfid}]`, function (done) {
        if (skuItem !== undefined) {
            agent.put(`/api/skuitems/${rfid}`)
                .set('content-type', 'application/json')
                .send(skuItem)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/skuitems/${rfid}]`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function updatePositionSKU(expectedHTTPStatus, id, position) {
    it(`Updating SKU [id: ${id}] position`, function (done) {
        if (position !== undefined) {
            agent.put(`/api/sku/${id}/position`)
                .set('content-type', 'application/json')
                .send(position)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/sku/${id}/position`)
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

function deletePosition(expectedHTTPStatus, positionID) {
    it('Deleting a position', function (done) {
        agent.delete(`/api/position/${positionID}`)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}