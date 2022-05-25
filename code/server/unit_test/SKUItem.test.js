const SI= require('../modules/SKUItem')

beforeAll(async()=>{
    await new Promise(process.nextTick);
    await SI.deleteAllSKUItems();
});
afterAll(async()=>{
    await new Promise(process.nextTick);
    await SI.deleteAllSKUItems();
});
describe("creating a New SKU item",()=>{
    beforeEach(async()=>{
        await SI.deleteAllSKUItems();
    });
    afterEach(async()=>{
        await SI.deleteAllSKUItems();
    });
    test("create a new SKU item", async()=>{
        await expect(SI.createNewSKUItem(12341234,1,'19/11/1999',1)).resolves.toEqual('New SKU Item inserted');
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,}]);
    });
    test("create a new SKU item with same RFID", async()=>{
        await expect(SI.createNewSKUItem(12341234,1,'19/11/1999',1)).resolves.toEqual('New SKU Item inserted');
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,}]);
        await expect(SI.createNewSKUItem(12341234,1,'19/11/1999',1)).rejects.toThrow();
    });
    test("create a new SKU item with missing parameters", async()=>{
        await expect(SI.createNewSKUItem(12341234)).rejects.toThrow(); 
    });
});
describe("get SKU items",()=>{
    beforeEach(async()=>{
        await SI.deleteAllSKUItems();
        await SI.createNewSKUItem(12341234,1,'19/11/1999',1);
        await SI.createNewSKUItem(12222222,1,'20/11/1999',1);
        await SI.createNewSKUItem(33333333,1,'21/11/1999',2);
    });
    afterEach(async()=>{
        await SI.deleteAllSKUItems();
    });
    test("get all SKU items", async()=>{
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
    });
    test("get all SKU items empty list", async()=>{
        await expect(SI.deleteAllSKUItems()).resolves.toEqual('SKU Item deleted');
        await expect(SI.getAllSKUItems()).resolves.toEqual([]);
    });
    test("get SKU items by skuID", async()=>{
        await expect(SI.getSKUItemsBySkuID(1)).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        ]);
    });
    test("get SKU items by ID of a non existin skuID", async()=>{
        await expect(SI.getSKUItemsBySkuID(10)).resolves.toEqual([]);
    });
    test("get SKU items by ID missing skuID", async()=>{
        await expect(SI.getSKUItemsBySkuID()).resolves.toEqual([]);
    });
    test("get SKU items by RFID", async()=>{
        await expect(SI.getSKUItemByRFID(12222222)).resolves.toEqual({"Available": 1, "DateOfStock": "20/11/1999", "RFID": "12222222", "SKUId": 1});
    });
    test("get SKU items by RFID wrong RFID", async()=>{
        await expect(SI.getSKUItemByRFID(1)).resolves.toEqual({"error":"SKUItem not found."});
    });

    
});

describe("delete SKU items",()=>{
    beforeEach(async()=>{
        await SI.deleteAllSKUItems();
        await SI.createNewSKUItem(12341234,1,'19/11/1999',1);
        await SI.createNewSKUItem(12222222,1,'20/11/1999',1);
        await SI.createNewSKUItem(33333333,1,'21/11/1999',2);
    });
    afterEach(async()=>{
        await SI.deleteAllSKUItems();
    });
    test("delete SKU items by RFID", async()=>{
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
        await expect(SI.deleteSKUItem(12222222)).resolves.toEqual('SKU Item deleted');
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
    });
    test("delete SKU items by RFID wrong RFID", async()=>{
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
        await expect(SI.deleteSKUItem(12)).resolves.toEqual('SKU Item deleted');
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
    });

});

describe("modify SKU items",()=>{
    beforeEach(async()=>{
        await SI.deleteAllSKUItems();
        await SI.createNewSKUItem(12341234,1,'19/11/1999',1);
        await SI.createNewSKUItem(12222222,1,'20/11/1999',1);
        await SI.createNewSKUItem(33333333,1,'21/11/1999',2);
    });
    afterEach(async()=>{
        await SI.deleteAllSKUItems();
    });
    test("modify SKU item", async()=>{
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
        await expect(SI.modifySKUItem(12222222,12222223,0,'10/10/2020',null)).resolves.toEqual('SKU Item updated');
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 0,"DateOfStock": "10/10/2020","RFID": "12222223","SKUId": 1},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
    });
    test("modify SKU item missing parameters", async()=>{
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
        await expect(SI.modifySKUItem(12222222,12222222)).resolves.toEqual('SKU Item updated');
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": null,"DateOfStock": null,"RFID": "12222222","SKUId": 1},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
    });
    test("modify SKU item missing all parameters", async()=>{
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
        await expect(SI.modifySKUItem()).resolves.toEqual('SKU Item updated');
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
    });
    test("modify SKU item nonexisting RFID", async()=>{
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
        await expect(SI.modifySKUItem(1,12222223,0,'10/10/2020',null)).resolves.toEqual('SKU Item updated');
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
    });
    test("modify SKU item to an already existing RFID", async()=>{
        await expect(SI.getAllSKUItems()).resolves.toEqual([{"Available": 1,"DateOfStock": "19/11/1999","RFID": "12341234","SKUId": 1,},
        {"Available": 1,"DateOfStock": "20/11/1999","RFID": "12222222","SKUId": 1,},
        {"Available": 1,"DateOfStock": "21/11/1999","RFID": "33333333","SKUId": 2,}
        ]);
        await expect(SI.modifySKUItem(12222222,33333333,0,'10/10/2020',null)).rejects.toThrow();
    });
});


