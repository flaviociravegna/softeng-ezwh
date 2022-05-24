const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

let testResult1 = { id: 1, idTestDescriptor: 1, Date: "2021/11/28", Result: true };
let testResult2 = { id: 3, idTestDescriptor: 2, Date: "2021/11/28", Result: false };

describe('API Test: Test Result', () => {
    setup();

    describe('GET /api/skuitems/:rfid/testResults', function () {
        getAllTestResultsByRFID(200, 2, [testResult1, testResult2], "12345678901234567890123456789011");
    });

    describe('GET /api/skuitems/:rfid/testResults (error test)', function () {
        getAllTestResultsByRFID(404, 0, [], "12345678901234567890123456789000");
        getAllTestResultsByRFID(422, 0, [], "1234567890123456789012345678900");
        getAllTestResultsByRFID(422, 0, [], "abc45678901234567890123456789011");
    });

    describe('GET /api/skuitems/:rfid/testResults/:id', function () {
        getTestResultByID(200, testResult1, "12345678901234567890123456789011", 1);
    });

    describe('GET /api/skuitems/:rfid/testResults/:id (error test)', function () {
        // Sku Item not exists
        getTestResultByID(404, testResult1, "12345678901234567890123456789000", 1);
        // Sku Item with testResult id not found
        getTestResultByID(404, testResult1, "12345678901234567890123456789012", 1);
        // Empty RFID
        //getTestResultByID(422, testResult1, "", 1);
        // Wrog RFID
        getTestResultByID(422, testResult1, "1234567890123456789012345678901", 1);
        getTestResultByID(422, testResult1, "123456789012345678901234567890ab", 1);
        // Wrong Id
        getTestResultByID(422, testResult1, "12345678901234567890123456789012", "abc");
        getTestResultByID(422, testResult1, "12345678901234567890123456789011", -1);
    });

    describe('POST /api/skuitems/testResult (error test)', function () {
        // SKU Item not found
        createTestResult(404, { "rfid":"12345678901234567890123456789000", "idTestDescriptor":1, "Date":"2021/11/28", "Result": true });
        // Test Descriptor not found
        createTestResult(404, { "rfid":"12345678901234567890123456789012", "idTestDescriptor":12, "Date":"2021/11/28", "Result": true });
        // Invalid RFID
        createTestResult(422, { "rfid":"1234567890123456789012345678901", "idTestDescriptor":2, "Date":"2021/11/28", "Result": false });
        createTestResult(422, { "rfid":"1234567890123456789012345678901a", "idTestDescriptor":2, "Date":"2021/11/28", "Result": false });
        // Invalid idTestDescriptor
        createTestResult(422, { "rfid":"12345678901234567890123456789011", "idTestDescriptor":-1, "Date":"2021/11/28", "Result": true });
        createTestResult(422, { "rfid":"12345678901234567890123456789011", "idTestDescriptor": "abc", "Date":"2021/11/28", "Result": true });
        createTestResult(422, { "rfid":"12345678901234567890123456789011", "idTestDescriptor": "", "Date":"2021/11/28", "Result": true });
        // Invalid Date
        createTestResult(422, { "rfid":"12345678901234567890123456789011", "idTestDescriptor":1, "Date":"", "Result": true });
        createTestResult(422, { "rfid":"12345678901234567890123456789011", "idTestDescriptor":1, "Date":"2021.11.28", "Result": true });
        // Invalid Result
        createTestResult(422, { "rfid":"12345678901234567890123456789011", "idTestDescriptor":1, "Date":"2021/11/28", "Result": "abc" });
        createTestResult(422, { "rfid":"12345678901234567890123456789011", "idTestDescriptor":1, "Date":"2021/11/28", "Result": 200 });
        createTestResult(422, { "rfid":"12345678901234567890123456789011", "idTestDescriptor":1, "Date":"2021/11/28", "Result": -3 });
    });

    describe('PUT /api/skuitems/:rfid/testResult/:id (success)', function () {
        modifyTestResult(200, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": true });
    });

    describe('PUT /api/skuitems/:rfid/testResult/:id (errors test)', function () {
        // Sku Item not found
        modifyTestResult(404, "12345678901234567890123456789000", 1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": true });
        // Test Result not found
        modifyTestResult(404, "12345678901234567890123456789011", 12, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": true });
        modifyTestResult(404, "12345678901234567890123456789012", 1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": true });
        // Test Descriptor not found
        modifyTestResult(404, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":12, "newDate":"2021/11/28", "newResult": true });
        // Invalid RFID
        modifyTestResult(422, "1234567890123456789012345678900", 1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": true });
        modifyTestResult(422, "1A345678901234567890123456789011", 1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": true });
        // Invalid id
        modifyTestResult(422, "12345678901234567890123456789011", -1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": true });
        modifyTestResult(422, "12345678901234567890123456789011", "abc", { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": true });
        // Invalid Test Descriptor
        modifyTestResult(422, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":-1, "newDate":"2021/11/28", "newResult": true });
        modifyTestResult(422, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":"abc", "newDate":"2021/11/28", "newResult": true });
        // Invalid Date
        modifyTestResult(422, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":1, "newDate":"2021/11", "newResult": true });
        modifyTestResult(422, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":1, "newDate":"2021.11.28", "newResult": true });
        // Invalid Result
        modifyTestResult(422, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": null });
        modifyTestResult(422, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": 200 });
        modifyTestResult(422, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": -20 });
        modifyTestResult(422, "12345678901234567890123456789011", 1, { "newIdTestDescriptor":1, "newDate":"2021/11/28", "newResult": "wrong" });

    });

    describe('DELETE /api/skuitems/:rfid/testResult/:id (error test)', function () {
         // Invalid RFID
        deleteTestResult(422, "1234567890123456789012345678901", 1);  
        deleteTestResult(422, "123456789012345678901234567890ab", 1);
        // Invalid Id
        deleteTestResult(422, "12345678901234567890123456789011", -1);
        deleteTestResult(422, "12345678901234567890123456789011", "abc");

    });

    restore();
});

function setup() {
    // Create sku
    describe('POST /api/sku', function () {
        createSKU(201, { "description": "SKU", "weight": 50, "volume": 50, "notes": "test notes", "price": 10.99, "availableQuantity": 2 });
    });  

    describe('POST /api/skuitem (success)', function () {
        createNewSKUItem(201, { RFID: "12345678901234567890123456789011", SKUId: 1, DateOfStock: "2021/11/29" });
        createNewSKUItem(201, { RFID: "12345678901234567890123456789012", SKUId: 1, DateOfStock: "2021/11/29 12:30" });
        createNewSKUItem(201, { RFID: "12345678901234567890123456789013", SKUId: 1, DateOfStock: "2021/11/29 13:30" });
        createNewSKUItem(201, { RFID: "12345678901234567890123456789014", SKUId: 1, DateOfStock: "2021/11/29 14:30" });
    });

    //POST /api/testDescriptor
    describe('POST /api/testDescriptor (success)', function () {
        createTestDescriptor(201, { "name": "test descriptor 1", "procedureDescription": "Test description 1", "idSKU": 1 });
        createTestDescriptor(201, { "name": "test descriptor 2", "procedureDescription": "Test description 2", "idSKU": 1 });
        createTestDescriptor(201, { "name": "test descriptor 3", "procedureDescription": "Test description 3", "idSKU": 1 });
        createTestDescriptor(201, { "name": "test descriptor 4", "procedureDescription": "Test description 4", "idSKU": 1 });
    });

    //POST Test Result
    describe('POST /api/skuitems/testResult (success)', function () {
        createTestResult(201, { "rfid":"12345678901234567890123456789011", "idTestDescriptor":1, "Date":"2021/11/28", "Result": true });
        createTestResult(201, { "rfid":"12345678901234567890123456789012", "idTestDescriptor":1, "Date":"2021/11/28", "Result": true });
        createTestResult(201, { "rfid":"12345678901234567890123456789011", "idTestDescriptor":2, "Date":"2021/11/28", "Result": false });
        createTestResult(201, { "rfid":"12345678901234567890123456789013", "idTestDescriptor":2, "Date":"2021/11/28", "Result": false });
    });
}

function restore() {

    // DELETE Test Results
    describe('DELETE /api/skuitems/:rfid/testResult/:id (success)', function () {
        deleteTestResult(204, "12345678901234567890123456789011", 1);  
        deleteTestResult(204, "12345678901234567890123456789012", 2);
        deleteTestResult(204, "12345678901234567890123456789011", 3);
        deleteTestResult(204, "12345678901234567890123456789013", 4);
    });

    // DELETE Test Descriptors
    describe('DELETE /api/testDescriptor/:id (success) ', function () {
        deleteTestDescriptor(204, 1);
        deleteTestDescriptor(204, 2);
        deleteTestDescriptor(204, 3);
        deleteTestDescriptor(204, 4);
    });

    // DELETE /api/skuitems/:rfid
    describe('DELETE /api/skuitems/:rfid (success)', function () {
        deleteSKUItem(204, "12345678901234567890123456789011");   
        deleteSKUItem(204, "12345678901234567890123456789012");
        deleteSKUItem(204, "12345678901234567890123456789013");
        deleteSKUItem(204, "12345678901234567890123456789014");
    });

    // DELETE /api/skus/:id (SUCCESS)
    describe('DELETE /api/sku', function () {
        deleteSKU(204, 1);
    });

}

function getAllTestResultsByRFID(expectedHTTPStatus, expectedLength, expectedTestResult, RFID) {
    it('Get Test Result', function (done) {
        agent.get(`/api/skuitems/${RFID}/testResults`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const testResult of res.body) {
                        testResult.should.haveOwnProperty("id");
                        testResult.should.haveOwnProperty("idTestDescriptor");
                        testResult.should.haveOwnProperty("Date");
                        testResult.should.haveOwnProperty("Result");

                        expectedTestResult.some((exp) => { 
                            return compareTestResult(exp, testResult);
                        }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function getTestResultByID(expectedHTTPStatus, expectedTestResult, RFID, ID) {
    it('Get Test Result by ID', function (done) {
        agent.get(`/api/skuitems/${RFID}/testResults/${ID}`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("id");
                    res.body.should.haveOwnProperty("idTestDescriptor");
                    res.body.should.haveOwnProperty("Date");
                    res.body.should.haveOwnProperty("Result");
                    compareTestResult(expectedTestResult, res.body).should.be.equal(true);                    
                }

                done();
            });
    });
}

function createNewSKUItem(expectedHTTPStatus, SKUItem) {
    it('Inserting a new SKU Item', function (done) {
        if (SKUItem !== undefined) {
            agent.post(`/api/skuitem`)
                .set('content-type', 'application/json')
                .send(SKUItem)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post(`/api/skuitem`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function createSKU(expectedHTTPStatus, SKU) {
    it('Inserting a new SKU', function (done) {
        if (SKU !== undefined) {
            agent.post(`/api/sku`)
                .set('content-type', 'application/json')
                .send(SKU)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post(`/api/sku`)
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
            agent.post(`/api/testDescriptor`)
                .set('content-type', 'application/json')
                .send(testDescriptor)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post(`/api/testDescriptor`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function createTestResult(expectedHTTPStatus, testResult) {
    it('Inserting a new test result', function (done) {
        if (testResult !== undefined) {
            agent.post(`/api/skuitems/testResult`)
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

function modifyTestResult(expectedHTTPStatus, RFID, id, newTestResult) {
    it(`Updating Test Result:`, function (done) {
        agent.put(`/api/skuitems/${RFID}/testResult/${id}`)
            .set('content-type', 'application/json')
            .send(newTestResult)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
        
    });
}

function compareTestResult(expectedTestResult, testResult) {
    if(expectedTestResult.id != testResult.id) return false;
    if(expectedTestResult.idTestDescriptor != testResult.idTestDescriptor) return false;
    if(expectedTestResult.Date != testResult.Date) return false;
    if(expectedTestResult.Result != testResult.Result) return false;
    
    return true;
}