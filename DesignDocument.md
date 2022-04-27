# Design Document 


Authors: 

Date:

Version:


# Contents

- [Design Document](#design-document)
- [Contents](#contents)
- [Instructions](#instructions)
- [High level design](#high-level-design)
- [Low level design](#low-level-design)
- [Verification traceability matrix](#verification-traceability-matrix)
- [Verification sequence diagrams](#verification-sequence-diagrams)
  - [Scenario 1.1](#scenario-11)
  - [Scenario 2.2](#scenario-22)
  - [Scenario 3.1](#scenario-31)
  - [Scenarios 4.3](#scenarios-43)
  - [Scenario 5.2.1](#scenario-521)
  - [Scenario 6.1](#scenario-61)
  - [Scenario 9.1](#scenario-91)

# Instructions

The design must satisfy the Official Requirements document, notably functional and non functional requirements, and be consistent with the APIs

# High level design 

<discuss architectural styles used, if any>
<report package diagram, if needed>






# Low level design

<for each package in high level design, report class diagram. Each class should detail attributes and operations>









# Verification traceability matrix

\<for each functional requirement from the requirement document, list which classes concur to implement it>

|    	| EzWh  | User 	| SKU  	| SKUItem | TestResult | TestDescriptor | Position | RestockOrder | Item | ReturnOrder 	| InternalOrder |
|----- 	| :---: | :--: 	| :--: 	| :-----: | :--------: | :------------: | :------: | :----------: | :--: |:-----------:	|:-------------:|
FR1		|       |   x   |      	|         |            |                |          |              |      |				|				|
FR1.1  	|       |   x   |      	|         |            |                |          |              |      |||
FR1.2  	|       |   x   |      	|         |            |                |          |              |      |||
FR1.3 	|       |   x   |      	|         |            |                |          |              |      |||
FR1.4 	|       |   x   |      	|         |            |                |          |              |      |||
FR1.5  	|       |   x   |      	|         |            |                |          |              |      |||
FR2    	|       |      	|   x   |         |            |                |          |              |      |||
FR2.1  	|       |      	|   x   |         |            |                |          |              |      |||
FR2.2  	|       |      	|   x   |         |            |                |          |              |      |||
FR2.3  	|       |      	|   x   |         |            |                |          |              |      |||
FR2.4  	|       |      	|   x   |         |            |                |          |              |      |||
FR3    	|       |      	|      	|         |      x     |         x      |     x    |              |      |||
FR3.1   |       |      	|      |         |            |                |     x     |              |      |||
FR3.1.1 |       |      	|      |         |            |                |    x      |              |      |||
FR3.1.2 |       |      	|      |         |            |                |    x      |              |      |||
FR3.1.3 |       |      	|      |         |            |                |    x      |              |      |||
FR3.1.4 |       |      	|      |         |            |                |    x      |              |      |||
FR3.2   |       |      	|      |         |            |       x         |          |              |      |||
FR3.2.1 |       |      	|      |         |            |      x          |          |              |      |||
FR3.2.2 |       |      	|      |         |            |      x          |          |              |      |||
FR3.2.3 |       |      	|      |         |            |      x          |          |              |      |||
FR4    	|       |  x    |      |         |            |                |          |              |      |||
FR4.1   |       |  x    |      |         |            |                |          |              |      |||
FR4.2   |       |  x    |      |         |            |                |          |              |      |||
FR4.3   |       |  x    |      |         |            |                |          |              |      |||
FR4.4   |       |  x    |      |         |            |                |          |              |      |||
FR5    	|       |      |   x   |     x    |     x       |                |   x       |      x        |    | x ||
FR5.1   |       |      |      |         |            |                |          |    x          |      |||
FR5.2   |       |      | x     |         |            |                |          |  x            |      |||
FR5.3   |       |      |      |         |            |                |          |     x         |      |||
FR5.4   |       |      |      |         |            |                |          |      x        |      |||
FR5.5   |       |      |      |         |            |                |          |      x        |      |||
FR5.6   |       |      |      |         |            |                |          |      x        |      |||
FR5.7   |       |      |      |         |            |                |          |      x        |      |||
FR5.8   |       |      |   x   |   x      |     x       |                |          |      x        |     || |
FR5.8.1 |       |      |      |    x     |      x      |                |          |              |      |||
FR5.8.2 |       |      |      |    x     |            |                |          |              |      |||
FR5.8.3 |       |      |      |         |            |                |    x      |              |      |||
FR5.9   |       |      |      |    x     |            |                |          |      x        |      |x||
FR5.10  |       |      |      |    x     |            |                |          |      x        |      |x||
FR5.11  |       |      |      |         |            |                |          |              |      |x||
FR5.12  |       |      |      |         |            |                |          |              |      |x||
FR6    |       |      |     x |     x    |            |                |     x     |              |    x  ||x|
FR6.1    |       |      |   x  |         |            |                |          |              |      ||x|
FR6.2    |       |      |      |         |            |                |          |              |      ||x|
FR6.3    |       |      |      |         |            |                |          |              |      ||x|
FR6.4    |       |      |      |         |            |                |          |              |      ||x|
FR6.5    |       |      |      |         |            |                |          |              |      ||x|
FR6.6    |       |      |      |         |            |                |          |              |      ||x|
FR6.7    |       |      |      |         |            |                |          |              |      ||x|
FR6.8    |       |      |      |         |            |                |          |              |      ||x|
FR6.9    |       |      |      |    x     |            |                |          |              |      ||x|
FR6.10    |       |      |      |   x      |            |                |     x     |              |      |||
FR7    |       |      |      |         |            |                |          |              |     x |||








# Verification sequence diagrams 
\<select key scenarios from the requirement document. For each of them define a sequence diagram showing that the scenario can be implemented by the classes and methods in the design>


## Scenario 1.1
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

## Scenario 2.2
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


## Scenario 3.1 
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
## Scenarios 4.3
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

## Scenario 5.2.1 
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

## Scenario 6.1
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

## Scenario 9.1
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

