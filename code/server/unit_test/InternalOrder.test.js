const IO = require('../modules/InternalOrder')
const SKU = require('../modules/SKU')
const SKU_ITEM = require('../modules/SKUItem')

beforeAll(async () => {
    await new Promise(process.nextTick);
    await IO.deleteAllInternalOrders();
    await IO.deleteAllInternalOrdersSKUItems();
    await IO.deleteAllInternalOrdersProducts();

});
afterAll(async () => {
    await new Promise(process.nextTick);
    await IO.deleteAllInternalOrders();
    await IO.deleteAllInternalOrdersSKUItems();
    await IO.deleteAllInternalOrdersProducts();
});


describe("Create Internal Order", () => {
    beforeEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
    });
    afterEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
    });

    test('get all InternalOrders with an empty list', async () => {
        await expect(IO.getAllInternalOrders()).resolves.toEqual([]);
    });

    test('Create a new Internal Order', async () => {
        await expect(IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1)).resolves.toEqual('New InternalOrder inserted');
    });

    test('Check newly created Internal Order', async () => {
        await expect(IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1)).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.getAllInternalOrders()).resolves.toEqual([{ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" }]);
        await expect(IO.getInternalOrderById(1)).resolves.toEqual({ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" });

    });

    test('Check 2 newly created Internal Order', async () => {
        await expect(IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1)).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.getAllInternalOrders()).resolves.toEqual([{ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" }]);
        await expect(IO.getInternalOrderById(1)).resolves.toEqual({ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" });

        await expect(IO.createNewInternalOrder(2, '20/11/1998', 'ISSUED', 1)).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.getAllInternalOrders()).resolves.toEqual([{ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" }, { "customerID": 1, "id": 2, "issueDate": "20/11/1998", "products": [], "state": "ISSUED" }]);
        await expect(IO.getInternalOrderById(2)).resolves.toEqual({ "customerID": 1, "id": 2, "issueDate": "20/11/1998", "products": [], "state": "ISSUED" });

    });

    test('Check  creating a repeated Internal Order', async () => {
        await expect(IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1)).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.getAllInternalOrders()).resolves.toEqual([{ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" }]);
        await expect(IO.getInternalOrderById(1)).resolves.toEqual({ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" });

        await expect(IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1)).rejects.toThrow();
        await expect(IO.getAllInternalOrders()).resolves.toEqual([{ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" }]);

    });

    test('get a non existing Internal Order', async () => {
        await expect(IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1)).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.getAllInternalOrders()).resolves.toEqual([{ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" }]);
        await expect(IO.getInternalOrderById(1)).resolves.toEqual({ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" });

        await expect(IO.getInternalOrderById(5)).resolves.toEqual({ error: "ID not found." });

    });


});


describe('Get last internal Order ID', () => {
    beforeEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
    });
    afterEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
    });

    test('get get last ID from empty list', async () => {
        await expect(IO.getLastInternalOrderId()).resolves.toBe(0);
    });

    test('get get last ID ', async () => {

        await expect(IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1)).resolves.toEqual('New InternalOrder inserted');

        await expect(IO.getLastInternalOrderId()).resolves.toBe(1);
    });

    test('get get last ID of multiple element list ', async () => {

        await expect(IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1)).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.createNewInternalOrder(22, '19/11/1998', 'ISSUED', 1)).resolves.toEqual('New InternalOrder inserted');

        await expect(IO.getLastInternalOrderId()).resolves.toBe(22);
    });

});



describe("get Internal Order By state", () => {
    beforeEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1);
        await IO.createNewInternalOrder(2, '19/11/1998', 'DELIVERED', 1);
        await IO.createNewInternalOrder(3, '19/11/1998', 'MOCKSTATE', 1);
        await IO.createNewInternalOrder(4, '19/11/1998', 'MOCKSTATE', 1)
    });
    afterEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
    });

    test("get by state 'ISSUED' ", async () => {
        await expect(IO.getInternalOrderByState('ISSUED')).resolves.toEqual([{ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" }]);
    });
    test("get by state 'MOCKSTATE' ", async () => {
        await expect(IO.getInternalOrderByState('MOCKSTATE')).resolves.toEqual([{ "customerID": 1, "id": 3, "issueDate": "19/11/1998", "products": [], "state": "MOCKSTATE" }, { "customerID": 1, "id": 4, "issueDate": "19/11/1998", "products": [], "state": "MOCKSTATE" }]);
    });
    test("get by state 'NOTASTATE' ", async () => {
        await expect(IO.getInternalOrderByState('NOTASTATE')).resolves.toEqual([]);
    });
    test("get by state empty list ", async () => {
        await IO.deleteAllInternalOrders();
        await expect(IO.getInternalOrderByState('ISSUED')).resolves.toEqual([]);
    });

});

describe("Modify Internal Order", () => {
    beforeEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1);
        await IO.createNewInternalOrder(2, '19/11/1998', 'DELIVERED', 1);
        await IO.createNewInternalOrder(3, '19/11/1998', 'MOCKSTATE', 1);
        await IO.createNewInternalOrder(4, '19/11/1998', 'MOCKSTATE', 1)
    });
    afterEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
    });

    test(" Modify Internal order State ", async () => {
        await expect(IO.getInternalOrderById(1)).resolves.toEqual({ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" });
        await expect(IO.modifyInternalOrder(1, '19/11/1998', 'NEWSTATE', 1)).resolves.toEqual('InternalOrder updated');
        await expect(IO.getInternalOrderById(1)).resolves.toEqual({ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "NEWSTATE" });
    });
    test(" Modify Internal order customer Id ", async () => {
        await expect(IO.getInternalOrderById(1)).resolves.toEqual({ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" });
        await expect(IO.modifyInternalOrder(1, '19/11/1998', 'ISSUED', 3)).resolves.toEqual('InternalOrder updated');
        await expect(IO.getInternalOrderById(1)).resolves.toEqual({ "customerID": 3, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" });
    });
    test(" Modify non existing Internal order ", async () => {
        await expect(IO.modifyInternalOrder(5, '19/11/1998', 'ISSUED', 5)).resolves.toEqual('InternalOrder updated');
    });
    test(" Modify Internal order missing arguments", async () => {
        await expect(IO.modifyInternalOrder()).resolves.toEqual('InternalOrder updated');
    });

});

describe("Delete an internalOrder By ID", () => {
    beforeEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1);
        await IO.createNewInternalOrder(2, '19/11/1998', 'DELIVERED', 1);
        await IO.createNewInternalOrder(3, '19/11/1998', 'MOCKSTATE', 1);
        await IO.createNewInternalOrder(4, '19/11/1998', 'MOCKSTATE', 1)
    });
    afterEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
    });

    test("Delete Internal Order ", async () => {

        await expect(IO.getInternalOrderByState('ISSUED')).resolves.toEqual([{ "customerID": 1, "id": 1, "issueDate": "19/11/1998", "products": [], "state": "ISSUED" }]);
        await expect(IO.deleteInternalOrderByID(1)).resolves.toEqual('InternalOrder deleted');

        await expect(IO.getInternalOrderById(1)).resolves.toEqual({ error: "ID not found." });

    });

    test("Delete not existing Internal Order  ", async () => {

        await expect(IO.deleteInternalOrderByID(5)).resolves.toEqual('InternalOrder deleted');
    });


});
/****************** Internal Order Products *********************/

describe("get Internal Order Products", () => {
    beforeEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await SKU_ITEM.deleteAllSKUItems();
        await SKU.deleteAllSKUs();
        await IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1);
        await IO.createNewInternalOrder(2, '19/11/1998', 'DELIVERED', 1);
        await IO.createNewInternalOrder(3, '19/11/1998', 'MOCKSTATE', 1);
        await IO.createNewInternalOrder(4, '20/11/1998', 'MOCKSTATE', 1)
        await IO.addInternalOrdersProducts(2, '1', 10);

        //need SKUs in SKU table to have the query work on Internal Orders
        await SKU.createNewSKU(1, 'a description', 0, 0, null, 0, 0, 10);
        await SKU.createNewSKU(2, 'another description', 0, 0, null, 0, 0, 10);
        //also skuItems needed
        await SKU_ITEM.createNewSKUItem(12341234, 1, '1/1/1999', 1);
        await SKU_ITEM.createNewSKUItem(22222222, 1, '1/1/1999', 2);

    });
    afterEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await SKU_ITEM.deleteAllSKUItems();
        await SKU.deleteAllSKUs();
    });

    test("Add a product to an internal Order", async () => {

        await expect(IO.addInternalOrdersProducts('1', '1', '1')).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.getInternalOrdersProductById('1')).resolves.toEqual([
            {
                "description": "a description",
                "internalOrderID": 1,
                "price": 0,
                "quantity": 1,
                "skuID": 1,
            },
        ]);
    });
    test("get all products in internal Order", async () => {

        await expect(IO.getAllInternalOrdersProduct()).resolves.toEqual([{ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1 }]);
        await expect(IO.addInternalOrdersProducts('1', '1', '1')).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.getAllInternalOrdersProduct()).resolves.toEqual([{ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1 }, { "description": "a description", "internalOrderID": 1, "price": 0, "quantity": 1, "skuID": 1, }]);

    });
    test("get all products in internal Orders empty list", async () => {

        await expect(IO.deleteAllInternalOrdersProducts()).resolves.not.toEqual();
        await expect(IO.getAllInternalOrdersProduct()).resolves.toEqual([]);

    });
    test("Products from an Internal Order", async () => {

        await expect(IO.getInternalOrdersProductById(2)).resolves.toEqual([{ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1, },]);

    });
    test("Products from a non existing Internal Order", async () => {
        await expect(IO.getInternalOrdersProductById(10)).resolves.toEqual([]);

    });

    test("Products from an empty Internal Order", async () => {
        await expect(IO.getInternalOrdersProductById(3)).resolves.toEqual([]);
    });

    test("Delete InternalOrder Products", async () => {
        await expect(IO.getAllInternalOrdersProduct()).resolves.toEqual([{ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1 }]);
        await expect(IO.addInternalOrdersProducts('1', '1', '1')).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.getAllInternalOrdersProduct()).resolves.toEqual([{ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1 }, { "description": "a description", "internalOrderID": 1, "price": 0, "quantity": 1, "skuID": 1, }]);
        await expect(IO.deleteInternalOrderProducts(1)).resolves.toEqual('InternalOrder products deleted');
        await expect(IO.getAllInternalOrdersProduct()).resolves.toEqual([{ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1 }]);
    });

    test("Delete InternalOrder Products of empty order", async () => {
        await expect(IO.getAllInternalOrdersProduct()).resolves.toEqual([{ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1 }]);
        await expect(IO.addInternalOrdersProducts('1', '1', '1')).resolves.toEqual('New InternalOrder inserted');
        await expect(IO.getAllInternalOrdersProduct()).resolves.toEqual([{ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1 }, { "description": "a description", "internalOrderID": 1, "price": 0, "quantity": 1, "skuID": 1, }]);
        await expect(IO.deleteInternalOrderProducts(3)).resolves.toEqual('InternalOrder products deleted');
        await expect(IO.getAllInternalOrdersProduct()).resolves.toEqual([{ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1 }, { "description": "a description", "internalOrderID": 1, "price": 0, "quantity": 1, "skuID": 1, }]);
    });

});

describe("get Internal Order SKUItems", () => {
    beforeEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await SKU_ITEM.deleteAllSKUItems();
        await SKU.deleteAllSKUs();
        await IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1);
        await IO.createNewInternalOrder(2, '19/11/1998', 'DELIVERED', 1);
        await IO.createNewInternalOrder(3, '19/11/1998', 'MOCKSTATE', 1);
        await IO.createNewInternalOrder(4, '20/11/1998', 'MOCKSTATE', 1);
        await IO.addInternalOrdersSKUItems(1, 12341234);
        await IO.addInternalOrdersSKUItems(1, 22222222);
        await IO.addInternalOrdersSKUItems(2, 22222222);
        //need SKUs in SKU table to have the query work on Internal Orders
        await SKU.createNewSKU(1, 'a description', 0, 0, null, 0, 0, 10);
        await SKU.createNewSKU(2, 'another description', 0, 0, null, 0, 0, 10);
        //also skuItems needed
        await SKU_ITEM.createNewSKUItem(12341234, 1, '1/1/1999', 1);
        await SKU_ITEM.createNewSKUItem(22222222, 1, '1/1/1999', 2);
    });
    afterEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await SKU_ITEM.deleteAllSKUItems();
        await SKU.deleteAllSKUs();
    });
    test("get Internal Orders SKUs", async () => {

        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 1,
                RFID: '12341234',
                description: 'a description',
                price: 0,
                skuID: 1
            },
            {
                internalOrderID: 1,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            },
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]
        );

    });

    test("get Internal Order Skus when Empty list", async () => {

        await expect(IO.deleteAllInternalOrdersSKUItems()).resolves.not.toEqual();
        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([]);

    });

    test("get Internal Order Skus by Internal Order ID", async () => {

        await expect(IO.getInternalOrdersSKUItemById(1)).resolves.toEqual([
            {
                "RFID": "12341234",
                "description": "a description",
                "internalOrderID": 1,
                "price": 0,
                "skuID": 1,
            },
            {
                "RFID": "22222222",
                "description": "another description",
                "internalOrderID": 1,
                "price": 0,
                "skuID": 2,
            },
        ]);

        await expect(IO.getInternalOrdersSKUItemById(2)).resolves.toEqual([
            {
                "RFID": "22222222",
                "description": "another description",
                "internalOrderID": 2,
                "price": 0,
                "skuID": 2,
            },
        ]);

        await expect(IO.getInternalOrdersSKUItemById(3)).resolves.toEqual([]);

        await expect(IO.getInternalOrdersSKUItemById(4)).resolves.toEqual([]);
    });

});

describe("modify Internal Order SKUItems", () => {
    beforeEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await SKU_ITEM.deleteAllSKUItems();
        await SKU.deleteAllSKUs();
        await IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1);
        await IO.createNewInternalOrder(2, '19/11/1998', 'DELIVERED', 1);
        await IO.createNewInternalOrder(3, '19/11/1998', 'MOCKSTATE', 1);
        await IO.createNewInternalOrder(4, '20/11/1998', 'MOCKSTATE', 1);
        await IO.addInternalOrdersSKUItems(1, 12341234);
        await IO.addInternalOrdersSKUItems(1, 22222222);
        await IO.addInternalOrdersSKUItems(2, 22222222);
        //need SKUs in SKU table to have the query work on Internal Orders
        await SKU.createNewSKU(1, 'a description', 0, 0, null, 0, 0, 10);
        await SKU.createNewSKU(2, 'another description', 0, 0, null, 0, 0, 10);
        //also skuItems needed
        await SKU_ITEM.createNewSKUItem(12341234, 1, '1/1/1999', 1);
        await SKU_ITEM.createNewSKUItem(22222222, 1, '1/1/1999', 2);
    });
    afterEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await SKU_ITEM.deleteAllSKUItems();
        await SKU.deleteAllSKUs();
    });

    test("modify Internal Order Skus ID", async () => {

        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 1,
                RFID: '12341234',
                description: 'a description',
                price: 0,
                skuID: 1
            },
            {
                internalOrderID: 1,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            },
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]);
        await expect(IO.modifyInternalOrderSKUItems(2, 12341234)).resolves.toEqual('InternalOrdersSKUItems updated');
        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 2,
                RFID: '12341234',
                description: 'a description',
                price: 0,
                skuID: 1
            },
            {
                internalOrderID: 1,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            },
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]);
    });

    test("modify Internal Order Skus ID of a repeated RFID", async () => {

        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 1,
                RFID: '12341234',
                description: 'a description',
                price: 0,
                skuID: 1
            },
            {
                internalOrderID: 1,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            },
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]);
        await expect(IO.modifyInternalOrderSKUItems(3, 22222222)).rejects.toThrow();

    });

    test("delete Internal Order Skus", async () => {

        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 1,
                RFID: '12341234',
                description: 'a description',
                price: 0,
                skuID: 1
            },
            {
                internalOrderID: 1,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            },
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]);
        await expect(IO.deleteInternalOrderSKUItems(1)).resolves.toEqual('InternalOrder SKU Items deleted');
        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]);
    });

    test("delete Internal Order Skus of an empty order", async () => {

        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 1,
                RFID: '12341234',
                description: 'a description',
                price: 0,
                skuID: 1
            },
            {
                internalOrderID: 1,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            },
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]);
        await expect(IO.deleteInternalOrderSKUItems(3)).resolves.toEqual('InternalOrder SKU Items deleted');
        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 1,
                RFID: '12341234',
                description: 'a description',
                price: 0,
                skuID: 1
            },
            {
                internalOrderID: 1,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            },
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]);
    });

    test("delete Internal Order Skus of an non existing order", async () => {

        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 1,
                RFID: '12341234',
                description: 'a description',
                price: 0,
                skuID: 1
            },
            {
                internalOrderID: 1,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            },
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]);
        await expect(IO.deleteInternalOrderSKUItems(4)).resolves.toEqual('InternalOrder SKU Items deleted');
        await expect(IO.getAllInternalOrdersSKUItems()).resolves.toEqual([
            {
                internalOrderID: 1,
                RFID: '12341234',
                description: 'a description',
                price: 0,
                skuID: 1
            },
            {
                internalOrderID: 1,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            },
            {
                internalOrderID: 2,
                RFID: '22222222',
                description: 'another description',
                price: 0,
                skuID: 2
            }
        ]);
    });

});

describe("get Internal Order Product By skuID", () => {
    beforeEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await SKU_ITEM.deleteAllSKUItems();
        await SKU.deleteAllSKUs();
        await IO.createNewInternalOrder(1, '19/11/1998', 'ISSUED', 1);
        await IO.createNewInternalOrder(2, '19/11/1998', 'DELIVERED', 1);
        await IO.createNewInternalOrder(3, '19/11/1998', 'MOCKSTATE', 1);
        await IO.createNewInternalOrder(4, '20/11/1998', 'MOCKSTATE', 1);
        await IO.addInternalOrdersProducts(2, 1, 10);
        await IO.addInternalOrdersProducts(1, 1, 1);

        //need SKUs in SKU table to have the query work on Internal Orders
        await SKU.createNewSKU(1, 'a description', 0, 0, null, 0, 0, 10);
        await SKU.createNewSKU(2, 'another description', 0, 0, null, 0, 0, 10);
        //also skuItems needed
        await SKU_ITEM.createNewSKUItem(12341234, 1, '1/1/1999', 1);
        await SKU_ITEM.createNewSKUItem(22222222, 1, '1/1/1999', 2);

    });
    afterEach(async () => {
        await IO.deleteAllInternalOrders();
        await IO.deleteAllInternalOrdersSKUItems();
        await IO.deleteAllInternalOrdersProducts();
        await SKU_ITEM.deleteAllSKUItems();
        await SKU.deleteAllSKUs();
    });

    test('get Product by SKUID', async () => {

        await expect(IO.getAllInternalOrdersProduct()).resolves.not.toEqual([]);
        await expect(IO.getInternalOrdersProductBySKUId('1')).resolves.toEqual({ "description": "a description", "internalOrderID": 2, "price": 0, "quantity": 10, "skuID": 1 });
    });

    test('get Product by SKUID of non existing SKU', async () => {

        await expect(IO.getInternalOrdersProductBySKUId('5')).resolves.toEqual({ error: 'SKUID not found.' });
    });



});