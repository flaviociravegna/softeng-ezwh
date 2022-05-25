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
This EzWh design model implements a layered architectural pattern. The base idea is the 3-tier architecture (presentation, application logic layer, data (DBMS) layer). The "server" class routes the API requests to the respective classes, which implements the Application Logic. Then, these classes uses the Data Access Objects to operate on the database. There are therefore two packages. The GUI is already defined and interfaces with the other package using HTTP calls, defined in the API. The backend side of the EzWh application is managed in the "Application Logic and Data".

# Low level design

Since the complete diagram is too large to be readable, the first diagram only shows the links between all the various classes. The details of each class are shown later.

```plantuml
@startuml


class server{ }

package Routers {
  class "SKU (router)"{ }
  class "SKUItem (router)"{ }
  class "TestDescriptor (router)"{ }
  class "TestResult (router)"{ }
  class "User (router)"{ }
  class "InternalOrder (router)"{ }
  class "RestockOrder (router)"{ }
  class "ReturnOrder (router)"{ }
  class "Item (router)"{ }
  class "Position (router)"{ }
}

package DataAccessObjects {
  class "SKU (DAO)"{ }
  class "SKUItem (DAO)"{ }
  class "TestDescriptor (DAO)"{ }
  class "TestResult (DAO)"{ }
  class "User (DAO)"{ }
  class "InternalOrder (DAO)"{ }
  class "RestockOrder (DAO)"{ }
  class "ReturnOrder (DAO)"{ }
  class "Item (DAO)"{ }
  class "Position (DAO)"{ }
  class DB {}
}

server --> "SKU (router)"
server --> "SKUItem (router)"
server --> "TestDescriptor (router)"
server --> "TestResult (router)"
server --> "Item (router)"
server --> "InternalOrder (router)"
server --> "User (router)"
server --> "RestockOrder (router)"
server --> "ReturnOrder (router)"
server --> "Position (router)"

"SKU (router)" --> "SKU (DAO)"
"SKU (router)" --> "SKUItem (DAO)"
"SKU (router)" --> "Position (DAO)"
"SKU (router)" --> "TestDescriptor (DAO)"
"SKUItem (router)" --> "SKU (DAO)"
"SKUItem (router)" --> "Position (DAO)"
"SKUItem (router)" --> "SKUItem (DAO)"
"TestDescriptor (router)" --> "SKU (DAO)"
"TestDescriptor (router)" --> "TestDescriptor (DAO)"
"TestResult (router)" --> "TestDescriptor (DAO)"
"TestResult (router)" --> "SKUItem (DAO)"
"TestResult (router)" --> "TestResult (DAO)"
"Item (router)" --> "SKU (DAO)"
"Item (router)" --> "Item (DAO)"
"InternalOrder (router)" --> "SKU (DAO)"
"InternalOrder (router)" --> "InternalOrder (DAO)"
"User (router)" --> "User (DAO)"
"RestockOrder (router)" --> "RestockOrder (DAO)"
"RestockOrder (router)" --> "SKU (DAO)"
"RestockOrder (router)" --> "User (DAO)"
"ReturnOrder (router)" --> "ReturnOrder (DAO)"
"ReturnOrder (router)" --> "RestockOrder (DAO)"
"Position (router)" --> "Position (DAO)"

"SKU (DAO)" --> DB
"SKUItem (DAO)" --> DB
"TestDescriptor (DAO)" --> DB
"TestResult (DAO)" --> DB
"Item (DAO)" --> DB
"InternalOrder (DAO)" --> DB
"User (DAO)" --> DB
"RestockOrder (DAO)" --> DB
"ReturnOrder (DAO)" --> DB
"Position (DAO)" --> DB
@enduml

```


```plantuml
@startuml


class "SKU (DAO)"{
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
  ~getLasSKUId():Integer
  +getSKUIdByPosition(positionID: Integer):Integer
  +getAllSKU(): Array<Object>
  +getSKUByDescription(in str:description): Object
  +getSKUById(id :Integer): Object
  +createNewSKU(description:String, weight:Integer, volume:Integer, notes:String, price:Float, availableQuantity:Integer): void
  +modifySKU(id:Integer, newDescription:String, newWeight:Integer, newVolume:Integer, newNotes:String, newPrice:Float, newAvailableQuantity:Integer): void
  +addOrModifyPositionSKU(id:Integer): void
  +deleteSKU(id:Integer): void
  +decreaseSKUavailableQuantity(id: Integer): void
  +increaseSKUavailableQuantity(id: Integer): void
}

class "SKUItem (DAO)"{ 
  -RFID: String
  -Available: Integer
  -DateOfStock: String
  -SKUId: Integer
  --
  +getAllSKUItems(): Array<Object>
  +getSKUItemsByID(SKUId:Integer): Array<Object>
  +getSKUItemByRFID(RFID: String): Object
  +createNewSKUItem(RFID:String, SKUId:Integer, DateOfStock:String): void
  +modifySKUItem(SKUId:Integer, newRFID:String, newAvailable:Integer, newDateOfStock:String): void
  +deleteSKUItem(RFID:String): void
  +updatePositionWeightAndVolume(positionID: Integer,newOccupiedWeight: Double, newOccupiedVolume: Double): void
}


class "TestDescriptor (DAO)"{ 
  -ID: Integer
  -Name: String
  -Description: String
  -idSku: Integer
  --
  ~getLastTestDescriptorsId():Int
  +getAllTestDescriptors(): Array<Object>
  +getTestDescriptorById(id:Integer): Object
  +getTestDescriptorByIdSKUId(skuId:Integer): Int
  +createNewTestDescriptor(name:String, procedureDescription:String, idSKU:Integer): void
  +modifyTestDescriptor(newName:String, newProcedureDescription:String, newIdSKU:Integer): void
  +deleteTestDescriptor(id:Integer): void
}
class "TestResult (DAO)"{
  -ID: Integer
  -Date: String
  -Result: boolean
  -idTestDescriptor: Integer
  -SKUId: Integer
  --
  +getAllTestResultsByRFID(RFID:String): Array<Object>
  +getTestResultById(idTestDescriptor:Integer, RFID:String): Object
  ~searchMaxID=():Int
  +createTestResult(RFID:String, idTestDescriptor:Integer, Date:String, Result:Integer): void
  +modifyTestResult(RFID:String, idTestResult:Integer, newIdTestDescriptor:Integer, newDate:String, newResult:Boolean): void
  +deleteTestResult(RFID:String, idTestResult:Integer): void
  --
}


class "User (DAO)"{ 
  -ID: Integer
  -Surname: String
  -Name: String
  -Email: String
  -Type: String
  -HashPassword: String
  --
  +getUserInfo(): Object
  +getUserInfoById(id:Int): Object
  +getAllUsersExceptManagers(): Array<Object>
  +getAllSuppliers(): Array<Object>
  +getAllUsers(): Array<Object>
  +createNewUser(username:String, name:String, surname:String, password:String, type:String): void
  ~searchMaxID():Int
  +getUserByUsernameAndType(username:String,type:string): Object
  +managerSessions(username:String, password:String): void
  +customerSessions(username:String, password:String): void
  +supplierSessions(username:String, password:String): void
  +clerkSessions(username:String, password:String): void
  +qualityEmployeeSessions(username:String, password:String): void
  +deliveryEmployeeSessions(username:String, password:String): void
  +logout(): void
  +modifyUserRight(username:String, newType:String): void
  +deleteUser(username:String, type:String): void
}

class "InternalOrder (DAO)"{
-id: Integer
  -issueDate: String
  -State: state
  -customerId: Integer
  -products: Array<Object>
  --
  +getAllInternalOrders(): Array<Object>
  +getInternalOrdersIssued(): Array<Object>
  +getInternalOrdersAccepted(): Array<Object>
  +getInternalOderByState(state: String): Object
  +getInternalOrderById(id:Integer): Object
  +createNewInternalOrder(issueDate:String, products:Array<Object>, customerId:Integer): void
  +getLastInternalOrderId():Integer
  +modifyInternalOrderState(id:Integer, newState:String, [optional] products:Array<Item>): void
  +deleteInternalOrderById(id:Integer): void
  --
  +getAllInternalOrdersProduct():Array<Object>
  +getInternalOrdersProductsById(id:Integer):Array<Object>
  +getInternalOrdersProductBySkuId(skuId: Integer): Object
  --
  +getAllInternalOrdersSKUItems():Array<Object>
  +getInternalOrderSKUItemById(internalOrderId:Integer):Array<Object>
  +addInternalOrdersSKUItems(internalOrderID:Integer, RFID:Interger):void
  +modifyInternalOrderSKUItems(id:Integer, RFID:Integer):void
  +addInternalOrdersProducts(internalOrderID:Integer,skuID: Integer, quantity:Integer):void
  +deleteInternalOrderProducts(internalOrderID:Integer):void
  +deleteInternalOrderSKUItems(internalOrderID:Integer):void
}


class "RestockOrder (DAO)"{
-id: Integer
  -IssueDate: String
  -State: state
  -products: Array<Object>
  -supplierId: Integer
  -TransportNote: TransportNote
  --
  +getRestockOrders(): Array<Object>
  +getRestockOrdersProducts(restock_id:Integer): Array<Object>
  +getRestockOrdersSKUItems(restock_id:Integer): Array<Object>
  +getRestockOrdersIssued(): Array<Object>
  +getRestockOrderById(id:Integer): Object
  +getRestockOrderFailedSKUItems(id:Integer): Array<Object>
  ~getLastPIDInOrder():Integer
  +insertProductInOrder(id:Integer,restockOrderId:Integer,skuId:Integer,qty:Integer):void
  +createRestockOrder(issueDate:String, products:Array<Item>, supplierId:Integer): void
  ~getLastIdRso():Integer
  +removeSKUItemFromRestockOrder(skuId: Integer, id:Integer): void
  +modifyRestockOrderState(id:Integer, newState:String): void
  +addRestockOrderSKUItems(id:Integer, skuItems:Array<SKUItem>): void
  +addRestockOrderTransportNote(id:Integer, transportNote:Object): void
  +getRestockOrderTransportNote(id:Integer):Object
  +deleteRestockOrder(id:Integer): void
  +deleteSkuItemsFromRestockOrder(id:Integer):void
  +deleteRstockOrderTransportNote(id:Integer):void
  +deleteProductsFromRestockOrder(id:Integer):void
  +getSupplierById(id:Integer):Object
  +getSKUByIdFromRestockOrder(skuId:Integer,restockOrderID:Integer):Object
}
class "ReturnOrder (DAO)"{ 
  -ID: Integer
  -ReturnDate: String
  -restockOrder: RestockOrder
  --
  +getReturnOrders(): Array<Object>
  +getReturnOrderById(id:Integer): Object
  +getReturnOrderProducts(id:Integer):Object
  ~getLastReturnOrderId():Integer
  +insertProductInRO(product:Object,id:Integer):void
  +createNewReturnOrder(returnDate:String, id:Integer, restockOrderId:Integer): void
  +deleteReturnOrder(id:Integer): void
  +de;eteReturnOrderProducts(id:Integer): void
  +getRFIDFromRestockOrder(RFID:Integer, restockOrderId): Object
}
class "Item (DAO)"{ 
  -ID: Integer
  -Description: String
  -Price: float
  -SKUId: Integer
  -supplierId: Integer
  --
  +getAllItems(): Array<Object>
  +getItemById(id:Integer): Object
  +createNewItem(description:String, price:Float, SKUId:Integer, supplierId:Integer): void
  +modifyItem(id:Integer, newDescription:String, newPrice:Float): void
  +deleteItem(id:Integer): void
}
class "Position (DAO)"{ 
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
    +getPositionById(id: Integer):Object
    +createNewPosition(aisleID:String, row:String, icol:String, maxWeight:Integer, maxVolume:Integer): void
    +modifyPosition(positionID:String, newAisleID:String, newRow:String, newCol:String, newMaxWeight:Integer, newMaxVolume:Integer, newOccupiedWeight:Integer, newOccupiedVolume:Integer): void
    +modifyPositionId(oldPositionID:String, newPositionID:String): void
    +deleteSKUItemByPositionID(positionID): void
    searchPosition(positionID:Integer):Object}
}

class DB {
  -db: Database
  --
  -createConnection(): void
  --
  ~createTablePositions();
  ~createTableRestockOrders();
  ~createTableRestockOrdersProducts();
  ~createTableRestockOrdersSKUItems();
  ~createTableRestockOrderTransportNote();
   ~createTableReturnOrders();
   ~createTableReturnOrdersProducts();
  ~createTableSKUItems();
  ~createTableSKUs();
   ~createTableTestDescriptors();
  ~createTableTestResults();
   ~createTableUsers();
   ~createTableItems();
   ~createTableInternalOrders();
   ~createTableInternalOrdersSKUItems();
   ~createTableInternalOrdersProducts();
  ~deleteAllUsers();
   ~populateTableUser();
}

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

