//---------------------------------------------------------------------------------------------------------
//                                           DELETE FUNCTIONS
//---------------------------------------------------------------------------------------------------------


function deleteAllPositions(agent){
    describe('Removing all Positions', function(){
        it('Getting Positions', function(done){
            agent.get('/api/positions')
            .then(function(res){
                res.should.have.status(200);
                if(res.body.length !==0) {
                    for (let i = 0; i< res.body.length; i++){
                        agent.delete('/api/position/'+res.body[i].positionID)
                        .then(function(res2){
                            res2.should.have.status(204);
                        });
                    }
                }
                done();
            }).catch(err => done(err));
        });
    });
}

function deleteAllSKU(agent){
    describe('Removing all SKUs', function(){
        it('Getting SKUs', function(done){
            agent.get('/api/skus')
            .then(function(res){
                res.should.have.status(200);
                if(res.body.length !==0) {
                    for (let i = 0; i< res.body.length; i++){
                        agent.delete('/api/skus/'+res.body[i].positionID)
                        .then(function(res2){
                            res2.should.have.status(204);
                        });
                    }
                }
                done();
            }).catch(err => done(err));
        });
    });
}

function deleteAllTestDescriptor(agent){
    describe('Removing all Test Descriptor', function(){
        it('Getting Test Descriptor', function(done){
            agent.get('/api/testDescriptors')
            .then(function(res){
                res.should.have.status(200);
                if(res.body.length !==0) {
                    for (let i = 0; i< res.body.length; i++){
                        agent.delete('/api/testDescriptor/'+res.body[i].positionID)
                        .then(function(res2){
                            res2.should.have.status(204);
                        });
                    }
                }
                done();
            }).catch(err => done(err));
        });
    });
}

function deleteAllSkuItems(agent) {
    describe('removing all skuitems', function() {
        it('Getting SKUitems', async function () {
            const res = await agent.get('/api/skuitems');
            res.should.have.status(200);
            if (res.body.length !==0) {
                let res2;
                for (let i = 0; i < res.body.length; i++) {
                    res2 = await
                    agent.delete('/api/skuitems/'+res.body[i].RFID);
                    res2.should.have.status(204);
                }
            }
        });
    });
}

function deleteAllTestResults(agent){
    describe('removing all test results', function(){
        it('Delete all test results associated to a certain rfid', async function() {
            const res1 = await agent.get('/api/skuitems/');
            res1.should.have.status(200);
            res1.body.should.be.a('array');
            if (res1.body.length !== 0) {

                for(let i=0; i<res1.body.length; i++){
                    const res2 = await agent.get('/api/skuitems/'+res1.body[i].rfid+'/testResults')
                    res2.should.have.status(200);
                    res2.body.should.be.a('array');

                    if (res2.body.length !== 0) {
                        for(let i=0; i<res2.body.length; i++){
                            const res3 = agent.delete('/api/skuitems/'+res2.body[i].rfid+'/testResult/'+res2.body[i].id)
                                res3.should.have.status(204);
                        }
                    }
                }
            }
        });
    });                     
}

function deleteAllInternalOrders(agent){
    describe('Removing all Internal Orders', function(){
        it('Getting Internal Orders', function(done){
            agent.get('/api/internalOrders')
            .then(function(res){
                res.should.have.status(200);
                if(res.body.length !==0) {
                    for (let i = 0; i< res.body.length; i++){
                        agent.delete('/api/internalOrders/'+res.body[i].id)
                        .then(function(res2){
                            res2.should.have.status(204);
                        });
                    }
                }
                done();
            }).catch(err => done(err));
        });
    });
}

function deleteAllItems(agent){
    describe('Removing all Items', function(){
        it('Getting Items', function(done){
            agent.get('/api/items')
            .then(function(res){
                res.should.have.status(200);
                if(res.body.length !==0) {
                    for (let i = 0; i< res.body.length; i++){
                        agent.delete('/api/items/'+res.body[i].id+'/'+res.body[i].supplierId)
                        .then(function(res2){
                            res2.should.have.status(204);
                        });
                    }
                }
                done();
            }).catch(err => done(err));
        });
    });
}

function deleteAllRestockOrders(agent){
    describe('Removing all Restock orders', function(){
        it('Getting and removing', function(done){
            agent.get('/api/restockOrders')
            .then(function(res){
                res.should.have.status(200);
                if(res.body.length !==0){
                    for( let i=0; i< res.body.length; i++){
                        agent.delete('/api/restockOrder/'+res.body[i].id)
                        .then(function(res2){
                            res2.should.have.status(204);
                        });
                    }
                }
                done();
            }).catch(err => done(err));
        });
    });
}

function deleteAllReturnOrders(agent){
    describe('Removing all return orders', function(){
        it('Getting and removing', function(done){
            agent.get('/api/returnOrders')
            .then(function(res){
                res.should.have.status(200);
                if(res.body.length !==0){
                    for( let i=0; i< res.body.length; i++){
                        agent.delete('/api/returnOrder/'+res.body[i].id)
                        .then(function(res2){
                            res2.should.have.status(204);
                        });
                    }
                }
                done();
            }).catch(err=>done(err));
        });
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

