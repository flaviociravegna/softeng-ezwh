const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

const N_SKUS = 4;
let sku1 = { id: 1, description: "SKU 1", weight: 10, volume: 10, notes: "notes 1", position: "800234523411", availableQuantity: 1, price: 10.99, testDescriptors: [] }
let sku2 = { id: 2, description: "SKU 2", weight: 20, volume: 20, notes: "notes 2", position: "800234523412", availableQuantity: 1, price: 20.99, testDescriptors: [] }
let sku3 = { id: 3, description: "SKU 3", weight: 30, volume: 30, notes: "notes 3", position: "800234523413", availableQuantity: 1, price: 30.99, testDescriptors: [] }
let sku4 = { id: 4, description: "SKU 4", weight: 40, volume: 40, notes: "notes 4", position: "800234523414", availableQuantity: 1, price: 40.99, testDescriptors: [1, 2] }

/*****************************************************************/

describe('API Test: SKU', function () {
    setup();

    describe('POST /api/skus (errors)', function () {
        // Empty body
        createNewSKU(422);

        // Empty description (same as notes)
        createNewSKU(422, { "description": "", "weight": 40, "volume": 40, "notes": "notes 3", "price": 40.99, "availableQuantity": 1 });

        // Prop description named wrong
        createNewSKU(422, { "desc": "DESC 4", "weight": 40, "volume": 40, "notes": "notes 3", "price": 40.99, "availableQuantity": 1 });

        // weight (same as volume) <= 0
        createNewSKU(422, { "description": "SKU 4", "weight": 0, "volume": 0, "notes": "notes 3", "price": 40.99, "availableQuantity": 1 });

        // availableQuantity (same as volume) = -1 [should be >= 0]
        createNewSKU(422, { "description": "SKU 4", "weight": 40, "volume": 40, "notes": "notes 3", "price": 40.99, "availableQuantity": -1 });

        // availableQuantity (or other fields) missing
        createNewSKU(422, { "description": "SKU 4", "weight": 40, "volume": 40, "notes": "notes 3", "price": 40.99 });
    });

    // GET /api/skus
    describe('GET /api/skus', function () {
        getAllSKUs(200, N_SKUS, [sku1, sku2, sku3, sku4]);
    });

    // GET /api/skus/:id
    describe('GET /api/skus/:id', function () {
        getSKU(200, 1, sku1);
        getSKU(200, 2, sku2);
        getSKU(200, 3, sku3);
        getSKU(200, 4, sku4);
    });

    // GET /api/skus/:id
    describe('GET /api/skus/:id (errors)', function () {
        // SKU not found
        getSKU(404, 100);
        getSKU(404, 10);

        // Wrong ID (null or < 1)
        getSKU(422, -1);
        getSKU(422, 0);
        getSKU(422);
    });

    // PUT /api/sku/:id/position (error)
    describe('PUT /api/sku/:id/position (errors)', function () {
        /***** Errors *****/
        // Empty body
        updatePositionSKU(422, 1);

        // Position not existing
        updatePositionSKU(404, 1, { position: "800234523410" });

        // SKU not existing
        updatePositionSKU(404, 100, { position: "800234523414" });

        // ID format wrong
        updatePositionSKU(422, "ID must be an int", { position: "80023452341" });

        // Position format wrong (11 chars instead of 12)
        updatePositionSKU(422, 3, { position: "80023452341" });

        // Position format wrong (not a string)
        updatePositionSKU(422, 3, { position: 800234523414 });

        // Position format wrong (prop name wrong)
        updatePositionSKU(422, 3, { pos: "800234523414" });

        // Position format wrong (empty object)
        updatePositionSKU(422, 3, {});
    });

    // DELETE /api/skus/:id (errors)
    describe('DELETE /api/sku (errors)', function () {
        /***** Errors *****/
        deleteSKU(422);
        deleteSKU(422, "id should be int");
        deleteSKU(422, 100);
    });

    clear();
});

/*****************************************************************/

// Setup the data in order to do tests
function setup() {
    describe('POST /api/position', function () {
        createPosition(201, { "positionID": "800234523411", "aisleID": "8002", "row": "3452", "col": "3411", "maxWeight": 1000, "maxVolume": 1000 });
        createPosition(201, { "positionID": "800234523412", "aisleID": "8002", "row": "3452", "col": "3412", "maxWeight": 1000, "maxVolume": 1000 });
        createPosition(201, { "positionID": "800234523413", "aisleID": "8002", "row": "3452", "col": "3413", "maxWeight": 1000, "maxVolume": 1000 });
        createPosition(201, { "positionID": "800234523414", "aisleID": "8002", "row": "3452", "col": "3414", "maxWeight": 1000, "maxVolume": 1000 });
    });

    // POST /api/sku (SUCCESS)
    describe('POST /api/sku', function () {
        /***** Success *****/
        createNewSKU(201, { "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "price": 10.99, "availableQuantity": 1 });
        createNewSKU(201, { "description": "SKU 2", "weight": 20, "volume": 20, "notes": "notes 2", "price": 20.99, "availableQuantity": 1 });
        createNewSKU(201, { "description": "SKU 3", "weight": 30, "volume": 30, "notes": "notes 3", "price": 30.99, "availableQuantity": 1 });
        createNewSKU(201, { "description": "SKU 4", "weight": 40, "volume": 40, "notes": "notes 4", "price": 40.99, "availableQuantity": 1 });
    });

    // PUT /api/sku/:id/position
    describe('PUT /api/sku/:id/position (success)', function () {
        /***** Success *****/
        updatePositionSKU(200, 1, { position: "800234523411" });
        updatePositionSKU(200, 2, { position: "800234523412" });
        updatePositionSKU(200, 3, { position: "800234523413" });
        updatePositionSKU(200, 4, { position: "800234523414" });
    });

    //PUT /api/testDescriptor
    describe('PUT /api/testDescriptor', function () {
        createTestDescriptor(201, { "name": "test descriptor 1", "procedureDescription": "Test description 1", "idSKU": 4 });
        createTestDescriptor(201, { "name": "test descriptor 2", "procedureDescription": "Test description 2", "idSKU": 4 });
    });
}

function clear() {
    // Clear the data inserted
    // SKU must be eliminated before
    // DELETE /api/skus/:id (SUCCESS)
    describe('DELETE /api/sku', function () {
        /***** Success *****/
        deleteSKU(204, 1);
        deleteSKU(204, 2);
        deleteSKU(204, 3);
        deleteSKU(204, 4);
    });

    // DELETE POSITIONS
    describe('DELETE /api/position/:positionID', function () {
        deletePosition(204, "800234523411");
        deletePosition(204, "800234523412");
        deletePosition(204, "800234523413");
        deletePosition(204, "800234523414");
    });

    // DELETE TEST DESCRIPTORS
    describe('DELETE /api/position/:positionID', function () {
        deleteTestDescriptor(204, 1);
        deleteTestDescriptor(204, 2);
    });
}

/*****************************************************************/

function getAllSKUs(expectedHTTPStatus, expectedLength, expectedSKUs) {
    it('Get all SKUs', function (done) {
        agent.get('/api/skus')
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const sku of res.body) {
                        sku.should.haveOwnProperty("id");
                        sku.should.haveOwnProperty("description");
                        sku.should.haveOwnProperty("weight");
                        sku.should.haveOwnProperty("volume");
                        sku.should.haveOwnProperty("position");
                        sku.should.haveOwnProperty("availableQuantity");
                        sku.should.haveOwnProperty("price");
                        sku.should.haveOwnProperty("testDescriptors");
                        sku.testDescriptors.should.be.an('array');

                        expectedSKUs.some((xpctd) => { return compareSKUs(xpctd, sku, 1); }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function getSKU(expectedHTTPStatus, skuID, expectedSKU) {
    it('Get SKU', function (done) {
        agent.get('/api/skus/' + skuID)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("description");
                    res.body.should.haveOwnProperty("weight");
                    res.body.should.haveOwnProperty("volume");
                    res.body.should.haveOwnProperty("position");
                    res.body.should.haveOwnProperty("availableQuantity");
                    res.body.should.haveOwnProperty("price");
                    res.body.should.haveOwnProperty("testDescriptors");
                    res.body.testDescriptors.should.be.an('array');
                    compareSKUs(expectedSKU, res.body, 0).should.be.equal(true);
                }
                done();
            });
    });
}

function compareSKUs(expectedSKU, otherSKU, checkID) {
    if (checkID && expectedSKU.id != otherSKU.id) return false;
    if (expectedSKU.description != otherSKU.description) return false;
    if (expectedSKU.weight != otherSKU.weight) return false;
    if (expectedSKU.volume != otherSKU.volume) return false;
    if (expectedSKU.position != otherSKU.position) return false;
    if (expectedSKU.availableQuantity != otherSKU.availableQuantity) return false;
    if (expectedSKU.price != otherSKU.price) return false;

    if (expectedSKU.testDescriptors.length != otherSKU.testDescriptors.length) return false;
    for (const expectedTestDescID of expectedSKU.testDescriptors) {
        const found = otherSKU.testDescriptors.some((td) => {
            return expectedTestDescID == td;
        });

        if (!found)
            return false;
    }

    return true;
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