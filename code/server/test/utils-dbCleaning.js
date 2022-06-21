//---------------------------------------------------------------------------------------------------------
//                                           DELETE FUNCTIONS
//---------------------------------------------------------------------------------------------------------

function deleteAllPositions(agent) {
    describe('Removing all Positions', function () {
        it('Getting Positions', async function () {
            const res = await agent.get('/api/positions');
            res.should.have.status(200);
            if (res.body.length !== 0) {
                for (let i = 0; i < res.body.length; i++) {
                    const res2 = await agent.delete('/api/position/' + res.body[i].positionID);
                    res2.should.have.status(204);
                }
            }
        });
    });
}

function deleteAllSKU(agent) {
    describe('Removing all SKUs', function () {
        it('Getting SKUs', async function () {
            const res = await agent.get('/api/skus');
            res.should.have.status(200);

            if (res.body.length !== 0) {
                for (let i = 0; i < res.body.length; i++) {
                    const res2 = agent.delete('/api/skus/' + res.body[i].positionID);
                    res2.should.have.status(204);
                }
            }
        });
    });
}

function deleteAllTestDescriptor(agent) {
    describe('Removing all Test Descriptor', function () {
        it('Getting Test Descriptor', async function () {
            const res = await agent.get('/api/testDescriptors');
            res.should.have.status(200);
            if (res.body.length !== 0) {
                for (let i = 0; i < res.body.length; i++) {
                    const res2 = await agent.delete('/api/testDescriptor/' + res.body[i].positionID);
                    res2.should.have.status(204);
                }
            }
        });
    });
}

function deleteAllSkuItems(agent) {
    describe('removing all skuitems', function () {
        it('Getting SKUitems', async function () {
            const res = await agent.get('/api/skuitems');
            res.should.have.status(200);

            if (res.body.length !== 0) {
                let res2;
                for (let i = 0; i < res.body.length; i++) {
                    res2 = await agent.delete('/api/skuitems/' + res.body[i].RFID);
                    res2.should.have.status(204);
                }
            }
        });
    });
}

function deleteAllTestResults(agent) {
    describe('removing all test results', function () {
        it('Delete all test results associated to a certain rfid', async function () {
            this.timeout(5000);
            const res1 = await agent.get('/api/skuitems/');
            res1.should.have.status(200);
            res1.body.should.be.a('array');
            if (res1.body.length !== 0) {

                for (let i = 0; i < res1.body.length; i++) {
                    const res2 = await agent.get('/api/skuitems/' + res1.body[i].rfid + '/testResults')
                    res2.should.have.status(200);
                    res2.body.should.be.a('array');

                    if (res2.body.length !== 0) {
                        for (let i = 0; i < res2.body.length; i++) {
                            const res3 = agent.delete('/api/skuitems/' + res2.body[i].rfid + '/testResult/' + res2.body[i].id)
                            res3.should.have.status(204);
                        }
                    }
                }
            }
        });
    });
}

function deleteAllInternalOrders(agent) {
    describe('Removing all Internal Orders', function () {
        it('Getting Internal Orders', async function () {
            this.timeout(5000);
            const res = await agent.get('/api/internalOrders');
            res.should.have.status(200);

            if (res.body.length !== 0) {
                for (let i = 0; i < res.body.length; i++) {
                    const res2 = await agent.delete('/api/internalOrders/' + res.body[i].id);
                    res2.should.have.status(204);
                }
            }
        })
    });
}

function deleteAllItems(agent) {
    describe('Removing all Items', function () {
        it('Getting Items', async function () {
            const res = await agent.get('/api/items');
            res.should.have.status(200);

            if (res.body.length !== 0) {
                for (let i = 0; i < res.body.length; i++) {
                    const res2 = await agent.delete('/api/items/' + res.body[i].id + '/' + res.body[i].supplierId);
                    res2.should.have.status(204);
                }
            }
        });
    });
}

function deleteAllRestockOrders(agent) {
    describe('Removing all Restock orders', function () {
        it('Getting and removing', async function () {
            const res = await agent.get('/api/restockOrders');
            res.should.have.status(200);
            if (res.body.length !== 0) {
                for (let i = 0; i < res.body.length; i++) {
                    const res2 = await agent.delete('/api/restockOrder/' + res.body[i].id);
                    res2.should.have.status(204);
                }
            }
        });
    });
}

function deleteAllReturnOrders(agent) {
    describe('Removing all return orders', function () {
        it('Getting and removing', async function () {
            const res = await agent.get('/api/returnOrders');
            res.should.have.status(200);
            if (res.body.length !== 0) {
                for (let i = 0; i < res.body.length; i++) {
                    agent.delete('/api/returnOrder/' + res.body[i].id);
                    res2.should.have.status(204);
                }
            }
        })
    });
}

exports.deleteAllPositions = deleteAllPositions;
exports.deleteAllSKU = deleteAllSKU;
exports.deleteAllTestDescriptor = deleteAllTestDescriptor;
exports.deleteAllSkuItems = deleteAllSkuItems;
exports.deleteAllTestResults = deleteAllTestResults;
exports.deleteAllInternalOrders = deleteAllInternalOrders;
exports.deleteAllItems = deleteAllItems;
exports.deleteAllRestockOrders = deleteAllRestockOrders;
exports.deleteAllReturnOrders = deleteAllReturnOrders;

