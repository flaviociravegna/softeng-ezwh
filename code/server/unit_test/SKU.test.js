const SKU_DAO = require("../modules/SKU");
const database = require("../modules/DB");

/************************************************************************
 Since in sqlite 3it's really rare that a query will end in an error,
most of the times the promises will resolve, so the coverage of "reject" 
 branches can be not so high
************************************************************************/

beforeAll(async () => {
    await database.createConnection();
    await new Promise(process.nextTick);
});
afterAll(async () => {
    await new Promise(process.nextTick);
});


describe("Create a new SKU", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    test("new SKU creation", async () => {
        await expect(SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10))
            .resolves.toEqual("New SKU inserted");

        // Check if they are really the ones created
        await expect(SKU_DAO.getSKUById(1)).resolves.toEqual({ "id": 1, "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "position": "800234523411", "availableQuantity": 10, "price": 10.99, "testDescriptors": [] });
    });

    test("two new SKU created", async () => {
        await expect(SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10)).resolves.toEqual("New SKU inserted");
        await expect(SKU_DAO.createNewSKU(2, "SKU 2", 20, 20, "notes 2", 20.99, "800234523412", 20)).resolves.toEqual("New SKU inserted");

        // Check if they are really the ones created
        await expect(SKU_DAO.getAllSKU()).resolves.toEqual([{ "id": 1, "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "position": "800234523411", "availableQuantity": 10, "price": 10.99, "testDescriptors": [] },
        { "id": 2, "description": "SKU 2", "weight": 20, "volume": 20, "notes": "notes 2", "position": "800234523412", "availableQuantity": 20, "price": 20.99, "testDescriptors": [] }]);
    });

    test("SKU creation error: id duplicated", async () => {
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10);
        await expect(SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10)).rejects.toThrow();
    });

    test("SKU creation error: id not integer", async () => {
        await expect(SKU_DAO.createNewSKU("id must be int", "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10)).rejects.toThrow();
    });
});

describe("Get last SKU ID", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10);
        await SKU_DAO.createNewSKU(2, "SKU 2", 20, 20, "notes 2", 20.99, "800234523412", 20);
        await SKU_DAO.createNewSKU(3, "SKU 3", 30, 30, "notes 3", 30.99, "800234523413", 30);
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    test("get last SKU ID", async () => {
        const res = await SKU_DAO.getLastSKUId();
        expect(res).toEqual(3);
    });

    test("get SKU ID when table is empty", async () => {
        await SKU_DAO.deleteAllSKUs();
        const res = await SKU_DAO.getLastSKUId();
        expect(res).toEqual(0);
    });
});

describe("Get all SKUs", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10);
        await SKU_DAO.createNewSKU(2, "SKU 2", 20, 20, "notes 2", 20.99, "800234523412", 20);
        await SKU_DAO.createNewSKU(3, "SKU 3", 30, 30, "notes 3", 30.99, "800234523413", 30);
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    testAllSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10,
        2, "SKU 2", 20, 20, "notes 2", 20.99, "800234523412", 20,
        3, "SKU 3", 30, 30, "notes 3", 30.99, "800234523413", 30);
});

describe("Get SKU by ID", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10);
        await SKU_DAO.createNewSKU(2, "SKU 2", 20, 20, "notes 2", 20.99, "800234523412", 20);
        await SKU_DAO.createNewSKU(3, "SKU 3", 30, 30, "notes 3", 30.99, "800234523413", 30);
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    testSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10);
    testSKU(2, "SKU 2", 20, 20, "notes 2", 20.99, "800234523412", 20);
    testSKU(3, "SKU 3", 30, 30, "notes 3", 30.99, "800234523413", 30);

    test("Get SKU: not found", async () => {
        const res = await SKU_DAO.getSKUById(4);
        expect(res).toEqual({ error: 'SKU not found.' });
    });
});

describe("Get SKU ID by Position", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10);
        await SKU_DAO.createNewSKU(2, "SKU 2", 20, 20, "notes 2", 20.99, "800234523412", 20);
        await SKU_DAO.createNewSKU(3, "SKU 3", 30, 30, "notes 3", 30.99, "800234523413", 30);
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    test("get SKU ID by Position", async () => {
        const res = await SKU_DAO.getSKUIdByPosition("800234523412");
        expect(res).toEqual(2);
    });
});

describe("Modify SKU (not position)", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10);
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    test("modify an SKU", async () => {
        await SKU_DAO.modifySKU(1, "new desc", 20, 20, "new notes", 20.99, 20);
        const res = await SKU_DAO.getSKUById(1);
        expect(res).toEqual({ "id": 1, "description": "new desc", "weight": 20, "volume": 20, "notes": "new notes", "position": "800234523411", "availableQuantity": 20, "price": 20.99, "testDescriptors": [] });
    });
});

describe("Modify position of an SKU", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10);
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    test("modify position of SKU", async () => {
        await SKU_DAO.addOrModifyPositionSKU(1, "800234523412");
        const res = await SKU_DAO.getSKUById(1);
        expect(res).toEqual({ "id": 1, "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "position": "800234523412", "availableQuantity": 10, "price": 10.99, "testDescriptors": [] });
    });
});

describe("Delete an SKU", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 10);
        await SKU_DAO.createNewSKU(2, "SKU 2", 20, 20, "notes 2", 20.99, "800234523412", 20);
        await SKU_DAO.createNewSKU(3, "SKU 3", 30, 30, "notes 3", 30.99, "800234523413", 30);
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    test("delete SKU", async () => {
        await SKU_DAO.deleteSKU(2);
        const res = await SKU_DAO.getSKUById(2);
        expect(res).toEqual({ error: 'SKU not found.' });
    });
});

describe("Increase SKU availableQuantity", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 1);
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    test("increase SKU.availableQuantity", async () => {
        await SKU_DAO.increaseSKUavailableQuantity(1);
        const res = await SKU_DAO.getSKUById(1);
        expect(res).toEqual({ "id": 1, "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "position": "800234523411", "availableQuantity": 2, "price": 10.99, "testDescriptors": [] });
    });
});

describe("Decrease SKU availableQuantity", () => {
    beforeEach(async () => {
        await SKU_DAO.deleteAllSKUs();
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800234523411", 3);
    });

    afterEach(async () => {
        await SKU_DAO.deleteAllSKUs();
    });

    test("decrease SKU.availableQuantity", async () => {
        await SKU_DAO.decreaseSKUavailableQuantity(1);
        const res = await SKU_DAO.getSKUById(1);
        expect(res).toEqual({ "id": 1, "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "position": "800234523411", "availableQuantity": 2, "price": 10.99, "testDescriptors": [] });
    });
});


/*********************************************************/

async function testSKU(id, description, weight, volume, notes, price, positionID, availableQuantity) {
    test('get an SKU', async () => {
        let res = await SKU_DAO.getSKUById(id);
        expect(res).toEqual({ "id": id, "description": description, "weight": weight, "volume": volume, "notes": notes, "position": positionID, "availableQuantity": availableQuantity, "price": price, "testDescriptors": [] });
    });
}

async function testAllSKU(id, description, weight, volume, notes, price, positionID, availableQuantity,
    id2, description2, weight2, volume2, notes2, price2, positionID2, availableQuantity2,
    id3, description3, weight3, volume3, notes3, price3, positionID3, availableQuantity3) {
    test('get all SKUs', async () => {
        let res = await SKU_DAO.getAllSKU();
        expect(res).toEqual([
            { "id": id, "description": description, "weight": weight, "volume": volume, "notes": notes, "position": positionID, "availableQuantity": availableQuantity, "price": price, "testDescriptors": [] },
            { "id": id2, "description": description2, "weight": weight2, "volume": volume2, "notes": notes2, "position": positionID2, "availableQuantity": availableQuantity2, "price": price2, "testDescriptors": [] },
            { "id": id3, "description": description3, "weight": weight3, "volume": volume3, "notes": notes3, "position": positionID3, "availableQuantity": availableQuantity3, "price": price3, "testDescriptors": [] }
        ]);
    });
}
