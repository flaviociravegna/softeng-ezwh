const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const db_cleaning = require('./utils-dbCleaning');
var agent = chai.request.agent(app);

const N_TEST_DESCRIPTORS = 4;
let testDescriptor1 = { "id": 1, "name": "test descriptor 1", "procedureDescription": "Test description 1", "idSKU": 1 };
let testDescriptor2 = { "id": 2, "name": "test descriptor 2", "procedureDescription": "Test description 2", "idSKU": 1 };
let testDescriptor3 = { "id": 3, "name": "test descriptor 3", "procedureDescription": "Test description 3", "idSKU": 1 };
let testDescriptor4 = { "id": 4, "name": "test descriptor 4", "procedureDescription": "Test description 4", "idSKU": 1 };

/*****************************************************************/

describe('API Test: Test Descriptors', function () {
    setup();

    describe('POST /api/testDescriptor (errors)', function () {
        // Name and description empty
        createTestDescriptor(422, { "name": "", "procedureDescription": "Test description 1", "idSKU": 1 });
        createTestDescriptor(422, { "name": "test descriptor 1", "procedureDescription": "", "idSKU": 1 });

        // Wrong idSKU
        createTestDescriptor(422, { "name": "test descriptor 1", "procedureDescription": "Test description 1", "idSKU": "idSKU must be int" });
        createTestDescriptor(422, { "name": "test descriptor 1", "procedureDescription": "Test description 1", "idSKU": -1 });
        createTestDescriptor(422, { "name": "test descriptor 1", "procedureDescription": "Test description 1", "idSKU": "1" });

        // Empty body
        createTestDescriptor(422);

        // Parameters missing
        createTestDescriptor(422, { "name": "test descriptor 1", "idSKU": 1 });
        createTestDescriptor(422, { "name": "pippo", "desc": "Test description 1", "idSKU": 1 });

        // No SKU associated to idSKU
        createTestDescriptor(404, { "name": "test descriptor 1", "procedureDescription": "Test description 1", "idSKU": 99 });
    });

    // GET /api/testDescriptors
    describe('GET /api/testDescriptors', function () {
        getAllTestDescriptors(200, N_TEST_DESCRIPTORS, [testDescriptor1, testDescriptor2, testDescriptor3, testDescriptor4]);
    });

    // GET /api/testDescriptors/:id
    describe('GET /api/testDescriptors/:id', function () {
        getTestDescriptor(200, 1, testDescriptor1);
        getTestDescriptor(200, 2, testDescriptor2);
        getTestDescriptor(200, 3, testDescriptor3);
        getTestDescriptor(200, 4, testDescriptor4);
    });

    // GET /api/testDescriptors/:id (errors)
    describe('GET /api/testDescriptors/:id (errors)', function () {
        // Not found
        getTestDescriptor(404, 99);

        // Wrong id format
        getTestDescriptor(422, -1);
        getTestDescriptor(422);
    });

    describe('PUT /api/testDescriptor/:id (success)', function () {
        updateTestDescriptor(200, 1, { "newName": "new name 1", "newProcedureDescription": "New Test description 1", "newIdSKU": 1 });
        updateTestDescriptor(200, 2, { "newName": "new name 2", "newProcedureDescription": "New Test description 2", "newIdSKU": 1 });
    });

    describe('PUT /api/testDescriptor/:id (errors)', function () {
        // Test descriptor not found
        updateTestDescriptor(404, 99, { "newName": "new name 1", "newProcedureDescription": "New Test description 1", "newIdSKU": 1 });

        // SKU associated to newIdSKU not found
        updateTestDescriptor(404, 1, { "newName": "new name 1", "newProcedureDescription": "New Test description 1", "newIdSKU": 99 });

        // Wrong parameters
        updateTestDescriptor(422, -1, { "newName": "new name 1", "newProcedureDescription": "New Test description 1", "newIdSKU": 1 });
        updateTestDescriptor(422, 1, { "newName": "", "newProcedureDescription": "New Test description 1", "newIdSKU": 1 });
        updateTestDescriptor(422, 1, { "newName": "new name 1", "newProcedureDescription": "", "newIdSKU": 1 });
        updateTestDescriptor(422, 1, { "newName": "new name 1", "newProcedureDescription": "New Test description 1", "newIdSKU": -1 });
        updateTestDescriptor(422, 1, { "newName": "new name 1", "newProcedureDescription": "New Test description 1", "newIdSKU": "1" });
        updateTestDescriptor(422, 1, { "newName": "new name 1", "newProcedureDescription": "New Test description 1", "newIdSKU": "string" });
        updateTestDescriptor(422, 1, { "newName": "new name 1", "newProcedureDescription": 1532, "newIdSKU": 1 });
    });

    describe('DELETE /api/testDescriptor/:id (errors)', function () {
        deleteTestDescriptor(422);
        deleteTestDescriptor(422, "string");
        deleteTestDescriptor(422, -2);
        deleteTestDescriptor(422, 99);
    });

    clear();
});

/*****************************************************************/

// Setup the data in order to do tests
function setup() {

    //db cleanig
    db_cleaning.deleteAllTestDescriptor(agent);
    db_cleaning.deleteAllSKU(agent);

    describe('POST /api/sku', function () {
        createNewSKU(201, { "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "price": 10.99, "availableQuantity": 1 });
    });

    //PUT /api/testDescriptor
    describe('PUT /api/testDescriptor (success)', function () {
        createTestDescriptor(201, { "name": "test descriptor 1", "procedureDescription": "Test description 1", "idSKU": 1 });
        createTestDescriptor(201, { "name": "test descriptor 2", "procedureDescription": "Test description 2", "idSKU": 1 });
        createTestDescriptor(201, { "name": "test descriptor 3", "procedureDescription": "Test description 3", "idSKU": 1 });
        createTestDescriptor(201, { "name": "test descriptor 4", "procedureDescription": "Test description 4", "idSKU": 1 });
    });
}

function clear() {
    // DELETE TestDescriptors
    describe('DELETE /api/testDescriptor/:id (success) ', function () {
        deleteTestDescriptor(204, 1);
        deleteTestDescriptor(204, 2);
        deleteTestDescriptor(204, 3);
        deleteTestDescriptor(204, 4);
    });

    // DELETE SKU
    describe('DELETE /api/sku', function () {
        deleteSKU(204, 1);
    });
}

/*****************************************************************/

function getAllTestDescriptors(expectedHTTPStatus, expectedLength, expectedTestDescriptors) {
    it('Get all Test Descriptors', function (done) {
        agent.get('/api/testDescriptors')
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const td of res.body) {
                        td.should.haveOwnProperty("id");
                        td.should.haveOwnProperty("name");
                        td.should.haveOwnProperty("procedureDescription");
                        td.should.haveOwnProperty("idSKU");
                        expectedTestDescriptors.some((xpctd) => { return compareTestDescriptors(xpctd, td, 1); }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function getTestDescriptor(expectedHTTPStatus, id, expectedTestDescriptor) {
    it('Get Test Descriptor [id: ' + id + ']', function (done) {
        agent.get('/api/testDescriptors/' + id)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("name");
                    res.body.should.haveOwnProperty("procedureDescription");
                    res.body.should.haveOwnProperty("idSKU");
                    compareTestDescriptors(expectedTestDescriptor, res.body, 0).should.be.equal(true);
                }
                done();
            });
    });
}

function compareTestDescriptors(expectedTestDescriptor, td, checkID) {
    if (checkID && expectedTestDescriptor.id != td.id) return false;
    if (expectedTestDescriptor.name != td.name) return false;
    if (expectedTestDescriptor.procedureDescription != td.procedureDescription) return false;
    if (expectedTestDescriptor.idSKU != td.idSKU) return false;

    return true;
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

function updateTestDescriptor(expectedHTTPStatus, id, testDescriptor) {
    it(`Updating Test Descriptor [id: ${id}]`, function (done) {
        if (testDescriptor !== undefined) {
            agent.put(`/api/testDescriptor/${id}`)
                .set('content-type', 'application/json')
                .send(testDescriptor)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/testDescriptor/${id}]`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
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