
const RO = require('../modules/RestockOrder')
const SKU = require('../modules/SKU')
const SKU_ITEM = require('../modules/SKUItem')
const TestResults = require('../modules/testResult_db')

beforeAll(async()=>{
    await new Promise(process.nextTick);
});
afterAll(async()=>{
    await new Promise(process.nextTick);
});

describe('Create and get new RestockOrders', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();

    });

    test('No Restock Order in the List', async () => {
        await expect(RO.getRestockOrders()).resolves.toEqual([]);
    });


    test('Create new RestockOreders', async () => {

        await expect(RO.createRestockOrder('19/11/1999', 1, 1)).resolves.toEqual('New RestockOrder inserted');
        await expect(RO.getRestockOrderById(1)).resolves.toEqual({ 'id': 1, 'issueDate': '19/11/1999', 'state': 'ISSUED', 'products': [], 'supplierID': 1, 'transportNote': null, 'skuItems': [] });
        await expect(RO.getRestockOrders()).resolves.toEqual([{ 'id': 1, 'issueDate': '19/11/1999', 'state': 'ISSUED', 'products': [], 'supplierID': 1, 'transportNote': null, 'skuItems': [] }]);
    });

    test('Create 2 restock orders', async () => {
        await expect(RO.createRestockOrder('19/11/1999', 1, 1)).resolves.toEqual('New RestockOrder inserted');
        await expect(RO.createRestockOrder('20/10/2099', 2, 2)).resolves.toEqual('New RestockOrder inserted');
        await expect(RO.getRestockOrderById(1)).resolves.toEqual({ 'id': 1, 'issueDate': '19/11/1999', 'state': 'ISSUED', 'products': [], 'supplierID': 1, 'transportNote': null, 'skuItems': [] });
        await expect(RO.getRestockOrderById(2)).resolves.toEqual({ 'id': 2, 'issueDate': '20/10/2099', 'state': 'ISSUED', 'products': [], 'supplierID': 2, 'transportNote': null, 'skuItems': [] });
        await expect(RO.getRestockOrders()).resolves.toEqual([{ 'id': 1, 'issueDate': '19/11/1999', 'state': 'ISSUED', 'products': [], 'supplierID': 1, 'transportNote': null, 'skuItems': [] },
        { 'id': 2, 'issueDate': '20/10/2099', 'state': 'ISSUED', 'products': [], 'supplierID': 2, 'transportNote': null, 'skuItems': [] }]);
    });

    test('Insert a restock Order With the same Id', async () => {
        //restock orders use the REPLACE method for insertions on the list
        //that mean it wont fail but it will replace the restock order that was there previously
        await expect(RO.createRestockOrder('19/11/1999', 1, 1)).resolves.toEqual('New RestockOrder inserted');
        await expect(RO.createRestockOrder('19/11/2099', 1, 1)).resolves.toEqual('New RestockOrder inserted');
        await expect(RO.getRestockOrderById(1)).resolves.toEqual({ 'id': 1, 'issueDate': '19/11/2099', 'state': 'ISSUED', 'products': [], 'supplierID': 1, 'transportNote': null, 'skuItems': [] });
    })

    test('fail to get a non existing Order', async () => {
        await expect(RO.getRestockOrderById(4)).resolves.toEqual({ error: 'Restock Order not found' });
    });
});

describe("get Last Restock Order ID", () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();

    });

    test('get last restock Order ID', async () => {
        await expect(RO.getLastIdRsO()).resolves.toBe(3);
    });
    test('get last restock Order ID when list empty', async () => {
        await RO.deleteAllRestockOrders();
        await expect(RO.getLastIdRsO()).resolves.toBe(0);
    });
    test('get last restock Order ID when list lost an element', async () => {
        await RO.deleteRestockOrder(2);
        await expect(RO.getLastIdRsO()).resolves.toBe(3);
    });


});

//unfortunately Restock Order Products requires that A SKU exist previously to get the products
// else it wont return any
describe('RestockOrder Products', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await SKU.deleteAllSKUs();
        await SKU.createNewSKU(1, 'a description', 1, 1, 'notes', 10, 1, 100);
        await SKU.createNewSKU(2, 'another description', 2, 2, 'notes', 20, 2, 200);
    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await SKU.deleteAllSKUs();

    });
    test('Insert a new product', async () => {
        await expect(RO.insertProductInOrder(1, 1, 1, 10)).resolves.toBe(null);

        await expect(RO.getRestockOrderProducts(1)).resolves.toEqual([{ "SKUId": 1, 'description': 'a description', 'price': 10, 'qty': 10 }]);

    });

    test('Insert 2 new products', async () => {
        await expect(RO.insertProductInOrder(1, 1, 1, 10)).resolves.toBe(null);
        await expect(RO.insertProductInOrder(2, 1, 2, 20)).resolves.toBe(null);
        await expect(RO.getRestockOrderProducts(1)).resolves.toEqual([{ "SKUId": 1, 'description': 'a description', 'price': 10, 'qty': 10 },
        { "SKUId": 2, 'description': 'another description', 'price': 20, 'qty': 20 }]);

    });

    test('Fail to insert 2nd product', async () => {
        await expect(RO.insertProductInOrder(1, 1, 1, 10)).resolves.toBe(null);
        await expect(RO.insertProductInOrder(1, 1, 2, 20)).rejects.toThrow();
        await expect(RO.getRestockOrderProducts(1)).resolves.toEqual([{ "SKUId": 1, 'description': 'a description', 'price': 10, 'qty': 10 }]);

    });


});
describe('get SKU by ID', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await SKU.deleteAllSKUs();
        await SKU.createNewSKU(1, 'a description', 1, 1, 'notes', 10, 1, 100);
        await SKU.createNewSKU(2, 'another description', 2, 2, 'notes', 20, 2, 200);
    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await SKU.deleteAllSKUs();

    });
    test('get SKU by ID', async () => {
        await expect(RO.insertProductInOrder(1, 1, 1, 10)).resolves.toBe(null);
        await expect(RO.getSKUByIdFromRestockOrder(1, 1)).resolves.toEqual({ "description": null, "productID": 1, "quantity": 10, "restockOrderID": 1, "skuID": 1 });
    });

    test('get SKU by ID when theres no product', async () => {
        await expect(RO.getSKUByIdFromRestockOrder(1, 1)).resolves.toEqual({ error: 'SKU not found.' });
    });

    test('get SKU by ID when theres a wrong SKUID', async () => {
        await expect(RO.insertProductInOrder(1, 1, 1, 10)).resolves.toBe(null);
        await expect(RO.getSKUByIdFromRestockOrder(2, 1)).resolves.toEqual({ error: 'SKU not found.' });
    })
    test('get SKU by ID when theres a wrong OrderID', async () => {
        await expect(RO.insertProductInOrder(1, 1, 1, 10)).resolves.toBe(null);
        await expect(RO.getSKUByIdFromRestockOrder(1, 2)).resolves.toEqual({ error: 'SKU not found.' });
    })
    test('get SKU by ID when theres a wrong  type OrderID', async () => {
        await expect(RO.insertProductInOrder(1, 1, 1, 10)).resolves.toBe(null);
        await expect(RO.getSKUByIdFromRestockOrder(1, 'a')).resolves.toEqual({ error: 'SKU not found.' });
    })
    test('get SKU by ID when theres a wrong  type SKUID', async () => {
        await expect(RO.insertProductInOrder(1, 1, 1, 10)).resolves.toBe(null);
        await expect(RO.getSKUByIdFromRestockOrder('a', 1)).resolves.toEqual({ error: 'SKU not found.' });
    })
});

describe('delete a Restock order by ID', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await SKU.deleteAllSKUs();
        await SKU.createNewSKU(1, 'a description', 1, 1, 'notes', 10, 1, 100);
        await SKU.createNewSKU(2, 'another description', 2, 2, 'notes', 20, 2, 200);
    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await SKU.deleteAllSKUs();

    });

    test('delete a restockOrder', async () => {
        await expect(RO.deleteRestockOrder(1)).resolves.toBe('deleted Restock Order');
        await expect(RO.getRestockOrders()).resolves.toEqual([{
            "id": 2,
            "issueDate": "20/10/2099",
            "products": [],
            "skuItems": [],
            "state": "ISSUED",
            "supplierID": 2,
            "transportNote": null,
        },
        {
            "id": 3,
            "issueDate": "20/10/2099",
            "products": [],
            "skuItems": [],
            "state": "ISSUED",
            "supplierID": 3,
            "transportNote": null,
        }]);
    })
    test('try to delete a restockOrder that doesnt exist', async () => {
        await expect(RO.deleteRestockOrder(8)).resolves.toBe('deleted Restock Order');
        await expect(RO.getRestockOrders()).resolves.toEqual([{
            "id": 1,
            "issueDate": "19/11/1999",
            "products": [],
            "skuItems": [],
            "state": "ISSUED",
            "supplierID": 1,
            "transportNote": null,
        }, {
            "id": 2,
            "issueDate": "20/10/2099",
            "products": [],
            "skuItems": [],
            "state": "ISSUED",
            "supplierID": 2,
            "transportNote": null,
        },
        {
            "id": 3,
            "issueDate": "20/10/2099",
            "products": [],
            "skuItems": [],
            "state": "ISSUED",
            "supplierID": 3,
            "transportNote": null,
        }]);

    })

});

describe('SKU Items of RestockOrder', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await SKU_ITEM.deleteAllSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await SKU_ITEM.createNewSKUItem(1, 1, '11/11/2020', 1);
        await SKU_ITEM.createNewSKUItem(2, 2, '12/11/2020', 2);

    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await SKU_ITEM.deleteAllSKUItems();

    });

    test('Fail to get RFID when no Item in restock Order', async () => {
        await expect(RO.getRFIDFromRestockOrder(1, 1)).resolves.toEqual({ error: "RFID not found in Restock Order" });
    })
    test('Insert SKUItems to restockOrder', async () => {
        await expect(RO.addRestockOrderSKUItems(1, 1)).resolves.toEqual('New RestockOrder SKU Item inserted');
        await expect(RO.getRestockOrderSkuItems(1)).resolves.toEqual([{ 'SKUId': 1, 'rfid': "1" }]);
    })

    test('Insert 2 SKUItems to restockOrder', async () => {
        await expect(RO.addRestockOrderSKUItems(1, 1)).resolves.toEqual('New RestockOrder SKU Item inserted');
        await expect(RO.addRestockOrderSKUItems(1, 2)).resolves.toEqual('New RestockOrder SKU Item inserted');
        await expect(RO.getRestockOrderSkuItems(1)).resolves.toEqual([{ 'SKUId': 1, 'rfid': "1" }, { 'SKUId': 2, 'rfid': "2" }]);
    })
    test('Insert 2 times the same SKUItem', async () => {
        // it doesnt send an error
        await expect(RO.addRestockOrderSKUItems(1, 1)).resolves.toEqual('New RestockOrder SKU Item inserted');
        await expect(RO.addRestockOrderSKUItems(1, 1)).rejects.toThrow();
        await expect(RO.getRestockOrderSkuItems(1)).resolves.toEqual([{ 'SKUId': 1, 'rfid': "1" }]);
    })
    //the check that the SKU Item effectively exists is done at a higher level

});

describe('Add and get Transport Note', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);

    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();

    });
    test('Add transport note', async () => {
        // it doesnt send an error
        await expect(RO.addRestockOrderTransportNote(1, { 'deliveryDate': '19/11/1997' })).resolves.toEqual('RequestOrders updated');
        await expect(RO.getRestockOrderTransportNote(1)).resolves.toEqual({ 'deliveryDate': '19/11/1997' });
    });
    test('Add transport note empty', async () => {
        // it doesnt send an error
        await expect(RO.addRestockOrderTransportNote(1, {})).resolves.toEqual('RequestOrders updated');
        await expect(RO.getRestockOrderTransportNote(1)).resolves.toEqual(null);

    });
    test("get transport note of a Restock Order that doesn't have one", async () => {
        // it doesnt send an error   
        await expect(RO.getRestockOrderTransportNote(2)).resolves.toEqual({ error: 'Transport note not found' });
    });




});

describe('Modify RestockOrders State', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);

    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();

    });
    test("Modify Restock Order State to DELIVERED", async () => {
        // The validity of the state is checked in a higher level
        await expect(RO.modifyRestockOrderState(1, 'DELIVERED')).resolves.toEqual('modified state to DELIVERED');
        await expect(RO.getRestockOrderById(1)).resolves.toEqual({ "id": 1, "issueDate": "19/11/1999", "products": [], "skuItems": [], "state": "DELIVERED", "supplierID": 1, "transportNote": null });

    });

    test("Modify Restock Order State to ISSUED", async () => {
        // The validity of the state is checked in a higher level
        await expect(RO.modifyRestockOrderState(1, 'ISSUED')).resolves.toEqual('modified state to ISSUED');
        await expect(RO.getRestockOrderById(1)).resolves.toEqual({ "id": 1, "issueDate": "19/11/1999", "products": [], "skuItems": [], "state": "ISSUED", "supplierID": 1, "transportNote": null });

    });
    test("Modify Restock Order State of a non existing order", async () => {
        // Doesnt send an error but doesnt update the table ether
        await expect(RO.modifyRestockOrderState(4, 'DELIVERED')).resolves.toEqual('modified state to DELIVERED');
    });

})
describe('get ISSUED restock Orders', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await RO.modifyRestockOrderState(1, 'DELIVERED');
    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();

    });

    test('get all ISSUED restock Orders', async () => {
        await expect(RO.getRestockOrdersIssued()).resolves.toEqual(
            [
                {
                    "id": 2,
                    "issueDate": "20/10/2099",
                    "products": [],
                    "skuItems": [],
                    "state": "ISSUED",
                    "supplierID": 2,
                    "transportNote": null,
                },
                {
                    "id": 3,
                    "issueDate": "20/10/2099",
                    "products": [],
                    "skuItems": [],
                    "state": "ISSUED",
                    "supplierID": 3,
                    "transportNote": null,
                },
            ]
        );
    });

    test('get all ISSUED restock Orders when there are none', async () => {
        await RO.modifyRestockOrderState(2, 'DELIVERED');
        await RO.modifyRestockOrderState(3, 'DELIVERED');
        await expect(RO.getRestockOrdersIssued()).resolves.toEqual(
            []
        );
    });

});
describe('get last Product Id in Restock Order', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await RO.insertProductInOrder(1, 1, 1234, 10);
        await RO.insertProductInOrder(2, 1, 1234, 10);
    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
    });
    test('get last item ID from an order', async () => {
        await expect(RO.getLastPIDInOrder(1)).resolves.toEqual(2);
    });

    test('get last item ID from empty order', async () => {
        await expect(RO.getLastPIDInOrder(2)).resolves.toEqual(0);
    });

    test('get last item ID from nonexisting order', async () => {
        //check should be done at a higher level
        await expect(RO.getLastPIDInOrder(5)).resolves.toEqual(0);
    });

});
describe('Delete products from RestockOrder', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await RO.insertProductInOrder(1, 1, 1234, 10);
        await RO.insertProductInOrder(2, 1, 1234, 10);
    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
    });
    test('Delete a product from an order', async () => {
        //check should be done at a higher level
        await expect(RO.deleteProductsFromRestockOrder(1)).resolves.toEqual('Deleted');
    });
    test('Delete a product from an empty order', async () => {
        //doesnt send error
        await expect(RO.deleteProductsFromRestockOrder(2)).resolves.toEqual('Deleted');
    });
    test('Delete a product from a non existing order', async () => {
        //check of existance should be done at higher level
        await expect(RO.deleteProductsFromRestockOrder(4)).resolves.toEqual('Deleted');
    });

});

describe('Delete TransportNote from RestockOrder', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await RO.addRestockOrderTransportNote(1, { 'deliveryDate': '19/11/2020' });
    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
    });
    test('Delete a TransportNote from an order', async () => {
        //check should be done at a higher level
        await expect(RO.deleteRestockOrderTransportNote(1)).resolves.toEqual('Deleted');
    });
    test('Delete a TransportNote from an empty order', async () => {
        //doesnt send error
        await expect(RO.deleteRestockOrderTransportNote(2)).resolves.toEqual('Deleted');
    });
    test('Delete a TransportNote from a non existing order', async () => {
        //check of existance should be done at higher level
        await expect(RO.deleteRestockOrderTransportNote(4)).resolves.toEqual('Deleted');
    });

});
describe('Remove SkuItem from Restock Order', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await SKU_ITEM.deleteAllSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await SKU_ITEM.createNewSKUItem(1, 1, '11/11/2020', 1);
        await SKU_ITEM.createNewSKUItem(2, 2, '12/11/2020', 2);
        await RO.addRestockOrderSKUItems(1, 1)
        await RO.addRestockOrderSKUItems(1, 2)

    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await SKU_ITEM.deleteAllSKUItems();

    });
    test('Delete SKUItems from an order', async () => {
        //check should be done at a higher level
        await expect(RO.getRestockOrderSkuItems(1)).resolves.toEqual([
            {
                "SKUId": 1,
                "rfid": "1",
            },
            {
                "SKUId": 2,
                "rfid": "2",
            }]);
        await expect(RO.deleteSkuItemsFromRestockOrder(1)).resolves.toEqual('Deleted');
        await expect(RO.getRestockOrderSkuItems(1)).resolves.toEqual([]);
    });
    test('Delete SKUItems from an empty order', async () => {
        //doesnt send error
        await expect(RO.getRestockOrderSkuItems(2)).resolves.toEqual([]);
        await expect(RO.deleteSkuItemsFromRestockOrder(2)).resolves.toEqual('Deleted');
    });
    test('Delete SKUItems from a non existing order', async () => {
        //check of existance should be done at higher level
        await expect(RO.deleteSkuItemsFromRestockOrder(4)).resolves.toEqual('Deleted');
    });
    test('Delete a SKUItem from an order', async () => {
        //check should be done at a higher level
        await expect(RO.getRestockOrderSkuItems(1)).resolves.toEqual([
            {
                "SKUId": 1,
                "rfid": "1",
            },
            {
                "SKUId": 2,
                "rfid": "2",
            }]);
        await expect(RO.removeSKUItemFromRestockOrder(1, 1)).resolves.toEqual('Item Deleted from RestockOrder');
        await expect(RO.getRestockOrderSkuItems(1)).resolves.toEqual([{
            "SKUId": 2,
            "rfid": "2",
        }]);
    });
    test('Delete a SKUItem from an empty order', async () => {
        //doesnt send error
        await expect(RO.getRestockOrderSkuItems(2)).resolves.toEqual([]);
        await expect(RO.removeSKUItemFromRestockOrder(2, 2)).resolves.toEqual('Item Deleted from RestockOrder');
    });
    test('Delete a SKUItem from a non existing order', async () => {
        //check of existance should be done at higher level
        await expect(RO.removeSKUItemFromRestockOrder(4, 4)).resolves.toEqual('Item Deleted from RestockOrder');
    });

});

describe('get Restock Order Failed SKUItems', () => {
    beforeEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await SKU_ITEM.deleteAllSKUItems();
        await RO.createRestockOrder('19/11/1999', 1, 1);
        await RO.createRestockOrder('20/10/2099', 2, 2);
        await RO.createRestockOrder('20/10/2099', 3, 3);
        await SKU_ITEM.createNewSKUItem(1, 1, '11/11/2020', 1);
        await SKU_ITEM.createNewSKUItem(2, 2, '12/11/2020', 2);
        await RO.addRestockOrderSKUItems(1, 1)
        await RO.addRestockOrderSKUItems(1, 2)
        await TestResults.createNewTestResult({ 'id': 1, 'date': '19/11/2000', 'result': 0, 'idTestDescriptor': '19', 'rfid': '1' });

    });
    afterEach(async () => {
        await RO.deleteAllRestockOrders();
        await RO.deleteAllRestockOrderTransportNote();
        await RO.deleteAllRestockOrdersProducts();
        await RO.deleteAllRestockOrdersSKUItems();
        await SKU_ITEM.deleteAllSKUItems();
        await TestResults.deleteTestResult(1, 1);

    });
    test('get failed SKU items from an order that has at least 1', async () => {
        // it doesnt send an error
        await expect(RO.getRestockOrderFailedSKUItems(1)).resolves.toEqual([{ "RFID": "1", "skuID": 1 }]);

    })
    test('get failed SKU items from an order that has none', async () => {
        await expect(RO.getRestockOrderFailedSKUItems(2)).resolves.toEqual([]);

    })

    test("get failed SKU items from an order thatdesn't exist", async () => {
        //existance checked at higher level
        await expect(RO.getRestockOrderFailedSKUItems(5)).resolves.toEqual([]);

    })


});
