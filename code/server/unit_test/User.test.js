const USER_DAO = require("../modules/User");

describe("Create new User", () => {
    beforeEach(async () => {
        await USER_DAO.deleteAllTestUser();
    });

    afterEach(async () => {
        await USER_DAO.deleteAllTestUser();
    });

    test("Create new User, then get by Id", async () => {
        await expect(USER_DAO.searchMaxID()).resolves.toEqual(6);
        let user = { id: "7", username: "PaulRed@email.it", name: "Paul", surname: "Red", hash: "hashpassword", type: "customer"};
        await expect(USER_DAO.createNewUser(user))
            .resolves.toEqual(null);

        // Check if they are really the ones created
        await expect(USER_DAO.getUserByUsernameAndType("PaulRed@email.it", "customer")).resolves.toEqual([{username: "PaulRed@email.it", type: "customer"}]);
    });

    test("Create new User: duplicated id", async () => {
        let user = { id: "6", username: "PaulRed@email.it", name: "Paul", surname: "Red", hash: "hashpassword", type: "customer"};
        await expect(USER_DAO.createNewUser(user))
            .rejects.toThrow();
    });

    test("Create new User: missing values", async () => {
        let user = { name: "Paul", surname: "Red", hash: "hashpassword", type: "customer"};
        await expect(USER_DAO.createNewUser(user))
            .rejects.toThrow();
    });

});

describe("Get User Info (login)", () => {
    beforeEach(async () => {
        await USER_DAO.deleteAllTestUser();
        await USER_DAO.createNewUser({ id: "7", username: "PaulRed@email.it", name: "Paul", surname: "Red", hash: "$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka", type: "customer"})
    });

    afterEach(async () => {
        await USER_DAO.deleteAllTestUser();
    });

    test("Login: correct username and password", async () => {
        await expect(USER_DAO.getUserInfo("PaulRed@email.it", "testpassword")).resolves.toEqual({ id: 7, username: "PaulRed@email.it", name: "Paul" });
    });

    test("Login: incorrect username", async () => {
        await expect(USER_DAO.getUserInfo("wrong@email.it", "testpassword")).resolves.toEqual(false);
    });

    test("Login: incorrect password", async () => {
        await expect(USER_DAO.getUserInfo("PaulRed@email.it", "wrongpassword")).resolves.toEqual(false);
    });

});

describe("Get User By:", () => {
    beforeEach(async () => {
        await USER_DAO.deleteAllTestUser();
        await USER_DAO.createNewUser({ id: "7", username: "PaulRed@email.it", name: "Paul", surname: "Red", hash: "$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka", type: "supplier"})
    });

    afterEach(async () => {
        await USER_DAO.deleteAllTestUser();
    });

    test("Get User By: Id", async () => {
        await expect(USER_DAO.getUserInfoById(7)).resolves.toEqual({ id: 7, username: "PaulRed@email.it", name: "Paul", surname: "Red", type: "supplier" });
    });

    test("Get User: user not found", async () => {
        await expect(USER_DAO.getUserInfoById(11)).resolves.toEqual({ error: 'User not found.' });
    });
    
    test("Get User By: Username and type", async () => {
        await expect(USER_DAO.getUserByUsernameAndType("PaulRed@email.it", "supplier")).resolves.toEqual([{ username: "PaulRed@email.it", type: "supplier" }]);
    });

    test("Get User By: Username and type not found", async () => {
        await expect(USER_DAO.getUserByUsernameAndType("PaulRed@email.it", "customer")).resolves.toEqual([]);
    });

    test("Get User By: supplier id", async () => {
        await expect(USER_DAO.getSupplierById(7)).resolves.toEqual({ userId: 7, username: "PaulRed@email.it", type: "supplier" });
    });

    test("Get User By: supplier id not found", async () => {
        await expect(USER_DAO.getSupplierById(11)).resolves.toEqual({ error: 'Supplier not found.' });
    });

});

describe("Get all users", () => {
    beforeEach(async () => {
        await USER_DAO.deleteAllTestUser();
        await USER_DAO.createNewUser({ id: "7", username: "PaulRed@email.it", name: "Paul", surname: "Red", hash: "$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka", type: "supplier"})
    });

    afterEach(async () => {
        await USER_DAO.deleteAllTestUser();
    });

    test("Get Users except managers", async () => {
        await expect(USER_DAO.getAllUsersExceptManagers()).resolves.toEqual(
            [   { userId: 1, username: "user1@ezwh.com", name: "foo", surname: "foo", type: "customer" },
                { userId: 2, username: "qualityEmployee1@ezwh.com", name: "foo", surname: "foo", type: "qualityEmployee" },
                { userId: 3, username: "clerk1@ezwh.com", name: "foo", surname: "foo", type: "clerk" },
                { userId: 4, username: "deliveryEmployee1@ezwh.com", name: "foo", surname: "foo", type: "deliveryEmployee" },
                { userId: 5, username: "supplier1@ezwh.com", name: "foo", surname: "foo", type: "supplier" },
                { userId: 7, username: "PaulRed@email.it", name: "Paul", surname: "Red", type: "supplier" }
            ]);
    });

    test("Get All suppliers", async () => {
        await expect(USER_DAO.getAllSuppliers()).resolves.toEqual(
            [   { userId: 5, username: "supplier1@ezwh.com", name: "foo", surname: "foo" },
                { userId: 7, username: "PaulRed@email.it", name: "Paul", surname: "Red" }
            ]);
    });
});

describe("Search Max Id", () => {
    beforeEach(async () => {
        await USER_DAO.deleteAllTestUser();
        await USER_DAO.createNewUser({ id: "7", username: "PaulRed@email.it", name: "Paul", surname: "Red", hash: "$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka", type: "supplier"})
    });

    afterEach(async () => {
        await USER_DAO.deleteAllTestUser();
    });

    test("Get max Id of the table", async () => {
        await expect(USER_DAO.searchMaxID()).resolves.toEqual(7);
    });
});

describe("Delete User", () => {
    beforeEach(async () => {
        await USER_DAO.deleteAllTestUser();
        await USER_DAO.createNewUser({ id: "7", username: "PaulRed@email.it", name: "Paul", surname: "Red", hash: "$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka", type: "supplier"})
    });

    afterEach(async () => {
        await USER_DAO.deleteAllTestUser();
    });

    test("Delete user by username and type", async () => {
        await expect(USER_DAO.deleteUser("PaulRed@email.it", "supplier")).resolves.toEqual(null);
    });

    test("Delete user created for test purpose", async () => {
        await expect(USER_DAO.deleteAllTestUser()).resolves.toEqual(null);
    });
});

describe("Modify user", () => {
    beforeEach(async () => {
        await USER_DAO.deleteAllTestUser();
        await USER_DAO.createNewUser({ id: "7", username: "PaulRed@email.it", name: "Paul", surname: "Red", hash: "$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka", type: "supplier"})
    });

    afterEach(async () => {
        await USER_DAO.deleteAllTestUser();
    });

    test("Modify user rights", async () => {
        await expect(USER_DAO.modifyUserRights("PaulRed@email.it", "supplier", "customer")).resolves.toEqual(null);
    });

});
