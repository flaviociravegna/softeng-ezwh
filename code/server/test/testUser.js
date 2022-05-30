const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

let user1 = { id: 1, name: "foo", surname: "foo", email: "user1@ezwh.com", type: "customer"};
let user2 = { id: 2, name: "foo", surname: "foo", email: "qualityEmployee1@ezwh.com", type: "qualityEmployee"};
let user3 = { id: 3, name: "foo", surname: "foo", email: "clerk1@ezwh.com", type: "clerk"};
let user4 = { id: 4, name: "foo", surname: "foo", email: "deliveryEmployee1@ezwh.com", type: "deliveryEmployee"};
let user5 = { id: 5, name: "foo", surname: "foo", email: "supplier1@ezwh.com", type: "supplier"};
let user6 = { id: 6, name: "foo", surname: "foo", email: "manager1@ezwh.com", type: "manager"};
let user7 = { id: 7, name: "Test", surname: "Test", email: "testUser@testing.it", type: "customer"};
let user8 = { id: 8, name: "Test", surname: "Test", email: "testUser2@testing.it", type: "supplier"};


describe('API Test: User', () => {
    setup();

    describe('POST /api/newUser (error test)', function () {
        // Empty body
        createNewUser(422);
        // Incorrect username
        createNewUser(422, { "username": "testUsetesting.it", "name": "Test", "surname": "Test", "password": "testpassword", "type": "customer" });
        // Empty name
        createNewUser(422, { "username": "testUser@testing.it", "name": "", "surname": "Test", "password": "testpassword", "type": "customer" });
        // Empty surname
        createNewUser(422, { "username": "testUser@testing.it", "name": "Test", "surname": "", "password": "testpassword", "type": "customer" });
        // Empty password
        createNewUser(422, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "", "type": "customer" });
        // Too short password
        createNewUser(422, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "short", "type": "customer" });
        // Type not allowed
        createNewUser(422, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "short", "type": "manager" });
        // Type not exists
        createNewUser(422, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "short", "type": "wrongtype" });
        // User with same mail and type already exists
        createNewUser(409, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "testpassword", "type": "customer" });
    });

    describe('GET /api/suppliers', function () {
        getSuppliers(200, 2, [user5, user8]);
    });

    describe('GET /api/users', function () {
        getUsers(200, 7, [user1, user2, user3, user4, user5, user7, user8]);
    });

    describe('POST /api/newUser (success - check all possible user types)', function () {
        // Check all the possible user types
        createNewUser(201, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "testpassword", "type": "qualityEmployee" });
        createNewUser(201, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "testpassword", "type": "clerk" });
        createNewUser(201, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "testpassword", "type": "deliveryEmployee" });
    });

    describe('POST /api/managerSessions (manager Login)', function () {
        doLogin(200, "manager1@ezwh.com",  "testpassword",  {"username": "manager1@ezwh.com", "name": "foo" });
        //wrong password
        doLogin(401, "manager1@ezwh.com",  "wrongpassword");
        //wrong username
        doLogin(401, "wrong@username.com",  "testpassword");
    });

    describe('POST /api/customerSessions (customer Login)', function () {
        doLogin(200, "user1@ezwh.com",  "testpassword",  {"username": "user1@ezwh.comt", "name": "foo" });
        //wrong password
        doLogin(401, "user1@ezwh.com",  "wrongpassword");
        //wrong username
        doLogin(401, "wrong@username.com",  "testpassword");
    });

    describe('POST /api/supplierSessions (supplier Login)', function () {
        doLogin(200, "supplier1@ezwh.com",  "testpassword",  {"username": "supplier1@ezwh.com", "name": "foo" });
        //wrong password
        doLogin(401, "supplier1@ezwh.com",  "wrongpassword");
        //wrong username
        doLogin(401, "wrong@username.com",  "testpassword");
    });

    describe('POST /api/clerkSessions (clerk Login)', function () {
        doLogin(200, "clerk1@ezwh.com",  "testpassword",  {"username": "clerk1@ezwh.com", "name": "foo" });
        //wrong password
        doLogin(401, "clerk1@ezwh.com",  "wrongpassword");
        //wrong username
        doLogin(401, "wrong@username.com",  "testpassword");
    });

    describe('POST /api/qualityEmployeeSessions (quality Employee Login)', function () {
        doLogin(200, "qualityEmployee1@ezwh.com",  "testpassword",  {"username": "qualityEmployee1@ezwh.com", "name": "foo" });
        //wrong password
        doLogin(401, "qualityEmployee1@ezwh.com",  "wrongpassword");
        //wrong username
        doLogin(401, "wrong@username.com",  "testpassword");
    });

    describe('POST /api/deliveryEmployeeSessions (delivery Employee Login)', function () {
        doLogin(200, "deliveryEmployee1@ezwh.com",  "testpassword",  {"username": "deliveryEmployee1@ezwh.com", "name": "foo" });
        //wrong password
        doLogin(401, "deliveryEmployee1@ezwh.com",  "wrongpassword");
        //wrong username
        doLogin(401, "wrong@username.com",  "testpassword");
    });

    /*describe('POST /api/logout', function () {
        customerLogout(200);
    });*/

    describe('PUT /api/users/:username (error test)', function () {
        // wrong username
        modifyUser(404, "customer", "deliveryEmployee", "testUser@wrong.it");
        // wrong user type
        modifyUser(404, "customer", "deliveryEmployee", "testUser2@testing.it");
        // body validation fail
        modifyUser(422,  "customer",  "manager",  "testUser2@testing.it"); 
        modifyUser(422,  "customer",  "", "testUser2@testing.it");
        modifyUser(422, "wrong",  "deliveryEmployee", "testUser2@testing.it");
        modifyUser(422, "customer",  "deliveryEmployee", "testUser2testing.it");
        modifyUser(422, "customer",  "deliveryEmployee");
    });

    describe('PUT /api/users/:username (success)', function () {
        modifyUser(200, "supplier",  "deliveryEmployee",  "testUser2@testing.it");
    });

    describe('DELETE /api/users/:username/:type (error test)', function () {
        deleteUser(422, 'testUser@testing.it', 'manager');
        deleteUser(422, 'testUser@testing.it', 'administrator');
        deleteUser(422, 'testUser@testing.it', 'wrongtype');
        deleteUser(422, 'testUsertesting.it', 'customer');
        deleteUser(422, 'testUsertesting.it', 'wrongtype');
        //user not found
        deleteUser(422, 'testUserwrong@testing.it', 'customer');
        
    });
    restore();
});

/*****************************************************************/

// Setup the data in order to do tests
function setup() {
    describe('POST /api/newUser', function () {
        createNewUser(201, { "username": "testUser@testing.it", "name": "Test", "surname": "Test", "password": "testpassword", "type": "customer" });
        createNewUser(201, { "username": "testUser2@testing.it", "name": "Test", "surname": "Test", "password": "testpassword", "type": "supplier" });
    });    
}

function restore() {
    describe('DELETE /api/users/:username/:type (success)', function () {
        deleteUser(204, 'testUser@testing.it', 'customer');
        deleteUser(204, 'testUser@testing.it', 'qualityEmployee');
        deleteUser(204, 'testUser@testing.it', 'clerk');
        deleteUser(204, 'testUser@testing.it', 'deliveryEmployee');
        deleteUser(204, 'testUser2@testing.it', 'deliveryEmployee');
        
    });
}
/****************************************************************/

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

function doLogin(expectedHTTPStatus, username, password, expectedUser) {
    it('Login user', function (done) {
        if(username !== undefined ) {
            let user = { username: username, password: password }
            agent.post('/api/customerSessions')
                .set('content-type', 'application/json')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    res.should.have.status(expectedHTTPStatus);
            
                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("id");
                    res.body.should.haveOwnProperty("username");
                    res.body.should.haveOwnProperty("name");
                    res.body.username.should.equal(username);
                    res.body.name.should.equal(expectedUser.name);
                }
                done();
            });
        }
    });
}

/*function customerLogout(expectedHTTPStatus) {
    it('Logout user', function (done) {
        
        agent.post('/api/logout')
            .end(function (err, res) {
                if (err)
                    done(err);
                
                res.should.have.status(expectedHTTPStatus);
            done();
        });
    });
}*/

function getSuppliers(expectedHTTPStatus, expectedLength, expectedSuppliers) {
    it('Get all Suppliers', function (done) {
        agent.get('/api/suppliers')
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const user of res.body) {
                        user.should.haveOwnProperty("id");
                        user.should.haveOwnProperty("name");
                        user.should.haveOwnProperty("surname");
                        user.should.haveOwnProperty("email");

                        expectedSuppliers.some((exp) => { 
                            if(exp.id != user.id) return false;
                            if(exp.name != user.name) return false;
                            if(exp.surname != user.surname) return false;
                            if(exp.email != user.email) return false;
                            return true;
                        }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}

function getUsers(expectedHTTPStatus, expectedLength, expectedSuppliers) {
    it('Get all users', function (done) {
        agent.get('/api/users')
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedHTTPStatus);

                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);

                    for (const user of res.body) {
                        user.should.haveOwnProperty("id");
                        user.should.haveOwnProperty("name");
                        user.should.haveOwnProperty("surname");
                        user.should.haveOwnProperty("email");
                        user.should.haveOwnProperty("type");

                        expectedSuppliers.some((exp) => { 
                            if(exp.id != user.id) return false;
                            if(exp.name != user.name) return false;
                            if(exp.surname != user.surname) return false;
                            if(exp.email != user.email) return false;
                            if(exp.type != user.type) return false;
                            return true;
                        }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}


function modifyUser(expectedHTTPStatus, oldType, newType, username) {
    it(`Updating User rights:`, function (done) {
        if (username !== undefined) {
            let user_rights = { oldType: oldType, newType: newType }
            agent.put(`/api/users/${username}`)
                .set('content-type', 'application/json')
                .send(user_rights)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/users/${username}`)
                .end(function (err, res) {
                    if (err)
                        done(err);

                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}