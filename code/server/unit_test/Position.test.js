const Position_DAO = require("../modules/position_db");
const SKU_DAO = require("../modules/SKU");
const database = require("../modules/DB");

beforeAll(async () => {
    await database.createConnection();
});

describe("Create Positions", () => {
    beforeEach(async () => {
        await Position_DAO.deleteAllPositions();
    });

    afterEach(async () => {
        await Position_DAO.deleteAllPositions();
    });

    test("Create new Position, then get by Id", async () => {
        let position = { positionID: "800090007000", aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 };
        await expect(Position_DAO.createNewPosition(position))
            .resolves.toEqual(null);

        // Check if they are really the ones created
        await expect(Position_DAO.getPositionById("800090007000")).resolves.toEqual(position);
    });

    test("Create more than 1 new Positions, then get All", async () => {
        let position1 = { positionID: "800090007000", aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 };
        let position2 = { positionID: "500090007000", aisle: "5000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 };
        await expect(Position_DAO.createNewPosition(position1)).resolves.toEqual(null);
        await expect(Position_DAO.createNewPosition(position2)).resolves.toEqual(null);

        // Check if they are really the ones created
        await expect(Position_DAO.getAllPositions()).resolves.toEqual([position1, position2]);
    });

    test("Position creation error: PositionId duplicated", async () => {
        let position = { positionID: "800090007000", aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 };
        await Position_DAO.createNewPosition(position);
        await expect(Position_DAO.createNewPosition(position)).rejects.toThrow();
    });

    test("Position creation error: null positionID", async () => {
        let position = { aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 };
        await expect(Position_DAO.createNewPosition(position)).rejects.toThrow();
    });

});

describe("Get Position by Id", () => {
    beforeEach(async () => {
        await Position_DAO.deleteAllPositions();
        await Position_DAO.createNewPosition({ positionID: "800090007000", aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
        await Position_DAO.createNewPosition({ positionID: "500090007000", aisle: "5000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
    });

    afterEach(async () => {
        await Position_DAO.deleteAllPositions();
    });

    test("Get position", async () => {
        await expect(Position_DAO.getPositionById("800090007000")).resolves.toEqual({ positionID: "800090007000", aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
    });

    test("Get position: position not found", async () => {
        await expect(Position_DAO.getPositionById("300090007000")).resolves.toEqual({ error: 'Position not found.' });
    });
});

describe("Modify Position", () => {
    beforeEach(async () => {
        await Position_DAO.deleteAllPositions();
        await Position_DAO.createNewPosition({ positionID: "800090007000", aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
        await Position_DAO.createNewPosition({ positionID: "500090007000", aisle: "5000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
    });

    afterEach(async () => {
        await Position_DAO.deleteAllPositions();
    });

    test("Modify position", async () => {
        await expect(Position_DAO.modifyPosition("800090007000", "7000", "5000", "3000", 100, 100, 0, 0)).resolves.toEqual(null);

        // Check if it is really updated
        await expect(Position_DAO.getPositionById("700050003000")).resolves.toEqual({ positionID: "700050003000", aisle: "7000", row: "5000", col: "3000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
    });

    test("Modify position: positionID duplicated", async () => {
        await expect(Position_DAO.modifyPosition("800090007000", "5000", "9000", "7000", 100, 100, 0, 0)).rejects.toThrow();
    });

    test("Modify position ID", async () => {
        await expect(Position_DAO.modifyPositionID("800090007000", "700050003000")).resolves.toEqual(null);
        // Check if it is really updated
        await expect(Position_DAO.getPositionById("700050003000")).resolves.toEqual({ positionID: "700050003000", aisle: "7000", row: "5000", col: "3000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
    });

    test("Modify position: positionID duplicated", async () => {
        await expect(Position_DAO.modifyPositionID("800090007000", "500090007000")).rejects.toThrow();
    });
});

describe("Search Position in SKU", () => {
    beforeEach(async () => {
        await Position_DAO.deleteAllPositions();
        await SKU_DAO.deleteAllSKUs();
        await Position_DAO.createNewPosition({ positionID: "800090007000", aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
        await Position_DAO.createNewPosition({ positionID: "500090007000", aisle: "5000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
        await SKU_DAO.createNewSKU(1, "SKU 1", 10, 10, "notes 1", 10.99, "800090007000", 10);
    });

    afterEach(async () => {
        await Position_DAO.deleteAllPositions();
        await SKU_DAO.deleteAllSKUs();
    });

    test("Search Position: position not empty", async () => {
        await expect(Position_DAO.searchPosition("800090007000")).resolves.toEqual([{ "id": 1, "description": "SKU 1", "weight": 10, "volume": 10, "notes": "notes 1", "positionID": "800090007000", "availableQuantity": 10, "price": 10.99 }]);
    });

    test("Search Position: position empty", async () => {
        await expect(Position_DAO.searchPosition("500090007000")).resolves.toEqual([]);
    });
});

describe("Delete Position by Id", () => {
    beforeEach(async () => {
        await Position_DAO.deleteAllPositions();
        await Position_DAO.createNewPosition({ positionID: "800090007000", aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
    });

    afterEach(async () => {
        await Position_DAO.deleteAllPositions();
    });

    test("Delete Position by Id", async () => {
        await expect(Position_DAO.deletePosition("800090007000")).resolves.toEqual(null);
    });

});

describe("Update Position", () => {
    beforeEach(async () => {
        await Position_DAO.deleteAllPositions();
        await Position_DAO.createNewPosition({ positionID: "800090007000", aisle: "8000", row: "9000", col: "7000", maxWeight: 100, maxVolume: 100, occupiedWeight: 0, occupiedVolume: 0 });
    });

    afterEach(async () => {
        await Position_DAO.deleteAllPositions();
    });

    test("Update Position by Id", async () => {
        await expect(Position_DAO.updatePositionWeightAndVolume("800090007000", 10, 10)).resolves.toEqual(null);
    });

    test("Update Position by Id: position not found", async () => {
        await expect(Position_DAO.updatePositionWeightAndVolume("8", 10, 10)).resolves.toEqual(null);
    });

});