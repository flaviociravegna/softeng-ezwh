const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

const N_POSITIONS = 4;
let position1 = { "positionID": "800234523411", "aisleID": "8002", "row": "3452", "col": "3411", "maxWeight": 1000, "maxVolume": 1000, "occupiedWeight": 100, "occupiedVolume": 100 };
let position2 = { "positionID": "800234523412", "aisleID": "8002", "row": "3452", "col": "3412", "maxWeight": 1000, "maxVolume": 1000, "occupiedWeight": 100, "occupiedVolume": 100 };
let position3 = { "positionID": "800234523413", "aisleID": "8002", "row": "3452", "col": "3413", "maxWeight": 1000, "maxVolume": 1000, "occupiedWeight": 100, "occupiedVolume": 100 };
let position4 = { "positionID": "800234523414", "aisleID": "8002", "row": "3452", "col": "3414", "maxWeight": 1000, "maxVolume": 1000, "occupiedWeight": 100, "occupiedVolume": 100 };

/*****************************************************************/

describe('API Test: Positions', function () {
    setup();

    describe('POST /api/positions (errors)', function () {
        // Wrong positionID length
        createPosition(422, { "positionID": "80023452341", "aisleID": "8002", "row": "3452", "col": "3411", "maxWeight": 1000, "maxVolume": 1000 });

        // Wrong aisleID, row, col length
        createPosition(422, { "positionID": "800234523411", "aisleID": "800", "row": "3452", "col": "3411", "maxWeight": 1000, "maxVolume": 1000 });
        createPosition(422, { "positionID": "800234523411", "aisleID": "8002", "row": "345", "col": "3411", "maxWeight": 1000, "maxVolume": 1000 });
        createPosition(422, { "positionID": "800234523411", "aisleID": "8002", "row": "3452", "col": "341", "maxWeight": 1000, "maxVolume": 1000 });

        // maxWeight and maxVolume less or equal 0
        createPosition(422, { "positionID": "800234523411", "aisleID": "8002", "row": "3452", "col": "3411", "maxWeight": 0, "maxVolume": 1000 });
        createPosition(422, { "positionID": "800234523411", "aisleID": "8002", "row": "3452", "col": "3411", "maxWeight": 1000, "maxVolume": 0 });

        // Empty body
        createPosition(422);

        // Parameters missing
        createPosition(422, { "positionID": "800234523411", "row": "3452", "col": "3411", "maxVolume": 1000 });

        // Parameters not consistent
        createPosition(422, { "positionID": "800234523416", "aisleID": "8002", "row": "3452", "col": "3411", "maxWeight": 1000, "maxVolume": 1000 });
    });

    describe('PUT /api/position/:positionID/changeID (errors)', function () {
        // Wrong positionID length
        updatePositionID(422, "80023452341", { "newPositionID": "800234523415" });

        // Wrong newPositionID length
        updatePositionID(422, "800234523411", { "newPositionID": "80023452341" });

        // Wrong body parameters name
        updatePositionID(422, "800234523499", { "posID": "800234523411" });

        // Empty body
        updatePositionID(422, "800234523499");

        // Position not found
        updatePositionID(404, "800234523499", { "newPositionID": "800234523411" });
    });

    describe('PUT /api/position/:positionID (errors)', function () {
        // Wrong positionID length
        updatePosition(422, "80023452341", { "newAisleID": "8002", "newRow": "3452", "newCol": "3411", "newMaxWeight": 1000, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });

        // Wrong newAisleID length
        updatePosition(422, "800234523411", { "newAisleID": "800", "newRow": "3452", "newCol": "3411", "newMaxWeight": 1000, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });

        // newMaxWeight negative
        updatePosition(422, "800234523411", { "newAisleID": "8002", "newRow": "3452", "newCol": "3411", "newMaxWeight": -1, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });

        // Wrong body parameters name
        updatePosition(422, "800234523411", { "aisleID": "8002", "row": "3452", "newCol": "3411", "newMaxWeight": 1000, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });

        // newRow missing
        updatePosition(422, "800234523411", { "newAisleID": "8002", "newCol": "3411", "newMaxWeight": 1000, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });

        // Empty body
        updatePositionID(422, "800234523499");

        // Position not found
        updatePositionID(404, "800234523499", { "newPositionID": "800234523411" });
    });

    // GET /api/positions
    describe('GET /api/positions', function () {
        getAllPositions(200, N_POSITIONS, [position1, position2, position3, position4]);
    });

    // Change col: 3411 -> 3415
    describe('PUT /api/position/:positionID and /api/position/:positionID/changeID', function () {
        updatePosition(200, "800234523411", { "newAisleID": "8002", "newRow": "3452", "newCol": "3415", "newMaxWeight": 1000, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });
        updatePositionID(200, "800234523411", { "newPositionID": "800234523415" });
    });

    // DELETE /api/positions
    describe('GET /api/positions', function () {
        deleteSKU(422, 99);
        deleteSKU(422, -1);
        deleteSKU(422);
    });

    clear();
});

/*****************************************************************/

// Setup the data in order to do tests
function setup() {
    describe('POST /api/position (success)', function () {
        createPosition(201, { "positionID": "800234523411", "aisleID": "8002", "row": "3452", "col": "3411", "maxWeight": 1000, "maxVolume": 1000 });
        createPosition(201, { "positionID": "800234523412", "aisleID": "8002", "row": "3452", "col": "3412", "maxWeight": 1000, "maxVolume": 1000 });
        createPosition(201, { "positionID": "800234523413", "aisleID": "8002", "row": "3452", "col": "3413", "maxWeight": 1000, "maxVolume": 1000 });
        createPosition(201, { "positionID": "800234523414", "aisleID": "8002", "row": "3452", "col": "3414", "maxWeight": 1000, "maxVolume": 1000 });
    });

    describe('POST /api/sku', function () {
        createNewSKU(201, { "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "price": 10.99, "availableQuantity": 1 });
    });

    // PUT /api/sku/:id/position
    describe('PUT /api/sku/:id/position (success)', function () {
        updatePositionSKU(200, 1, { position: "800234523411" });
    });

    describe('PUT /api/position/:positionID (success)', function () {
        updatePosition(200, "800234523411", { "newAisleID": "8002", "newRow": "3452", "newCol": "3411", "newMaxWeight": 1000, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });
        updatePosition(200, "800234523412", { "newAisleID": "8002", "newRow": "3452", "newCol": "3412", "newMaxWeight": 1000, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });
        updatePosition(200, "800234523413", { "newAisleID": "8002", "newRow": "3452", "newCol": "3413", "newMaxWeight": 1000, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });
        updatePosition(200, "800234523414", { "newAisleID": "8002", "newRow": "3452", "newCol": "3414", "newMaxWeight": 1000, "newMaxVolume": 1000, "newOccupiedWeight": 100, "newOccupiedVolume": 100 });
    });
}

function clear() {
    describe('DELETE /api/sku', function () {
        deleteSKU(204, 1);
    });

    // DELETE POSITIONS
    describe('DELETE /api/position/:positionID', function () {
        deletePosition(204, "800234523415");    // Old "800234523411"
        deletePosition(204, "800234523412");
        deletePosition(204, "800234523413");
        deletePosition(204, "800234523414");
    });
}

/*****************************************************************/

function getAllPositions(expectedHTTPStatus, expectedLength, expectedPositions) {
    it('Get all positions', function (done) {
        agent.get('/api/positions')
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const pos of res.body) {
                        pos.should.haveOwnProperty("positionID");
                        pos.should.haveOwnProperty("aisleID");
                        pos.should.haveOwnProperty("row");
                        pos.should.haveOwnProperty("col");
                        pos.should.haveOwnProperty("maxWeight");
                        pos.should.haveOwnProperty("maxVolume");
                        pos.should.haveOwnProperty("occupiedWeight");
                        pos.should.haveOwnProperty("occupiedVolume");
                        expectedPositions.some((xpctd) => { return comparePositions(xpctd, pos); }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function comparePositions(expectedPositions, pos) {
    if (expectedPositions.positionID != pos.positionID) return false;
    if (expectedPositions.aisleID != pos.aisleID) return false;
    if (expectedPositions.row != pos.row) return false;
    if (expectedPositions.col != pos.col) return false;
    if (expectedPositions.maxWeight != pos.maxWeight) return false;
    if (expectedPositions.maxVolume != pos.maxVolume) return false;
    if (expectedPositions.occupiedWeight != pos.occupiedWeight) return false;
    if (expectedPositions.occupiedVolume != pos.occupiedVolume) return false;

    return true;
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

function updatePosition(expectedHTTPStatus, positionID, position) {
    it(`Updating Position [id: ${positionID}]`, function (done) {
        if (position !== undefined) {
            agent.put(`/api/position/${positionID}`)
                .set('content-type', 'application/json')
                .send(position)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/position/${positionID}]`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function updatePositionID(expectedHTTPStatus, positionID, position) {
    it(`Updating Position ID [id: ${positionID}]`, function (done) {
        if (position !== undefined) {
            agent.put(`/api/position/${positionID}/changeID`)
                .set('content-type', 'application/json')
                .send(position)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/position/${positionID}/changeID`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
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