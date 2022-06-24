const RO = require('../modules/ReturnOrder');
const database = require("../modules/DB");

beforeAll(async () => {
    await database.createConnection();
    await new Promise(process.nextTick);
});
afterAll(async () => {
    await new Promise(process.nextTick);
});

describe("Create new Return Orders", () => {
    beforeEach(async () => {

        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
    });

    afterEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
    });

    test('no return orders in the list', async () => {
        await expect(RO.getReturnOrders()).resolves.toEqual([]);
    });

    test('Create a new return Order', async () => {
        await expect(RO.createNewReturnOrder('19/11/2020', 1, 1)).resolves.toEqual({ done: 'New ReturnOrder inserted' });
        await expect(RO.getReturnOrderById(1)).resolves.toEqual({ "id": 1, "returnDate": '19/11/2020', "products": [], "restockOrderId": 1 });
    });

    test('Create 2 new return Order', async () => {
        await expect(RO.createNewReturnOrder('19/11/2020', 1, 1)).resolves.toEqual({ done: 'New ReturnOrder inserted' });
        await expect(RO.createNewReturnOrder('20/11/2020', 1, 2)).resolves.toEqual({ done: 'New ReturnOrder inserted' });
        //
        await expect(RO.getReturnOrderById(1)).resolves.toEqual({ "id": 1, "returnDate": '19/11/2020', "products": [], "restockOrderId": 1 });
        await expect(RO.getReturnOrderById(2)).resolves.toEqual({ "id": 2, "returnDate": '20/11/2020', "products": [], "restockOrderId": 1 });
        await expect(RO.getReturnOrders()).resolves.toEqual([{ "id": 1, "returnDate": '19/11/2020', "products": [], "restockOrderId": 1 }, { "id": 2, "returnDate": '20/11/2020', "products": [], "restockOrderId": 1 }]);
    });

    test('Fail creating a 2nd return Order, same ID', async () => {
        await expect(RO.createNewReturnOrder('19/11/2020', 1, 1)).resolves.toEqual({ done: 'New ReturnOrder inserted' });
        await expect(RO.createNewReturnOrder('20/11/2020', 1, 1)).rejects.toThrow();
    });

    test('Fail creating a return Order, invalid ID', async () => {
        await expect(RO.createNewReturnOrder('19/11/2020', 1, 'a')).rejects.toThrow();
    });
})

describe('get last Return OrderID', () => {
    beforeEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
        await RO.createNewReturnOrder('19/11/2020', 1, 1);
        await RO.createNewReturnOrder('20/10/2021', 2, 2);
        await RO.createNewReturnOrder('11/01/2022', 3, 3);
    });

    afterEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
    });

    test('retrive last ReturnOrderID with non empty table', async () => {
        await expect(RO.getLastReturnOrderId()).resolves.toEqual(3);
    });

    test('retrive last ReturnOrderID with empty table', async () => {
        await RO.deleteAllReturnOrders();
        await expect(RO.getLastReturnOrderId()).resolves.toEqual(0);
    });
});

describe('get all return Orders', () => {

    beforeEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
        await RO.createNewReturnOrder('19/11/2020', 1, 1);
        await RO.createNewReturnOrder('20/10/2021', 2, 2);
        await RO.createNewReturnOrder('11/01/2022', 3, 3);
    });

    afterEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
    });

    test('get each Return Order by its ID', async () => {
        await expect(RO.getReturnOrderById(1)).resolves.toEqual({ "id": 1, "returnDate": '19/11/2020', "products": [], "restockOrderId": 1 });
        await expect(RO.getReturnOrderById(2)).resolves.toEqual({ "id": 2, "returnDate": '20/10/2021', "products": [], "restockOrderId": 2 });
        await expect(RO.getReturnOrderById(3)).resolves.toEqual({ "id": 3, "returnDate": '11/01/2022', "products": [], "restockOrderId": 3 });
    });

    test('get AllReturn Orders', async () => {
        await expect(RO.getReturnOrderById(1)).resolves.toEqual({ "id": 1, "returnDate": '19/11/2020', "products": [], "restockOrderId": 1 });
        await expect(RO.getReturnOrderById(2)).resolves.toEqual({ "id": 2, "returnDate": '20/10/2021', "products": [], "restockOrderId": 2 });
        await expect(RO.getReturnOrderById(3)).resolves.toEqual({ "id": 3, "returnDate": '11/01/2022', "products": [], "restockOrderId": 3 });

        await expect(RO.getReturnOrders()).resolves.toEqual([{ "id": 1, "returnDate": '19/11/2020', "products": [], "restockOrderId": 1 },
        { "id": 2, "returnDate": '20/10/2021', "products": [], "restockOrderId": 2 },
        { "id": 3, "returnDate": '11/01/2022', "products": [], "restockOrderId": 3 }]);
    });

    test('fail to retrive a non existing order', async () => {
        await expect(RO.getReturnOrderById(4)).resolves.toEqual({ error: 'ReturnOrder not found.' });
    });
});

describe('ReturnOrder Products', () => {
    beforeEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
        await RO.createNewReturnOrder('19/11/2020', 1, 1);
        await RO.createNewReturnOrder('20/10/2021', 2, 2);
        await RO.createNewReturnOrder('11/01/2022', 3, 3);
        await RO.insertProductInRO({ 'SKUId': 1, "itemId": 1, 'description': "a description.", 'price': 19.99, 'RFID': "12345678901234567890123456789014" }, 1);
    });

    afterEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
    });

    test('get return order products', async () => {
        await expect(RO.getReturnOrderProducts(1)).resolves.toEqual([{ 'SKUId': 1, "itemId": 1, 'description': "a description.", 'price': 19.99, 'RFID': "12345678901234567890123456789014" }]);
    });

    test('get return order products when there are none', async () => {
        await expect(RO.getReturnOrderProducts(2)).resolves.toEqual([]);
    });

    test('fail to insert a repeated product', async () => {
        await expect(RO.insertProductInRO({ 'SKUId': 1, "itemId": 1, 'description': "a description.", 'price': 19.99, 'RFID': "12345678901234567890123456789014" }, 1)).rejects.toThrow();
    });

    test('insert a product', async () => {
        await expect(RO.insertProductInRO({ 'SKUId': 2, "itemId": 2, 'description': "another description.", 'price': 29.99, 'RFID': "12345678901234567890123456789015" }, 1)).resolves.toBe('inserted products');
        await expect(RO.getReturnOrderProducts(1)).resolves.toEqual([{ 'SKUId': 1, "itemId": 1, 'description': "a description.", 'price': 19.99, 'RFID': "12345678901234567890123456789014" },
        { 'SKUId': 2, "itemId": 2, 'description': "another description.", 'price': 29.99, 'RFID': "12345678901234567890123456789015" }]);
    });

    test('delete a return order products', async () => {
        await expect(RO.deleteReturnOrderProducts(1)).resolves.toBe('ReturnOrderProducts Deleted');
    });
});

describe('delete a return order Product', () => {
    beforeEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
        await RO.createNewReturnOrder('19/11/2020', 1, 1);
        await RO.createNewReturnOrder('20/10/2021', 2, 2);
        await RO.createNewReturnOrder('11/01/2022', 3, 3);
    });

    afterEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
    });

    test('delete a return Order', async () => {
        await expect(RO.deleteReturnOrder(2)).resolves.toBe('ReturnOrder Deleted');

        await expect(RO.getReturnOrders()).resolves.toEqual([{ "id": 1, "returnDate": '19/11/2020', "products": [], "restockOrderId": 1 },
        { "id": 3, "returnDate": '11/01/2022', "products": [], "restockOrderId": 3 }]);
    });

    test('delete a return Order that doesnt exist', async () => {
        // the sql query just doesnt find a RO, but it doesnt send an error
        await expect(RO.deleteReturnOrder(4)).resolves.toBe('ReturnOrder Deleted');
    });


});

describe('delete a return order', () => {
    beforeEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
        await RO.createNewReturnOrder('19/11/2020', 1, 1);
        await RO.createNewReturnOrder('20/10/2021', 2, 2);
        await RO.createNewReturnOrder('11/01/2022', 3, 3);
        await RO.insertProductInRO({ 'SKUId': 1, "itemId": 1, 'description': "a description.", 'price': 19.99, 'RFID': 12341234 }, 1);

    });
    afterEach(async () => {
        await RO.deleteAllReturnOrders();
        await RO.deleteAllReturnOrdersProducts();
    });

    test('delete a return Order products', async () => {
        await expect(RO.getReturnOrderProducts(1)).resolves.toEqual([{ "RFID": "12341234", "SKUId": 1, "itemId": 1, "description": "a description.", "price": 19.99 }]);
        await expect(RO.deleteReturnOrderProducts(1)).resolves.toBe('ReturnOrderProducts Deleted');

        await expect(RO.getReturnOrderProducts(1)).resolves.toEqual([]);
    });

    test('delete a return Order products of an empty order', async () => {
        // the sql query just doesnt find a RO, but it doesnt send an error
        await expect(RO.getReturnOrderProducts(2)).resolves.toEqual([]);
        await expect(RO.deleteReturnOrderProducts(2)).resolves.toBe('ReturnOrderProducts Deleted');
        await expect(RO.getReturnOrderProducts(2)).resolves.toEqual([]);
    });
    test('delete a return Order products of a non existing order', async () => {
        // the sql query just doesnt find a RO, but it doesnt send an error
        await expect(RO.deleteReturnOrderProducts(4)).resolves.toBe('ReturnOrderProducts Deleted');
    });

});
