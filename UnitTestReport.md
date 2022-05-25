# Unit Testing Report

Date:

Version:

# Contents

- [Black Box Unit Tests](#black-box-unit-tests)




- [White Box Unit Tests](#white-box-unit-tests)


# Black Box Unit Tests

    <Define here criteria, predicates and the combination of predicates for each function of each class.
    Define test cases to cover all equivalence classes and boundary conditions.
    In the table, report the description of the black box test case and (traceability) the correspondence with the Jest test case writing the 
    class and method name that contains the test case>
    <Jest tests  must be in code/server/unit_test  >

 ### **Class *class_name* - method *name***



**Criteria for method *name*:**
	

 - 
 - 





**Predicates for method *name*:**

| Criteria | Predicate |
| -------- | --------- |
|          |           |
|          |           |
|          |           |
|          |           |





**Boundaries**:

| Criteria | Boundary values |
| -------- | --------------- |
|          |                 |
|          |                 |



**Combination of predicates**:


| Criteria 1 | Criteria 2 | ... | Valid / Invalid | Description of the test case | Jest test case |
|-------|-------|-------|-------|-------|-------|
|||||||
|||||||
|||||||
|||||||
|||||||




# White Box Unit Tests

### Test cases definition
    
    
    <Report here all the created Jest test cases, and the units/classes under test >
    <For traceability write the class and method name that contains the test case>


| Unit name | Jest test case |
|--|--|
| User | User.test.js &emsp; --> &emsp; Create new User, then get by Id |
| User | User.test.js &emsp; --> &emsp; Create new User: duplicated id  |
| User | User.test.js &emsp; --> &emsp; Create new User: missing values |
| User | User.test.js &emsp; --> &emsp; Login: correct username and password |
| User | User.test.js &emsp; --> &emsp; Login: incorrect username |
| User | User.test.js &emsp; --> &emsp; Login: incorrect password |
| User | User.test.js &emsp; --> &emsp; Get User By: Id |
| User | User.test.js &emsp; --> &emsp; Get User: user not found |
| User | User.test.js &emsp; --> &emsp; Get User By: Username and type |
| User | User.test.js &emsp; --> &emsp; Get User By: Username and type not found |
| User | User.test.js &emsp; --> &emsp; Get User By: supplier id |
| User | User.test.js &emsp; --> &emsp; Get User By: supplier id not found |
| User | User.test.js &emsp; --> &emsp; Get Users except managers |
| User | User.test.js &emsp; --> &emsp; Get All suppliers |
| User | User.test.js &emsp; --> &emsp; Get max Id of the table|
| User | User.test.js &emsp; --> &emsp; Delete user by username and type |
| User | User.test.js &emsp; --> &emsp; Delete user created for test purpose |
| User | User.test.js &emsp; --> &emsp; Modify user rights |
| Test Result | Test Result &emsp; --> &emsp; Create new Test Result |
| Test Result | Test Result &emsp; --> &emsp; Create new Test Result: ID DUPLICATED |
| Test Result | Test Result &emsp; --> &emsp; Create new Test Result: missing parametes |
| Test Result | Test Result &emsp; --> &emsp; Modify Test Result |
| Test Result | Test Result &emsp; --> &emsp; Get Test Result by RFID |
| Test Result | Test Result &emsp; --> &emsp; Get Test Result by RFID: RFID not found |
| Test Result | Test Result &emsp; --> &emsp; Get Test Result by RFID and Id |
| Test Result | Test Result &emsp; --> &emsp; Get Test Result by RFID and Id: RFID not found |
| Test Result | Test Result &emsp; --> &emsp; Get max Id of the table |
| Test Result | Test Result &emsp; --> &emsp; Delete test result by rfid and id |
| Test Result | Test Result &emsp; --> &emsp; Delete all test |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Create new test descriptor |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Create new test descriptor result check |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Create new test descriptor with same ID |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Create new test descriptor with same on the same SKU |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Create new test descriptor with missing paramaters |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Create new test descriptor with a wrong ID |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Get last testDescriptor ID, empty list |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Get last testDescriptor ID with non empty list |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Get last testDescriptor ID with non empty list 2 elements |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; get all test descriptors non empty list |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; get all test descriptors empty list |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; get all test descriptors ID non empty list |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; get all test descriptors ID non existing SkuID |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; get all test descriptors ID wrong format SkuID |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; get all test descriptors ID missing SkuID |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; get all test descriptors ID empty list |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; delete a test descriptor |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; delete a non existing test descriptor |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Modify a test descriptor |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Modify a test descriptor missing parameter |
| Test Descriptor | TestDescriptor.test.js &emsp; --> &emsp; Modify a test descriptor non existing id |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; create a new SKU item |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; create a new SKU item with same RFID |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; create a new SKU item with missing parameters |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; get all SKU items |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; get all SKU items empty list |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; get SKU items by skuID |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; get SKU items by ID of a non existin skuID |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; get SKU items by ID missing skuID |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; get SKU items by RFID |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; get SKU items by RFID wrong RFID |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; delete SKU items by RFID |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; delete SKU items by RFID wrong RFID |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; modify SKU item |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; modify SKU item missing parameters |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; modify SKU item missing all parameters |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; modify SKU item nonexisting RFID |
| SKU Item | SKUItem.test.js &emsp; --> &emsp; modify SKU item to an already existing RFID |
| SKU | SKU.test.js &emsp; --> &emsp; new SKU creation |
| SKU | SKU.test.js &emsp; --> &emsp; two new SKU created |
| SKU | SKU.test.js &emsp; --> &emsp; SKU creation error: id duplicated |
| SKU | SKU.test.js &emsp; --> &emsp; SKU creation error: id not integer |
| SKU | SKU.test.js &emsp; --> &emsp; get last SKU ID |
| SKU | SKU.test.js &emsp; --> &emsp; get SKU ID when table is empty |
| SKU | SKU.test.js &emsp; --> &emsp; Get all SKUs |
| SKU | SKU.test.js &emsp; --> &emsp; Get SKU by ID |
| SKU | SKU.test.js &emsp; --> &emsp; Get SKU: not found |
| SKU | SKU.test.js &emsp; --> &emsp; get SKU ID by Position |
| SKU | SKU.test.js &emsp; --> &emsp; modify an SKU |
| SKU | SKU.test.js &emsp; --> &emsp; modify position of SKU |
| SKU | SKU.test.js &emsp; --> &emsp; delete SKU |
| SKU | SKU.test.js &emsp; --> &emsp; increase SKU.availableQuantity |
| SKU | SKU.test.js &emsp; --> &emsp; decrease SKU.availableQuantity |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; no return orders in the list |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; Create a new return Order |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; Create 2 new return Order |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; Fail creating a 2nd return Order, same ID |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; Fail creating a return Order, invalid ID |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; retrive last ReturnOrderID with non empty table |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; retrive last ReturnOrderID with empty table |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; get each Return Order by its ID |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; get AllReturn Orders |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; fail to retrive a non existing order |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; get return order products |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; get return order products when there are none |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; fail to insert a repeated product |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; insert a product |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; delete a return order products |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; delete a return Order |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; delete a return Order that doesnt exist |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; delete a return Order products |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; delete a return Order products of an empty order |
| Return Order | ReturnOrder.test.js &emsp; --> &emsp; delete a return Order products of a non existing order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; No Restock Order in the List |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Create new RestockOreders |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Create 2 restock orders |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Insert a restock Order With the same Id |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; fail to get a non existing Order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get last restock Order ID |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get last restock Order ID when list empty |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get last restock Order ID when list lost an element |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Insert a new product |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Insert 2 new products |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Fail to insert 2nd product |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get SKU by ID |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get SKU by ID when theres no product |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get SKU by ID when theres a wrong SKUID |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get SKU by ID when theres a wrong OrderID |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get SKU by ID when theres a wrong  type OrderID |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get SKU by ID when theres a wrong  type SKUID |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; delete a restockOrder |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; try to delete a restockOrder that doesnt exist |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Fail to get RFID when no Item in restock Order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Insert SKUItems to restockOrder |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Insert 2 SKUItems to restockOrder |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Insert 2 times the same SKUItem |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Add transport note |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Add transport note empty |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get transport note of a Restock Order that doesn't have one |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Modify Restock Order State to DELIVERED |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Modify Restock Order State to ISSUED |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Modify Restock Order State of a non existing order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get all ISSUED restock Orders |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get all ISSUED restock Orders when there are none |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get last Product Id in Restock Order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get last item ID from an order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get last item ID from empty order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get last item ID from nonexisting order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete a product from an order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete a product from an empty order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete a product from a non existing order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete a TransportNote from an order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete a TransportNote from an empty order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete a TransportNote from a non existing order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete SKUItems from an order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete SKUItems from an empty order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete SKUItems from a non existing order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete a SKUItem from an order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete a SKUItem from an empty order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; Delete a SKUItem from a non existing order |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get failed SKU items from an order that has at least 1 |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get failed SKU items from an order that has none |
| Restock Order | RestockOrder.test.js &emsp; --> &emsp; get failed SKU items from an order thatdesn't exist |
| Position | Position.test.js &emsp; --> &emsp; Create new Position, then get by Id |
| Position | Position.test.js &emsp; --> &emsp; Create more than 1 new Positions, then get All |
| Position | Position.test.js &emsp; --> &emsp; Position creation error: PositionId duplicated |
| Position | Position.test.js &emsp; --> &emsp; Position creation error: null positionID |
| Position | Position.test.js &emsp; --> &emsp; Get position |
| Position | Position.test.js &emsp; --> &emsp; Get position: position not found |
| Position | Position.test.js &emsp; --> &emsp; Modify position |
| Position | Position.test.js &emsp; --> &emsp; Modify position: positionID duplicated |
| Position | Position.test.js &emsp; --> &emsp; Modify position ID |
| Position | Position.test.js &emsp; --> &emsp; Modify position: positionID duplicated |
| Position | Position.test.js &emsp; --> &emsp; Search Position: position not empty |
| Position | Position.test.js &emsp; --> &emsp; Search Position: position empty |
| Position | Position.test.js &emsp; --> &emsp; Delete Position by Id |
| Position | Position.test.js &emsp; --> &emsp; Update Position by Id |
| Position | Position.test.js &emsp; --> &emsp; Update Position by Id: position not found |
| Item | Item.test.js &emsp; --> &emsp; get all Items with an empty list |
| Item | Item.test.js &emsp; --> &emsp; new Item creation |
| Item | Item.test.js &emsp; --> &emsp; two new Item created |
| Item | Item.test.js &emsp; --> &emsp; Item creation error: id duplicated |
| Item | Item.test.js &emsp; --> &emsp; Get all Items |
| Item | Item.test.js &emsp; --> &emsp; Get SKU by ID |
| Item | Item.test.js &emsp; --> &emsp; Get Item: not found |
| Item | Item.test.js &emsp; --> &emsp; modify an Item |
| Item | Item.test.js &emsp; --> &emsp; delete Item |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get all InternalOrders with an empty list |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Create a new Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Check newly created Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Check 2 newly created Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Check  creating a repeated Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get a non existing Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get last ID from empty list |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get last ID |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get last ID of multiple element list |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get by state 'ISSUED' |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get by state 'MOCKSTATE' |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get by state 'NOTASTATE' |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get by state empty list |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Modify Internal order State |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Modify Internal order customer Id |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Modify non existing Internal order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Modify Internal order missing arguments |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Delete Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Delete not existing Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Add a product to an internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get all products in internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get all products in internal Orders empty list |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Products from an Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Products from a non existing Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Products from an empty Internal Order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Delete InternalOrder Products |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; Delete InternalOrder Products of empty order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get Internal Orders SKUs |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get Internal Order Skus when Empty list |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get Internal Order Skus by Internal Order ID |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; modify Internal Order SKUItems |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; modify Internal Order Skus ID |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; modify Internal Order Skus ID of a repeated RFID |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; delete Internal Order Skus |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; delete Internal Order Skus of an empty order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; delete Internal Order Skus of an non existing order |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get Internal Order Product By skuID |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get Product by SKUID |
| Internal Order | InternalOrder.test.js &emsp; --> &emsp; get Product by SKUID of non existing SKU |


### Code coverage report

    ![](./Images/screenshot_coverage_unit_tests.PNG)


### Loop coverage analysis

    No significan loops were used in the Units.