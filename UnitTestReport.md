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
| User | Create new User, then get by Id |
| User | Create new User: duplicated id  |
| User | Create new User: missing values |
| User | Login: correct username and password |
| User | Login: incorrect username |
| User | Login: incorrect password |
| User | Get User By: Id |
| User | Get User: user not found |
| User | Get User By: Username and type |
| User | Get User By: Username and type not found |
| User | Get User By: supplier id |
| User | Get User By: supplier id not found |
| User | Get Users except managers |
| User | Get All suppliers |
| User | Get max Id of the table|
| User | Delete user by username and type |
| User | Delete user created for test purpose |
| User | Modify user rights |
| Test Result | Create new Test Result |
| Test Result | Create new Test Result: ID DUPLICATED |
| Test Result | Create new Test Result: missing parametes |
| Test Result | Modify Test Result |
| Test Result | Get Test Result by RFID |
| Test Result | Get Test Result by RFID: RFID not found |
| Test Result | Get Test Result by RFID and Id |
| Test Result | Get Test Result by RFID and Id: RFID not found |
| Test Result | Get max Id of the table |
| Test Result | Delete test result by rfid and id |
| Test Result | Delete all test |
| Test Descriptor | Create new test descriptor |
| Test Descriptor | Create new test descriptor result check |
| Test Descriptor | Create new test descriptor with same ID |
| Test Descriptor | Create new test descriptor with same on the same SKU |
| Test Descriptor | Create new test descriptor with missing paramaters |
| Test Descriptor | Create new test descriptor with a wrong ID |
| Test Descriptor | Get last testDescriptor ID, empty list |
| Test Descriptor | Get last testDescriptor ID with non empty list |
| Test Descriptor | Get last testDescriptor ID with non empty list 2 elements |
| Test Descriptor | get all test descriptors non empty list |
| Test Descriptor | get all test descriptors empty list |
| Test Descriptor | get all test descriptors ID non empty list |
| Test Descriptor | get all test descriptors ID non existing SkuID |
| Test Descriptor | get all test descriptors ID wrong format SkuID |
| Test Descriptor | get all test descriptors ID missing SkuID |
| Test Descriptor | get all test descriptors ID empty list |
| Test Descriptor | delete a test descriptor |
| Test Descriptor | delete a non existing test descriptor |
| Test Descriptor | Modify a test descriptor |
| Test Descriptor | Modify a test descriptor missing parameter |
| Test Descriptor | Modify a test descriptor non existing id |
| SKU Item | create a new SKU item |
| SKU Item | create a new SKU item with same RFID |
| SKU Item | create a new SKU item with missing parameters |
| SKU Item | get all SKU items |
| SKU Item | get all SKU items empty list |
| SKU Item | get SKU items by skuID |
| SKU Item | get SKU items by ID of a non existin skuID |
| SKU Item | get SKU items by ID missing skuID |
| SKU Item | get SKU items by RFID |
| SKU Item | get SKU items by RFID wrong RFID |
| SKU Item | delete SKU items by RFID |
| SKU Item | delete SKU items by RFID wrong RFID |
| SKU Item | modify SKU item |
| SKU Item | modify SKU item missing parameters |
| SKU Item | modify SKU item missing all parameters |
| SKU Item | modify SKU item nonexisting RFID |
| SKU Item | modify SKU item to an already existing RFID |
| SKU | new SKU creation |
| SKU | two new SKU created |
| SKU | SKU creation error: id duplicated |
| SKU | SKU creation error: id not integer |
| SKU | get last SKU ID |
| SKU | get SKU ID when table is empty |
| SKU | Get all SKUs |
| SKU | Get SKU by ID |
| SKU | Get SKU: not found |
| SKU | get SKU ID by Position |
| SKU | modify an SKU |
| SKU | modify position of SKU |
| SKU | delete SKU |
| SKU | increase SKU.availableQuantity |
| SKU | decrease SKU.availableQuantity |
| Return Order | no return orders in the list |
| Return Order | Create a new return Order |
| Return Order | Create 2 new return Order |
| Return Order | Fail creating a 2nd return Order, same ID |
| Return Order | Fail creating a return Order, invalid ID |
| Return Order | retrive last ReturnOrderID with non empty table |
| Return Order | retrive last ReturnOrderID with empty table |
| Return Order | get each Return Order by its ID |
| Return Order | get AllReturn Orders |
| Return Order | fail to retrive a non existing order |
| Return Order | get return order products |
| Return Order | get return order products when there are none |
| Return Order | fail to insert a repeated product |
| Return Order | insert a product |
| Return Order | delete a return order products |
| Return Order | delete a return Order |
| Return Order | delete a return Order that doesnt exist |
| Return Order | delete a return Order products |
| Return Order | delete a return Order products of an empty order |
| Return Order | delete a return Order products of a non existing order |
| Restock Order | No Restock Order in the List |
| Restock Order | Create new RestockOreders |
| Restock Order | Create 2 restock orders |
| Restock Order | Insert a restock Order With the same Id |
| Restock Order | fail to get a non existing Order |
| Restock Order | get last restock Order ID |
| Restock Order | get last restock Order ID when list empty |
| Restock Order | get last restock Order ID when list lost an element |
| Restock Order | Insert a new product |
| Restock Order | Insert 2 new products |
| Restock Order | Fail to insert 2nd product |
| Restock Order | get SKU by ID |
| Restock Order | get SKU by ID when theres no product |
| Restock Order | get SKU by ID when theres a wrong SKUID |
| Restock Order | get SKU by ID when theres a wrong OrderID |
| Restock Order | get SKU by ID when theres a wrong  type OrderID |
| Restock Order | get SKU by ID when theres a wrong  type SKUID |
| Restock Order | delete a restockOrder |
| Restock Order | try to delete a restockOrder that doesnt exist |
| Restock Order | Fail to get RFID when no Item in restock Order |
| Restock Order | Insert SKUItems to restockOrder |
| Restock Order | Insert 2 SKUItems to restockOrder |
| Restock Order | Insert 2 times the same SKUItem |
| Restock Order | Add transport note |
| Restock Order | Add transport note empty |
| Restock Order | get transport note of a Restock Order that doesn't have one |
| Restock Order | Modify Restock Order State to DELIVERED |
| Restock Order | Modify Restock Order State to ISSUED |
| Restock Order | Modify Restock Order State of a non existing order |
| Restock Order | get all ISSUED restock Orders |
| Restock Order | get all ISSUED restock Orders when there are none |
| Restock Order | get last Product Id in Restock Order |
| Restock Order | get last item ID from an order |
| Restock Order | get last item ID from empty order |
| Restock Order | get last item ID from nonexisting order |
| Restock Order | Delete a product from an order |
| Restock Order | Delete a product from an empty order |
| Restock Order | Delete a product from a non existing order |
| Restock Order | Delete a TransportNote from an order |
| Restock Order | Delete a TransportNote from an empty order |
| Restock Order | Delete a TransportNote from a non existing order |
| Restock Order | Delete SKUItems from an order |
| Restock Order | Delete SKUItems from an empty order |
| Restock Order | Delete SKUItems from a non existing order |
| Restock Order | Delete a SKUItem from an order |
| Restock Order | Delete a SKUItem from an empty order |
| Restock Order | Delete a SKUItem from a non existing order |
| Restock Order | get failed SKU items from an order that has at least 1 |
| Restock Order | get failed SKU items from an order that has none |
| Restock Order | get failed SKU items from an order thatdesn't exist |
| Position | Create new Position, then get by Id |
| Position | Create more than 1 new Positions, then get All |
| Position | Position creation error: PositionId duplicated |
| Position | Position creation error: null positionID |
| Position | Get position |
| Position | Get position: position not found |
| Position | Modify position |
| Position | Modify position: positionID duplicated |
| Position | Modify position ID |
| Position | Modify position: positionID duplicated |
| Position | Search Position: position not empty |
| Position | Search Position: position empty |
| Position | Delete Position by Id |
| Position | Update Position by Id |
| Position | Update Position by Id: position not found |
| Item | get all Items with an empty list |
| Item | new Item creation |
| Item | two new Item created |
| Item | Item creation error: id duplicated |
| Item | Get all Items |
| Item | Get SKU by ID |
| Item | Get Item: not found |
| Item | modify an Item |
| Item | delete Item |
| Internal Order | get all InternalOrders with an empty list |
| Internal Order | Create a new Internal Order |
| Internal Order | Check newly created Internal Order |
| Internal Order | Check 2 newly created Internal Order |
| Internal Order | Check  creating a repeated Internal Order |
| Internal Order | get a non existing Internal Order |
| Internal Order | get last ID from empty list |
| Internal Order | get last ID |
| Internal Order | get last ID of multiple element list |
| Internal Order | get by state 'ISSUED' |
| Internal Order | get by state 'MOCKSTATE' |
| Internal Order | get by state 'NOTASTATE' |
| Internal Order | get by state empty list |
| Internal Order | Modify Internal order State |
| Internal Order | Modify Internal order customer Id |
| Internal Order | Modify non existing Internal order |
| Internal Order | Modify Internal order missing arguments |
| Internal Order | Delete Internal Order |
| Internal Order | Delete not existing Internal Order |
| Internal Order | Add a product to an internal Order |
| Internal Order | get all products in internal Order |
| Internal Order | get all products in internal Orders empty list |
| Internal Order | Products from an Internal Order |
| Internal Order | Products from a non existing Internal Order |
| Internal Order | Products from an empty Internal Order |
| Internal Order | Delete InternalOrder Products |
| Internal Order | Delete InternalOrder Products of empty order |
| Internal Order | get Internal Orders SKUs |
| Internal Order | get Internal Order Skus when Empty list |
| Internal Order | get Internal Order Skus by Internal Order ID |
| Internal Order | modify Internal Order SKUItems |
| Internal Order | modify Internal Order Skus ID |
| Internal Order | modify Internal Order Skus ID of a repeated RFID |
| Internal Order | delete Internal Order Skus |
| Internal Order | delete Internal Order Skus of an empty order |
| Internal Order | delete Internal Order Skus of an non existing order |
| Internal Order | get Internal Order Product By skuID |
| Internal Order | get Product by SKUID |
| Internal Order | get Product by SKUID of non existing SKU |


### Code coverage report

    <Add here the screenshot report of the statement and branch coverage obtained using
    the coverage tool. >


### Loop coverage analysis

    <Identify significant loops in the units and reports the test cases
    developed to cover zero, one or multiple iterations >

|Unit name | Loop rows | Number of iterations | Jest test case |
|---|---|---|---|
|||||
|||||
||||||



