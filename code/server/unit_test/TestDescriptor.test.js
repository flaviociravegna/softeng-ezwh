const TD = require('../modules/TestDescriptor')

beforeAll(async()=>{
    await new Promise(process.nextTick);
    await TD.deleteAllTestDescriptors();

});
afterAll(async()=>{
    await new Promise(process.nextTick);
    await TD.deleteAllTestDescriptors();
});

describe("Create new test descriptor",()=>{
    beforeEach(async()=>{
        await TD.deleteAllTestDescriptors();
    });
    afterEach(async()=>{
        await TD.deleteAllTestDescriptors();
    });

    test('Create new test descriptor',async()=>{
        await expect(TD.createNewTestDescriptor(1,'name','a description', 1)).resolves.toEqual('New SKU Item inserted');
        await expect(TD.getAllTestDescriptors()).resolves.not.toEqual([]);
    });
    test('Create new test descriptor result check',async()=>{
        await expect(TD.createNewTestDescriptor(1,'name','a description', 1)).resolves.toEqual('New SKU Item inserted');
        await expect(TD.getAllTestDescriptors()).resolves.toEqual([{"id": 1, "idSKU": 1, "name": "name", "procedureDescription": "a description"}]);
        await expect(TD.getTestDescriptorById(1)).resolves.toEqual({"id": 1, "idSKU": 1, "name": "name", "procedureDescription": "a description"});
    });
    test('Create new test descriptor with same ID',async()=>{
        await expect(TD.createNewTestDescriptor(1,'name','a description', 1)).resolves.toEqual('New SKU Item inserted');
        await expect(TD.createNewTestDescriptor(1,'name','a description', 2)).rejects.toThrow();

    });
    test('Create new test descriptor with same on the same SKU',async()=>{
        await expect(TD.createNewTestDescriptor(1,'name','a description', 1)).resolves.toEqual('New SKU Item inserted');
        await expect(TD.createNewTestDescriptor(2,'name','a description', 1)).resolves.toEqual('New SKU Item inserted');
        await expect(TD.getAllTestDescriptors()).resolves.toEqual([{"id": 1, "idSKU": 1, "name": "name", "procedureDescription": "a description"},{"id": 2, "idSKU": 1, "name": "name", "procedureDescription": "a description"}]);
    });
    test('Create new test descriptor with missing paramaters',async()=>{
        await expect(TD.createNewTestDescriptor(1,'name','a description')).resolves.toEqual('New SKU Item inserted');
        await expect(TD.getAllTestDescriptors()).resolves.toEqual([{"id": 1, "idSKU": null, "name": "name" , "procedureDescription": "a description"}]);
    });
    test('Create new test descriptor with a wrong ID',async()=>{
        await expect(TD.createNewTestDescriptor('a','name','a description',1)).rejects.toThrow();
    });

});

describe("Get last test descriptor",()=>{
    beforeEach(async()=>{
        await TD.deleteAllTestDescriptors();
    });
    afterEach(async()=>{
        await TD.deleteAllTestDescriptors();
    });

    test('Get last testDescriptor ID, empty list',async()=>{
        await expect(TD.getLastTestDescriptorsId()).resolves.toEqual(0);
    });
    
    test('Get last testDescriptor ID with non empty list',async()=>{
        await expect(TD.createNewTestDescriptor(1,'name','a description', 1)).resolves.toEqual('New SKU Item inserted');
        await expect(TD.getLastTestDescriptorsId()).resolves.toEqual(1);
    });
    test('Get last testDescriptor ID with non empty list 2 elements',async()=>{
        await expect(TD.createNewTestDescriptor(1,'name','a description', 1)).resolves.toEqual('New SKU Item inserted');
        await expect(TD.createNewTestDescriptor(22,'name','another description', 1)).resolves.toEqual('New SKU Item inserted');
        await expect(TD.getLastTestDescriptorsId()).resolves.toEqual(22);
    });
});

describe("Get all test descriptors",()=>{
    beforeEach(async()=>{
        await TD.deleteAllTestDescriptors();
        await TD.createNewTestDescriptor(1,'name','a description', 1);
        await TD.createNewTestDescriptor(2,'name2','another description', 1);
    });
    afterEach(async()=>{
        await TD.deleteAllTestDescriptors();
    });

    test('get all test descriptors non empty list',async()=>{
        await expect(TD.getAllTestDescriptors()).resolves.toEqual([
            {
                "id": 1,
                "idSKU": 1,
                "name": "name",
                "procedureDescription": "a description",
            },
            {
                "id": 2,
                "idSKU": 1,
                "name": "name2",
                "procedureDescription": "another description",
            }]);
    });
    test('get all test descriptors empty list',async()=>{
        await expect(TD.deleteAllTestDescriptors()).resolves.toEqual('Test Descriptors deleted');
        await expect(TD.getAllTestDescriptors()).resolves.toEqual([]);
    });
   
});

describe("Get test descriptor ID by SKUId",()=>{
    beforeEach(async()=>{
        await TD.deleteAllTestDescriptors();
        await TD.createNewTestDescriptor(1,'name','a description', 1);
        await TD.createNewTestDescriptor(2,'name2','another description', 1);
        await TD.createNewTestDescriptor(3,'name3',' yet another description', 2);
    });
    afterEach(async()=>{
        await TD.deleteAllTestDescriptors();
    });

    test('get all test descriptors ID non empty list',async()=>{

        await expect(TD.getTestDescriptorsIdBySKUId(1)).resolves.toEqual([1,2]);
        await expect(TD.getTestDescriptorsIdBySKUId(2)).resolves.toEqual([3]);
    });
   
    test('get all test descriptors ID non existing SkuID',async()=>{

        await expect(TD.getTestDescriptorsIdBySKUId(100)).resolves.toEqual([]);
        
    });
    test('get all test descriptors ID wrong format SkuID',async()=>{

        await expect(TD.getTestDescriptorsIdBySKUId('a')).resolves.toEqual([]);
        
    });
    test('get all test descriptors ID missing SkuID',async()=>{

        await expect(TD.getTestDescriptorsIdBySKUId()).resolves.toEqual([]);
        
    });
    test('get all test descriptors ID empty list',async()=>{

        await expect(TD.getTestDescriptorsIdBySKUId(1)).resolves.toEqual([1,2]);
        await expect(TD.deleteAllTestDescriptors()).resolves.not.toEqual();
        await expect(TD.getTestDescriptorsIdBySKUId(1)).resolves.toEqual([]);
        
    });

});

describe("delete test descriptor by ID",()=>{
    beforeEach(async()=>{
        await TD.deleteAllTestDescriptors();
        await TD.createNewTestDescriptor(1,'name','a description', 1);
        await TD.createNewTestDescriptor(2,'name2','another description', 1);
        await TD.createNewTestDescriptor(3,'name3',' yet another description', 2);
    });
    afterEach(async()=>{
        await TD.deleteAllTestDescriptors();
    });

    test("delete a test descriptor", async()=>{

        await expect(TD.getAllTestDescriptors()).resolves.toEqual([
                {
                    "id": 1,
                    "idSKU": 1,
                    "name": "name",
                    "procedureDescription": "a description",
                },
                {
                    "id": 2,
                    "idSKU": 1,
                    "name": "name2",
                    "procedureDescription": "another description",
                },
                {
                    "id": 3,
                    "idSKU": 2,
                    "name": "name3",
                    "procedureDescription": " yet another description",
            }]);
        await expect(TD.deleteTestDescriptor(1)).resolves.toEqual('Test Descriptor deleted');
        await expect(TD.getAllTestDescriptors()).resolves.toEqual([
            {
                "id": 2,
                "idSKU": 1,
                "name": "name2",
                "procedureDescription": "another description",
            },
            {
                "id": 3,
                "idSKU": 2,
                "name": "name3",
                "procedureDescription": " yet another description",
            }]);
    
    });

    test("delete a non existing test descriptor", async()=>{

        await expect(TD.getAllTestDescriptors()).resolves.toEqual([
                {
                    "id": 1,
                    "idSKU": 1,
                    "name": "name",
                    "procedureDescription": "a description",
                },
                {
                    "id": 2,
                    "idSKU": 1,
                    "name": "name2",
                    "procedureDescription": "another description",
                },
                {
                    "id": 3,
                    "idSKU": 2,
                    "name": "name3",
                    "procedureDescription": " yet another description",
            }]);
        await expect(TD.deleteTestDescriptor(4)).resolves.toEqual('Test Descriptor deleted');
        await expect(TD.getAllTestDescriptors()).resolves.toEqual([
            {
                "id": 1,
                "idSKU": 1,
                "name": "name",
                "procedureDescription": "a description",
            },{
                "id": 2,
                "idSKU": 1,
                "name": "name2",
                "procedureDescription": "another description",
            },
            {
                "id": 3,
                "idSKU": 2,
                "name": "name3",
                "procedureDescription": " yet another description",
            }]);
    
    });

});

describe("Modify a test descriptor",()=>{
    beforeEach(async()=>{
        await TD.deleteAllTestDescriptors();
        await TD.createNewTestDescriptor(1,'name','a description', 1);
        await TD.createNewTestDescriptor(2,'name2','another description', 1);
        await TD.createNewTestDescriptor(3,'name3',' yet another description', 2);
    });
    afterEach(async()=>{
        await TD.deleteAllTestDescriptors();
    });

    test("Modify a test descriptor", async()=>{

        await expect(TD.getTestDescriptorById(1)).resolves.toEqual(
                {
                    "id": 1,
                    "idSKU": 1,
                    "name": "name",
                    "procedureDescription": "a description",
                }
                );
        await expect(TD.modifyTestDescriptor(1,"newName","newDescription",4)).resolves.toEqual('Test Descriptor updated');
        await expect(TD.getTestDescriptorById(1)).resolves.toEqual(
            {
                "id": 1,
                "idSKU": 4,
                "name": "newName",
                "procedureDescription": "newDescription",
            }
            );
    });
    test("Modify a test descriptor missing parameter", async()=>{

        await expect(TD.getTestDescriptorById(1)).resolves.toEqual(
                {
                    "id": 1,
                    "idSKU": 1,
                    "name": "name",
                    "procedureDescription": "a description",
                }
                );
        await expect(TD.modifyTestDescriptor(1,"newName","newDescription")).resolves.toEqual('Test Descriptor updated');
        await expect(TD.getTestDescriptorById(1)).resolves.toEqual(
            {
                "id": 1,
                "idSKU": null,
                "name": "newName",
                "procedureDescription": "newDescription",
            }
            );
    });
    test("Modify a test descriptor non existing id", async()=>{

        await expect(TD.getTestDescriptorById(1)).resolves.toEqual(
                {
                    "id": 1,
                    "idSKU": 1,
                    "name": "name",
                    "procedureDescription": "a description",
                }
                );
        await expect(TD.modifyTestDescriptor(100,"newName","newDescription",4)).resolves.toEqual('Test Descriptor updated');
        
    });

   

});