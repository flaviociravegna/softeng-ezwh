const TEST_DAO = require("../modules/testResult_db");

describe("Create new Test Result", () => {
    beforeEach(async () => {
        await TEST_DAO.deleteAllTestResults();
    });

    afterEach(async () => {
        await TEST_DAO.deleteAllTestResults();
    });

    test("Create new Test Result", async () => {
        await expect(TEST_DAO.searchMaxID()).resolves.toEqual(null);
        let testResult = { id: "1", date: "2022/20/11", result: true, idTestDescriptor: 2, rfid: "12345678901112345678123458612343"};
        await expect(TEST_DAO.createNewTestResult(testResult))
            .resolves.toEqual(null);

        // Check if it is really the one created
        await expect(TEST_DAO.getTestResultById("12345678901112345678123458612343", 1)).resolves.toEqual({ id: 1, date: "2022/20/11", result: 1, idTestDescriptor: 2, RFID: "12345678901112345678123458612343"});
    });

    test("Create new Test Result: ID DUPLICATED", async () => {
        let testResult = { id: "1", date: "2022/20/11", result: true, idTestDescriptor: 2, rfid: "12345678901112345678123458612343"};
        await expect(TEST_DAO.createNewTestResult(testResult)).resolves.toEqual(null);
        await expect(TEST_DAO.createNewTestResult(testResult)).rejects.toThrow();
    });

    test("Create new Test Result: missing parametes", async () => {
        let testResult = { date: "2022/20/11", result: true, idTestDescriptor: 2, rfid: "12345678901112345678123458612343"};
        await expect(TEST_DAO.createNewTestResult(testResult)).rejects.toThrow();
    });

});

describe("Modify Test Result", () => {
    beforeEach(async () => {
        await TEST_DAO.deleteAllTestResults();
        await TEST_DAO.createNewTestResult({ id: "1", date: "2022/20/11", result: true, idTestDescriptor: 2, rfid: "12345678901112345678123458612343"});
    });

    afterEach(async () => {
        await TEST_DAO.deleteAllTestResults();
    });

    test("Modify Test Result", async () => {
        await expect(TEST_DAO.modifyTestResult(1, 3, false, "2022/20/11")).resolves.toEqual(null);
        // Check if it is really the one modified
        await expect(TEST_DAO.getTestResultById("12345678901112345678123458612343", 1)).resolves.toEqual({ id: 1, date: "2022/20/11", result: 0, idTestDescriptor: 3, RFID: "12345678901112345678123458612343"});
    });
});

describe("Get Result", () => {
    beforeEach(async () => {
        await TEST_DAO.deleteAllTestResults();
        await TEST_DAO.createNewTestResult({ id: 1, date: "2022/20/11", result: true, idTestDescriptor: 1, rfid: "12345678901112345678123458612343"});
        await TEST_DAO.createNewTestResult({ id: 2, date: "2022/20/11", result: true, idTestDescriptor: 2, rfid: "12345678901112345678123458612343"});
    });

    afterEach(async () => {
        await TEST_DAO.deleteAllTestResults();
    });

    test("Get Test Result by RFID", async () => {
        await expect(TEST_DAO.getAllTestResultByRFID("12345678901112345678123458612343")).resolves.toEqual(
            [ { id: 1, date: "2022/20/11", result: 1, idTestDescriptor: 1, RFID: "12345678901112345678123458612343"},
              { id: 2, date: "2022/20/11", result: 1, idTestDescriptor: 2, RFID: "12345678901112345678123458612343"}     
            ]);
    });
    
    test("Get Test Result by RFID: RFID not found", async () => {
        await expect(TEST_DAO.getAllTestResultByRFID("00000000000000000000000000000")).resolves.toEqual([]);
    });

    test("Get Test Result by RFID and Id", async () => {
        await expect(TEST_DAO.getTestResultById("12345678901112345678123458612343", 1)).resolves.toEqual({ id: 1, date: "2022/20/11", result: 1, idTestDescriptor: 1, RFID: "12345678901112345678123458612343"});
    });

    test("Get Test Result by RFID and Id: RFID not found", async () => {
        await expect(TEST_DAO.getTestResultById("00000000000000000000000000000", 1)).resolves.toEqual({ error: 'Test Result not found.' });
    });
});

describe("Search Max Id", () => {
    beforeEach(async () => {
        await TEST_DAO.deleteAllTestResults();
        await TEST_DAO.createNewTestResult({ id: 1, date: "2022/20/11", result: true, idTestDescriptor: 2, rfid: "12345678901112345678123458612343"});
    });

    afterEach(async () => {
        await TEST_DAO.deleteAllTestResults();
    });

    test("Get max Id of the table", async () => {
        await expect(TEST_DAO.searchMaxID()).resolves.toEqual(1);
    });
});

describe("Delete Test Result", () => {
    beforeEach(async () => {
        await TEST_DAO.deleteAllTestResults();
        await TEST_DAO.createNewTestResult({ id: 1, date: "2022/20/11", result: true, idTestDescriptor: 2, rfid: "12345678901112345678123458612343"});
    });

    afterEach(async () => {
        await TEST_DAO.deleteAllTestResults();
    });

    test("Delete test result by rfid and id", async () => {
        await expect(TEST_DAO.deleteTestResult("12345678901112345678123458612343", 1)).resolves.toEqual(null);
    });

    test("Delete all test", async () => {
        await expect(TEST_DAO.deleteAllTestResults()).resolves.toEqual(null);
    });
});