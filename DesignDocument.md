# Design Document 


Authors: Group37

Date: 27/04/2022

Version:


# Contents

- [Design Document](#design-document)
- [Contents](#contents)
- [Instructions](#instructions)
- [High level design](#high-level-design)
- [Low level design](#low-level-design)
- [Verification traceability matrix](#verification-traceability-matrix)
- [Verification sequence diagrams](#verification-sequence-diagrams)
  - [Scenario 1.1: Create SKU S](#scenario-11-create-sku-s)
  - [Scenario 2.2: Modify positionID of P](#scenario-22-modify-positionid-of-p)
  - [Scenario 3.1: Restock Order of SKU S issued by quantity](#scenario-31-restock-order-of-sku-s-issued-by-quantity)
  - [Scenarios 4.3: Delete user](#scenarios-43-delete-user)
  - [Scenario 5.2.1: Record positive test results of all SKU items of a RestockOrder](#scenario-521-record-positive-test-results-of-all-sku-items-of-a-restockorder)
  - [Scenario 6.1: Return order of SKU items that failed quality test](#scenario-61-return-order-of-sku-items-that-failed-quality-test)
  - [Scenario 9.1: Internal Order IO accepted](#scenario-91-internal-order-io-accepted)

# Instructions

The design must satisfy the Official Requirements document, notably functional and non functional requirements, and be consistent with the APIs

# High level design 

```plantuml
@startuml
package "        GUI       " as G #DDDDDD {
}

package "  Application Logic and Data    " as A #DDDDDD {
 
}
G -[dashed,thickness=2]-> A 
@enduml

```
This EzWh design model implements a layered architectural pattern. The base idea is the 3-tier architecture (presentation, application logic layer, data (DBMS) layer): the two lower tiers (application logic and data) are merged together, so the final architectural patter is a 2-tier. There are therefore two packages. The GUI is already defined and interfaces with the other package using HTTP calls, defined in the API. The backend side of the EzWh application is managed in the "Application Logic and Data".

# Low level design


```plantuml
@startuml
class EzWh{  
}

note right of EzWh
This class implements the relations with the other classes using lists.
EzWh acts as a container of other class instances.
end note

note right of EzWh
We assume that all the constructors are implemented
end note

Class Position {
  -PositionID: String
  -Aisle: String
  -Row: String
  -Column: String
  -MaxWeight: Integer
  -MaxVolume: Integer
  -OccupiedWeight: Integer
  -OccupiedVolume: Integer
  --
  +getAllPositions(): Array<Object>
  +createNewPosition(aisleID:String, row:String, icol:String, maxWeight:Integer, maxVolume:Integer): void
  +modifyPosition(positionID:String, newAisleID:String, newRow:String, newCol:String, newMaxWeight:Integer, newMaxVolume:Integer, newOccupiedWeight:Integer, newOccupiedVolume:Integer): void
  +modifyPositionId(oldPositionID:String, newPositionID:String): void
  +deleteSKUItemByPositionID(positionID): void
  --
  ~setPositionID(ID:String): void
  ~setAisle(Aisle:String): void
  ~setRow(Row:String): void
  ~setColumn(Column:String): void
  ~setMaxWeight(MaxWeight:Integer): void
  ~setMaxVolume(MaxVolume:Integer): void
  ~addWeight(bonusWeight:Integer): void
  ~changeWeightAndVolume(weight: Integer, volume: Integer): void
  ~getPositionID(): String
  ~getAisle(): String
  ~getRow(): String
  ~getColumn(): String
  ~getMaxWeight(): Integer
  ~getMaxVolume(): Integer
  ~getOccupiedWeight(): Integer
  ~getOccupiedVolume(): Integer
  ~calculatePositionID(Row:String, Column:String, Aisle:String): String
  ~getPosition(ID: Integer): Position
}

Class SKU {
  -ID: Integer
  -Description: String
  -Weight: Integer
  -Volume: Integer
  -Price: Float
  -Note: String
  -positionID: String
  -availableQuantity: Integer
  -testDescriptors: Array<TestDescriptor>
  --
  +getAllSKU(): Array<Object>
  +getSKUByDescription(in str:description): Object
  +getSKUById(id :Integer): Object
  +createNewSKU(description:String, weight:Integer, volume:Integer, notes:String, price:Float, availableQuantity:Integer): void
  +modifySKU(id:Integer, newDescription:String, newWeight:Integer, newVolume:Integer, newNotes:String, newPrice:Float, newAvailableQuantity:Integer): void
  +addOrModifyPositionSKU(id:Integer): void
  +deleteSKU(id:Integer): void
  --
  ~setID(ID:Integer): Integer
  ~setDescription(Description:String): void
  ~setWeight(Weight:Integer): void
  ~setVolume(Volume:Integer): void
  ~setPrice(price:float): void
  ~setNote(Note:String): void
  ~setAvailability(quantity: Integer): void
  ~AddTestDescriptor(TestDescriptor:TestDescriptor): void
  ~getID(): Integer
  ~getDescription(): String
  ~getWeight(): Integer
  ~getVolume(): Integer
  ~getPrice(): Float
  ~getNote(): String
  ~getAvailability(): Integer
  ~getTestDescriptors(): Array<TestDescriptor>
  ~getIDByDescription(desc:String): Integer
}

Class TestDescriptor {
  -ID: Integer
  -Name: String
  -Description: String
  -idSku: Integer
  --
  +getAllTestDescriptors(): Array<Object>
  +getTestDescriptorById(id:Integer): Object
  +createNewTestDescriptor(name:String, procedureDescription:String, idSKU:Integer): void
  +modifyTestDescriptor(newName:String, newProcedureDescription:String, newIdSKU:Integer): void
  +deleteTestDescriptor(id:Integer): void
  --
  ~setID(ID:Integer): void
  ~setName(Name:String): void
  ~setDescription(Description:String): void
  ~setIdSku(id:Integer): void
  ~getID(): Integer
  ~getName(): String
  ~getDescription(): String
  ~getIdSku(): Integer
}

Class TestResult {
  -ID: Integer
  -Date: String
  -Result: boolean
  -idTestDescriptor: Integer
  -SKUId: Integer
  --
  +getAllTestResultsByRFID(RFID:String): Array<Object>
  +getTestResultByRFID(idTestDescriptor:Integer, RFID:String): Object
  +createTestResult(RFID:String, idTestDescriptor:Integer, Date:String, Result:Integer): void
  +modifyTestResult(RFID:String, idTestResult:Integer, newIdTestDescriptor:Integer, newDate:String, newResult:Boolean): void
  +deleteTestResult(RFID:String, idTestResult:Integer): void
  --
  ~setID(ID:Integer): void
  ~setDate(Date:String): void
  ~setResult(Result:boolean): void
  ~setIdTestDescriptor(id:Integer): void
  ~setSkuId(id:Integer): void
  ~getID(): Integer
  ~getDate(): String
  ~getResult(): boolean
  ~getIdTestDescriptor(): Integer
  ~getSkuId(): Integer
}

Class Item {
  -ID: Integer
  -Description: String
  -Price: float
  -SKUId: Integer
  -supplierId: Integer
  --
  +getItems(): Array<Object>
  +getItemById(id:Integer): Object
  +createNewItem(description:String, price:Float, SKUId:Integer, supplierId:Integer): void
  +modifyItem(id:Integer, newDescription:String, newPrice:Float): void
  +deleteItem(id:Integer): void
  --
  ~getID(): Integer
  ~getDescription(): String
  ~getPrice(): float
  ~getSkuId(): Integer
  ~getSupplierId(): Integer
  ~setID(ID:int): void
  ~setDescription(Description:String): void
  ~setPrice(price:Float): void
  ~setSkuId(skuid:Integer): void
  ~setSupplierId(id:Integer): void
}

Class InternalOrder {
  -id: Integer
  -issueDate: String
  -State: state
  -customerId: Integer
  -products: Array<Object>
  --
  +getInternalOrders(): Array<Object>
  +getInternalOrdersIssued(): Array<Object>
  +getInternalOrdersAccepted(): Array<Object>
  +getInternalOrderById(id:Integer): void
  +createNewInternalOrder(issueDate:String, products:Array<Object>, customerId:Integer): void
  +modifyInternalOrderState(id:Integer, newState:String, [optional] products:Array<Item>): void
  +issueInternalOrder(id:Integer): void
  +deleteInternalOrder(id:Integer): void
  --
  ~setId(id:Integer): void
  ~setDate(Date:String): void
  ~setState(State:state): void
  ~setCustomerId(id:Integer): void
  ~setProducts(products:Array<Object>): void
  ~getId(): Integer
  ~getDate(): String
  ~getState(): String
  ~getCustomerId(): Integer
  ~getProducts(): Array<Object>
}

note right of InternalOrder::products
  "products" contains objects
 describing <b>SKU items</b>
 and their <b>quantity</b>:
 {SKUItem, quantity}.
end note

Class SKUItem {
  -RFID: String
  -Available: Integer
  -DateOfStock: String
  -SKUId: Integer
  --
  +getAllSKUItems(): Array<Object>
  +getSKUItemsById(SKUId:Integer): Array<Object>
  +getSKUItemByRFID(RFID: String): Object
  +createNewSKUItem(RFID:String, SKUId:Integer, DateOfStock:String): void
  +modifySKUItem(SKUId:Integer, newRFID:String, newAvailable:Integer, newDateOfStock:String): void
  +deleteSKUItem(RFID:String): void
  --
  ~getRFID(): String
  ~getAvailability(): Integer
  ~getDateOfStock(): String
  ~getSkuId(): Integer
  ~setRFID(RFID:String): void
  ~setAvailability(Available:Integer): void
  ~setDateOfStock(date:String): void
  ~setSkuId(id:Integer): void
}

Class User {
  -ID: Integer
  -Surname: String
  -Name: String
  -Email: String
  -Type: String
  -HashPassword: String
  --
  +getUserInfo(): Object
  +getSuppliers(): Array<Object>
  +getAllUsers(): Array<Object>
  +createNewUser(username:String, name:String, surname:String, password:String, type:String): void
  +managerSessions(username:String, password:String): void
  +customerSessions(username:String, password:String): void
  +supplierSessions(username:String, password:String): void
  +clerkSessions(username:String, password:String): void
  +qualityEmployeeSessions(username:String, password:String): void
  +deliveryEmployeeSessions(username:String, password:String): void
  +logout(): void
  +modifyUserRight(username:String, newType:String): void
  +deleteUser(username:String, type:String): void
  --
  ~setID(ID:i Integer): void
  ~setName(name:String): void
  ~setSurname(surname:String): void
  ~setPassword(pwd:String): void
  ~setEmail(Email:String): void
  ~setType(Type:String): void
  ~getID(): Integer
  ~getSurname(): String
  ~getName(): String
  ~getFullName(): String
  ~getEmail(): String
  ~getType(): String
  ~getPassword(): Stirng
}

note left of RestockOrder::products
  "products" contains objects
 describing <b>SKUItems</b>
 and their <b>quantity</b>:
 {SKUItem, quantity}.
end note

Class RestockOrder {
  -id: Integer
  -IssueDate: String
  -State: state
  -products: Array<Object>
  -supplierId: Integer
  -TransportNote: TransportNote
  --
  +getRestockOrders(): Array<Object>
  +getRestockOrdersIssued(): Array<Object>
  +getRestockOrderById(id:Integer): Object
  +getRestockOrderFailedSKUItems(id:Integer): Array<Object>
  +createRestockOrder(issueDate:String, products:Array<Item>, supplierId:Integer): void
  +removeSKUItemFromRestockOrder(skuId: Integer, id:Integer): void
  +modifyRestockOrderState(id:Integer, newState:String): void
  +addRestockOrderSKUItems(id:Integer, skuItems:Array<SKUItem>): void
  +issueRestockOrder(id: Integer): void
  +addRestockOrderTransportNote(id:Integer, transportNote:TransportNote): void
  +deleteRestockOrder(id:Integer): void
  --
  ~setID(ID:Integer): void
  ~setIssueDate(Date:String): void
  ~setState(State:state): void
  ~setProducts(products:Array<Object>): void
  ~setTransportNote(note:TransportNote): void
  ~getID(): Integer
  ~getIssueDate(): String
  ~getState(): String
  ~getProducts(): Array<Object>
  ~getTransportNote(): string
  ~getFailedSKUItems(): Array<SKUItems>
}

enum restock_state{
  ISSUED
  DELIVERY
  DELIVERED
  TESTED
  COMPLETEDRETURN
  COMPLETED
}

enum internal_state{
  ISSUED
  ACCEPTED
  REFUSED
  CANCELLED
  COMPLETED
}

Class ReturnOrder {
  -ID: Integer
  -ReturnDate: String
  -restockOrder: RestockOrder
  --
  +getReturnOrders(): Array<Object>
  +getReturnOrderById(id:Integer): Object
  +createNewReturnOrder(returnDate:String, products:Array<SKUItem>, restockOrderId:Integer): void
  +commitReturnOrder(id: Integer): void
  +deleteReturnOrder(id:Integer): void
  --
  ~setID(in ID:Integer): void
  ~setReturnDate(in Date:String): void
  ~setRestockOrder(in order:RestockOrder): void
  ~getID(): Integer
  ~getReturnDate(): String
  ~getRestockOrder(): Object
}

Class DBHelper {
  -dbName: String
  --
  -connect(): void
  -createTables(): void
  --
  ~loadSKUs(): list<SKU>
  ~loadSKUItems(): list<SKUItem>
  ~loadPositions(): list<Position>
  ~loadTestDescriptors(): list<TestDescriptor>
  ~loadTestResults(): list<TestResult>
  ~loadUsers(): list<User>
  ~loadRestockOrders(): list<RestockOrders>
  ~loadReturnOrders(): list<ReturnOrders>
  ~loadInternalOrders(): list<InternalOrders>
  ~loadItems(): list<Items>
  --
  ~store(sql: String): void
  ~update(sql: String): void
  ~delete(sql: String): void
}

EzWh --> Position
EzWh --> SKU
EzWh --> SKUItem
EzWh --> TestDescriptor
EzWh --> TestResult
EzWh --> Item
EzWh --> InternalOrder
EzWh --> User
EzWh --> RestockOrder
EzWh --> ReturnOrder
EzWh --> DBHelper

SKU <--> "*" TestDescriptor
SKUItem "*" --> SKU

TestResult --> TestDescriptor
TestResult --> SKUItem
Position <-- SKU
Item "*" --> SKU
Item --> User
InternalOrder --> "*" SKUItem
InternalOrder --> User
InternalOrder ..> internal_state
RestockOrder --> "*" SKUItem
RestockOrder --> User
RestockOrder ..> restock_state
ReturnOrder "0..1"--> RestockOrder
@enduml

```

The pattern used for the Lower Level Design is the *façade pattern*. In this way, the user can only interact with the backend throught *EzWh* class. EzWh manages the user interactions with the backend, hidding the other classes and their attributes.



# Verification traceability matrix


|    	| EzWh  | User 	| SKU  	| SKUItem | TestResult | TestDescriptor | Position | RestockOrder | Item | ReturnOrder 	| InternalOrder |
|----- 	| :---: | :--: 	| :--: 	| :-----: | :--------: | :------------: | :------: | :----------: | :--: |:-----------:	|:-------------:|
FR1		|   x    |   x   |      	|         |            |                |          |              |      |				|				|
FR1.1  	|   x    |   x   |      	|         |            |                |          |              |      |||
FR1.2  	|   x    |       |      	|         |            |                |          |              |      |||
FR1.3 	|   x    |   x   |      	|         |            |                |          |              |      |||
FR1.4 	|   x    |   x   |      	|         |            |                |          |              |      |||
FR1.5  	|   x    |   x   |      	|         |            |                |          |              |      |||
FR2    	|   x    |      	|   x   |         |            |                |          |              |      |||
FR2.1  	|   x    |      	|   x   |         |            |                |          |              |      |||
FR2.2  	|   x    |      	|      |         |            |                |          |              |      |||
FR2.3  	|   x    |      	|   x   |         |            |                |          |              |      |||
FR2.4  	|   x   |      	|   x   |         |            |                |          |              |      |||
FR3    	|   x  |      	|      	|         |      x     |         x      |     x    |              |      |||
FR3.1   |   x |      	|      |         |            |                |     x     |              |      |||
FR3.1.1 |   x |      	|      |         |            |                |    x      |              |      |||
FR3.1.2 |   x    |      	|      |         |            |                |    x      |              |      |||
FR3.1.3 |   x    |      	|      |         |            |                |    x      |              |      |||
FR3.1.4 |   x    |      	|      |         |            |                |    x      |              |      |||
FR3.2   |   x    |      	|      |         |            |       x         |          |              |      |||
FR3.2.1 |   x    |      	|      |         |            |      x          |          |              |      |||
FR3.2.2 |    x   |      	|      |         |            |      x          |          |              |      |||
FR3.2.3 |    x   |      	|      |         |            |                |          |              |      |||
FR4    	|    x   |  x    |      |         |            |                |          |              |      |||
FR4.1   |    x   |  x    |      |         |            |                |          |              |      |||
FR4.2   |    x   |      |      |         |            |                |          |              |      |||
FR4.3   |    x   |  x    |      |         |            |                |          |              |      |||
FR4.4   |    x   |  x    |      |         |            |                |          |              |      |||
FR5    	|    x   |      |   x   |     x    |     x       |                |   x       |      x        |    | x ||
FR5.1   |    x  |      |      |         |            |                |          |    x          |      |||
FR5.2   |   x    |      | x     |         |            |                |          |  x            |      |||
FR5.3   |    x   |      |      |         |            |                |          |     x         |      |||
FR5.4   |    x   |      |      |         |            |                |          |      x        |      |||
FR5.5   |    x   |      |      |         |            |                |          |      x        |      |||
FR5.6   |    x   |      |      |         |            |                |          |      x        |      |||
FR5.7   |    x   |      |      |         |            |                |          |      x        |      |||
FR5.8   |    x   |      |   x   |   x      |     x       |                |          |      x        |     || |
FR5.8.1 |    x   |      |      |    x     |      x      |                |          |              |      |||
FR5.8.2 |    x   |      |      |    x     |            |                |          |              |      |||
FR5.8.3 |    x   |      |      |         |            |                |    x      |              |      |||
FR5.9   |    x   |      |      |    x     |            |                |          |      x        |      |x||
FR5.10  |    x   |      |      |    x     |            |                |          |      x        |      |x||
FR5.11  |    x   |      |      |         |            |                |          |              |      |x||
FR5.12  |    x   |      |      |         |            |                |          |              |      |x||
FR6    |     x  |      |     x |     x    |            |                |     x     |              |    x  ||x|
FR6.1    |   x    |      |   x  |         |            |                |          |              |      ||x|
FR6.2    |   x    |      |      |         |            |                |          |              |      ||x|
FR6.3    |   x    |      |      |         |            |                |          |              |      ||x|
FR6.4    |   x    |      |      |         |            |                |          |              |      ||x|
FR6.5    |   x    |      |      |         |            |                |          |              |      ||x|
FR6.6    |   x    |      |      |         |            |                |          |              |      ||x|
FR6.7    |   x    |      |      |         |            |                |          |              |      ||x|
FR6.8    |   x    |      |      |         |            |                |          |              |      ||x|
FR6.9    |   x    |      |      |    x     |            |                |          |              |      ||x|
FR6.10    |  x     |      |      |   x      |            |                |     x     |              |      |||
FR7    |     x  |      |      |         |            |                |          |              |     x |||








# Verification sequence diagrams 

In all the Sequence Diagrams is assumed that all the data are already loaded from the db.

## Scenario 1.1: Create SKU S
```plantuml
@startuml
autoactivate on
actor Manager
Manager -> API : Selects description D, weight W, volume V, notes N, price P, available quantity Q
API -> EzWh : createNewSKU(D, W, V, N, P. Q)
EzWh -> SKU : new SKU(D, W, V, N, P. Q)
return SKU
EzWh -> DB : store(SKU)
return success
return success
@enduml
```

## Scenario 2.2: Modify positionID of P
```plantuml
@startuml
autoactivate on
actor Manager
Manager -> API : Inserts new Position newId for Position pId
API -> EzWh : modifyPositionId(pID, newId)
EzWh -> Position : setPosition(ID)
returndone
EzWh -> DB : update(Position)
return done

return success
@enduml
```


## Scenario 3.1: Restock Order of SKU S issued by quantity
```plantuml
@startuml
autoactivate on
actor Manager
Manager -> API : Selects quantity Q, supplier SP, data D, product P
API -> EzWh : createRestockOrder(D, SP, {P,Q})
EzWh -> RestockOrder : new RestockOrder(D, SP, {P, Q}, state=ISSUED)
return RestockOrder
EzWh -> DB : store(RestockOrder)
return success
return success
@enduml
```
## Scenarios 4.3: Delete user
```plantuml
@startuml
autoactivate on
actor Admin
Admin -> API : Selects User
API -> EzWh : deleteUser(username, type)

EzWh -> DB : delete(User)
return done

return success
@enduml
```

## Scenario 5.2.1: Record positive test results of all SKU items of a RestockOrder
```plantuml
@startuml
autoactivate on
actor QualityEmployee 
loop for each Position
QualityEmployee -> API : Performs a test TId on SKUItem SRFID with result R
API -> EzWh : createTestResult(S.RFID, TId, Date, R)
EzWh -> TestResult: new TestResult(S.RFID, TId, Date, R)
return TestResult
end
EzWh -> DB : store(TestResult)
return success
QualityEmployee -> API: Finishes tests on Restock Order ROid
API -> EzWh : modifyRestockOrderState(ROid, TESTED)
EzWh -> RestockOrder: setState(TESTED)
return success
EzWh -> DB : update(RestockOrder)
return success

return success
@enduml
```

## Scenario 6.1: Return order of SKU items that failed quality test
```plantuml
@startuml
autoactivate on
actor Manager
Manager -> API : Inserts Restock Order Id RID
API -> EzWh :  getRestockOrderFailedSKU(RID)
EzWh -> RestockOrder : getFailedSKUItems(RID)
return SKU Array
return SKU Array
return SKU Array
Manager -> GUI: Inserts SKU list S
GUI -> EzWh: createNewReturnOrder(date, S, RID)
EzWh -> ReturnOrder: new ReturnOrder(date, S, RID)
note over ReturnOrder, SKUItem : operation done for each SKUItem
ReturnOrder -> SKUItem: setAvailability(0)
return done
return ReturnOrder
EzWh -> DB : store(ReturnOrder)
return success
EzWh -> DB : update(SKUItem)
return success
return success
@enduml
```

## Scenario 9.1: Internal Order IO accepted
```plantuml
@startuml
autoactivate on
actor Customer
actor Manager
Customer -> API : Selects SKU Items S and quantities Q
API -> EzWh : createNewInternalOrder(Date,Array <object>, customerId)
EzWh -> InternalOrder : new InternalOrder(Date,Array <object>, customerId, state=ISSUED)
return InternalOrder
loop for each SKUItem
EzWh -> SKUItem:  setAvailability(Q)
return success
end
loop for each Position
EzWh -> Position: changeWeightAndVolume(S.weight, S.volume)
return success
end
EzWh -> DB : store(InternalOrder)
return success
EzWh -> DB : update(SKUItem)
return success
EzWh -> DB : update(Position)
return success
return success
Manager -> API: Accepts the order with id ID
API -> EzWh: modifyInternalOrderState(ID, state=ACCEPTED)
EzWh -> InternalOrder: setState(ACCEPTED)
return success
EzWh -> DB: update(InternalOrder)
return success
return success

return success

@enduml
```

