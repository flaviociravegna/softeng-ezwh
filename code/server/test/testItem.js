const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

const N_Items = 4;
let item1 = { id: 1, description: "item no.1", price: 10.99, SKUId: 1,supplierId:1 }
let item2 = { id: 2, description: "item no.2", price: 20.99, SKUId: 2,supplierId:1 }
let item3 = { id: 3, description: "item no.3", price: 30.99, SKUId: 3,supplierId:1 }
let item4 = { id: 4, description: "item no.4", price: 40.99, SKUId: 4,supplierId:1 }

/*****************************************************************/

// Setup the data in order to do tests

function setup() {

// POST /api/sku (SUCCESS)
describe('POST /api/sku', function () {
    /***** Success *****/
    createNewSKU(201, { "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "price": 10.99, "availableQuantity": 1 });
    createNewSKU(201, { "description": "SKU 2", "weight": 20, "volume": 20, "notes": "notes 2", "price": 20.99, "availableQuantity": 1 });
    createNewSKU(201, { "description": "SKU 3", "weight": 30, "volume": 30, "notes": "notes 3", "price": 30.99, "availableQuantity": 1 });
    createNewSKU(201, { "description": "SKU 4", "weight": 40, "volume": 40, "notes": "notes 4", "price": 40.99, "availableQuantity": 1 });
    createNewSKU(201, { "description": "SKU 5", "weight": 50, "volume": 50, "notes": "notes 5", "price": 50.99, "availableQuantity": 1 });
});

  // POST /api/items (SUCCESS)
  describe('POST /api/items', function () {
    /***** Success *****/
    createNewItem(201, {"id":1, "description": "item no.1", "price": 10.99, "SKUId": 1,"supplierId":1 });
    createNewItem(201, {"id":2, "description": "item no.2", "price": 20.99, "SKUId": 2,"supplierId":1 });
    createNewItem(201, {"id":3, "description": "item no.3", "price": 30.99, "SKUId": 3,"supplierId":1 });
    createNewItem(201, {"id":4, "description": "item no.4", "price": 40.99, "SKUId": 4,"supplierId":1 });
});

    //PUT/api/newUser
    describe('PUT /api/newUser', function () {
        createNewUser(201, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "testpassword", "type": "supplier" });   
    });
}

describe('API Test: Item', function () {
    setup();

    //POST /api/items
     describe('POST /api/items (errors)', function () {
        // Empty body
        createNewItem(422);

        // Empty description
        createNewItem(422, {"id":5, "description": "", "price": 10.99, "SKUId": 5,"supplierId":1 });
        // Prop description named wrong(same as other props)
        createNewItem(422, {"id":5, "deion": "item no.5", "price": 10.99, "SKUId": 5,"supplierId":1 });
        //Illegal price 
        createNewItem(422, {"id":5, "description": "item no.5", "price": -10, "SKUId": 5,"supplierId":1 });
        // Illegal skuid(skuid not found in db)
        createNewItem(404, {"id":5, "description": "item no.5", "price": 10.99, "SKUId": 6,"supplierId":1 });
        // supplierId and skuid all same with existing data 
        createNewItem(422, {"id":5, "description": "item no.5", "price": 10.99, "SKUId": 1,"supplierId":1 });
    });

     // GET /api/items/:id
     describe('GET /api/items/:id', function () {
       getItem(200,1,item1);
       getItem(200,2,item2);
       getItem(200,3,item3);
       getItem(200,4,item4);
       
    });
    
    

    // GET /api/items
    describe('GET /api/items', function () {
        getAllItems(200, N_Items, [item1, item2, item3, item4]);
    });

   // GET /api/items/:id
    describe('GET /api/items/:id (errors)', function () {
        // id not found
        getItem(404, 114);
        getItem(404, 514);

        // Illegal ID (null or < 1 or not a number)
        getItem(422, -1);
        getItem(422, 0.44);
        getItem(422,"ezwh");
    });

 //UPDATE /api/items/:id
     describe('UPDATE /api/items/:id(success)',function(){
        updateItem(200,1,{
            "newDescription" : "a new sku",
            "newPrice" : 10.99
        })
    });

      //UPDATE /api/items/:id(FAIL)
      describe('UPDATE /api/items/:id(erros)',function(){
          //Illegal price 
        updateItem(422,1,{"newDescription" : "a new sku","newPrice" : -10.99});
        // Empty description
        updateItem(422,1,{"newDescription" : "","newPrice" : 10.99});
        //wrong id
        updateItem(404,114,{"newDescription" : "a new sku","newPrice" : 10.99});
        updateItem(422,"not a number",{"newDescription" : "a new sku","newPrice" : 10.99});
        // wrong prop's name
        updateItem(422,4,{"Description" : "a new sku","newPrice" : 10.99});
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
        deleteSKU(204, 5);
    });

    // DELETE ITEMS
    describe('DELETE /api/items', function () {
        deleteItem(204,1);
        deleteItem(204,2);
        deleteItem(204,3);
        deleteItem(204,4);
    });

    // DELETE SUPPLIER
    describe('DELETE /api/users/:username/:type', function () {
        deleteUser(204,"testUser@testing.it","supplier")
    });
}


function createNewItem(expectedHTTPStatus, Item) {
    it('Inserting a new item', function (done) {
        if (Item !== undefined) {
            agent.post('/api/items')
                .set('content-type', 'application/json')
                .send(Item)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/items')
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

function createNewUser(expectedHTTPStatus, user) {
    it('Inserting a new User', function (done) {
        if (user !== undefined) {
            agent.post('/api/newUser')
                .set('content-type', 'application/json')
                .send(user)
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

function deleteUser(expectedHTTPStatus, username, type) {
    it('Deleting a user', function (done) {
        agent.delete(`/api/users/${username}/${type}`)
            .end(function (err, res) {
                if (err)                     
                    done(err);
                
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function getAllItems(expectedHTTPStatus, expectedLength, expectedItems) {
    it('Get all Items', function (done) {
        agent.get('/api/items')
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const item of res.body) {
                        item.should.haveOwnProperty("id");
                        item.should.haveOwnProperty("description");
                        item.should.haveOwnProperty("supplierId");
                        item.should.haveOwnProperty("SKUId"); 
                        item.should.haveOwnProperty("price");


                        expectedItems.some((i) => { return compareItems(i, item, 1); }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function getItem(expectedHTTPStatus, id, expectedItem) {
    it('Get item', function (done) {
        agent.get('/api/items/' + id)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("id");
                    res.body.should.haveOwnProperty("description");
                    res.body.should.haveOwnProperty("supplierId");
                    res.body.should.haveOwnProperty("SKUId"); 
                    res.body.should.haveOwnProperty("price");
                    compareItems(expectedItem, res.body, 0).should.be.equal(true);
                }
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

function updateItem(expectedHTTPStatus, id, item) {
    it(`Updating item [id: ${id}] item`, function (done) {
        if (item !== undefined) {
            agent.put(`/api/items/${id}`)
                .set('content-type', 'application/json')
                .send(item)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/items/${id}`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function deleteItem(expectedHTTPStatus,id) {
    it('Deleting a item', function (done) {
        agent.delete(`/api/items/${id}`)
            .end(function (err, res) {
                if (err)
                    done(err);

                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}


function compareItems(expectedItem, otherItem, checkID) {
    if (checkID && expectedItem.id != otherItem.id) {return false;}
    if (expectedItem.description != otherItem.description)  {return false;}
    if (expectedItem.supplierId != otherItem.supplierId)  {return false;}
    if (expectedItem.SKUId != otherItem.SKUId)  { return false;}
    if (expectedItem.price != otherItem.price)  {return false;}

    

    return true;
}
