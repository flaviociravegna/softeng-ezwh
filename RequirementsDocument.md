 #Requirements Document 

Date: 22 march 2022
	27 march 2022

Version: 0.4

 
| Version number | Change |
| ----------------- |:-----------:|
| 0.1| added first stakeholders and some FR|
| 0.2| completed the stakeholders and interfaces| 
| 0.3| added new stakeholder/actor employee and made a prototype of the context diagram|
| 0.4| started NF requirements|


# Contents

- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	+ [Context Diagram](#context-diagram)
	+ [Interfaces](#interfaces) 
	
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
	+ [Functional Requirements](#functional-requirements)
	+ [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
	+ [Use case diagram](#use-case-diagram)
	+ [Use cases](#use-cases)
    	+ [Relevant scenarios](#relevant-scenarios)
- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)

# Informal description
Medium companies and retailers need a simple application to manage the relationship with suppliers and the inventory of physical items stocked in a physical warehouse. 
The warehouse is supervised by a manager, who supervises the availability of items. When a certain item is in short supply, the manager issues an order to a supplier. In general the same item can be purchased by many suppliers. The warehouse keeps a list of possible suppliers per item. 

After some time the items ordered to a supplier are received. The items must be quality checked and stored in specific positions in the warehouse. The quality check is performed by specific roles (quality office), who apply specific tests for item (different items are tested differently). Possibly the tests are not made at all, or made randomly on some of the items received. If an item does not pass a quality test it may be rejected and sent back to the supplier. 

Storage of items in the warehouse must take into account the availability of physical space in the warehouse. Further the position of items must be traced to guide later recollection of them.

The warehouse is part of a company. Other organizational units (OU) of the company may ask for items in the warehouse. This is implemented via internal orders, received by the warehouse. Upon reception of an internal order the warehouse must collect the requested item(s), prepare them and deliver them to a pick up area. When the item is collected by the other OU the internal order is completed. 

EZWH (EaSy WareHouse) is a software application to support the management of a warehouse.



# Stakeholders


| Stakeholder name  | Description | 
| ----------------- |:-----------:|
|   Company or retailer  | They wish to organize their inventory and manage different relationships with the app|
|	Manager 		| Can supervise the availability of items. The manager has an administrator role | 
|	Supplier		| Provide the different types of items which the companies and retailers wish to manage|
|	Quality office	| Sets the quality standart and testing of items ordered from different suppliers| 
|	OU 				| OU(organizational units) are subparts of the company which have the need to ask and manage items from the companys warehouse|
|	Payment service	| Service which will allow companies to pay directly to their suppliers for the ordered items|
|	Competitors		| Other applications that provide similar services|
|	Item			| Product that must be managed in the warehouse|
|	IT manager		| Will be the one to manage the application and its correct use and functionality|
|	Employee 		| Are the users of the application on a base level and represent the OU when making orders|


# Context Diagram and interfaces

## Context Diagram
\<Define here Context diagram using UML use case diagram>

\<actors are a subset of stakeholders>

## Interfaces
\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| :-----:|
| Employee 		| Graphical User Interface | Screen, Keyboard |
| Manager		| Graphical User Interface | Screen, keyboard |
| IT Manager	| Graphical User Interface | Screen, keyboard |
| Quality Office| Graphical User Interface | Screen, Keyboard |
| Supplier 		| Graphical User Interface | Screen, Keyboard |
| Item			| ReadBarCode  | Laser Beam (Bar Code Reader) |
| Payment service | APIs (e.g: PayPal: https://developer.paypal.com/home)  | Internet Connection  |

# Stories and personas
\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>


# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

| ID        | Description  |
| ------------- |:-------------:| 
|  FR1 		| User Management |
|   FR1.1 	| User registration|
|     FR1.1.1 	| User profile setting|
|	FR1.2 |User Authentication|
|   	FR1.2.1 | User Log in|
| 		FR1.2.2 | User level of access authentication |
|   FR1.3 	| User Log out|
|	FR1.4 	| User profile management|
|  FR2 		| Sales management  |
|   FR2.1 	| Start sale transaction|
|	FR2.2 	| Payment management |
|   FR2.3 	| End sale transaction|
|  FR3 		| Warehouse management|
|   FR3.1 	| Item management|
|	 FR3.1.1 	| Item request management| 
|	  FR3.1.1.1		| Item internally requested by OU management|
|	  FR3.1.1.2 	| Item Order to supplier management|
| 	  FR3.1.1.3 	| Add a new order |
| 	  FR3.1.1.4 	| Complete an existing order |
| 	  FR3.1.1.5 	| Cancel an order |
| 	  FR3.1.1.6 	| List order log |
| 	   FR3.1.1.6.1 	| Filter order log based on order information |
| 	 FR3.1.2 	| List available items|
| 	  FR3.1.2.1 	| Filter based upon item information |
| 	 FR3.1.3	| Add new item to warehouse |
|	 FR3.1.4 	| Delete item from warehouse |
|	 FR3.1.5 	| Modify or check item information |
|	  FR3.1.5.1 	| Modify or check item physical location |
| 	   FR3.1.5.1.1 	| Show item location on a map |
| 	  FR3.1.6 	| Low supply notification |
| 	FR3.2 	| Add a new warehouse |
| 	FR3.3 	| Remove a warehouse |
| 	FR3.4 	| Modify warehouse information |
| 	FR3.5 	| List warehouses |
|  FR4		| Manage suppliers |
|	 FR4.1 	| Add new supplier to record|
| 	  FR4.1.1 	| Create new supplier account|
|	 FR4.2 	|List suppliers|
|	  FR4.2.1 	| Filter suppliers based on items|
|  FR5 		| Manage quality check |
|	 FR5.1 	| List items in the quality office domain |
| 	  FR5.1.1 | Fileter based on type of test 	|
| 	 FR5.2 	| Test management |
| 	  FR5.2.1 | Add new test |
| 	  FR5.2.2 | Remove a test |
| 	  FR5.2.3 | Modify a test |
| 	   FR5.2.3.1 | Change test properties |
| 	   FR5.2.3.2 | Manage items to be tested |
|		FR5.2.3.2.1 | Add item to test |
| 		FR5.2.3.2.2 | Remove item from test |
| 		FR5.2.3.2.3 | Item result management |
| 		 FR5.2.3.2.3.1 | Register item results |
| 		 FR5.2.3.2.3.2 | Handle failed results |
| 		FR5.2.3.2.4 | List items in the test |
|		 FR5.2.3.2.4.1 | Filter based on item result|


| ------------- |:-------------:| 

## Non Functional Requirements


| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| :-----:|
|  NFR1     | Usability |   A manager should be able to use all the system functions after two hours training| |
|  NFR2.1     | Efficiency |  Following functional requirements should be completed in less than ½ sec | FR2.X, FR3.1.1.1, FR3.1.1.2, FR3.1.1.3, FR3.1.1.4, FR3.1.1.5, FR3.1.3, FR3.1.4, FR3.1.5, FR3.1.6, FR3.2, FR3.3, FR3.4, FR3.5, FR5.2.X|
|  NFR2.2     | Efficiency | Following functional requirements should require less than 1 sec| FR1.1, FR1.2, FR3.1.1.6, FR3.1.2, FR4.1.1, FR4.2, FR5.1, FR5.2.3.2.4 |
| NFR2.3 | Efficiency | Menu navigation must be not percepted (response time < 0.1 sec)| | 
| NFR2.4 | Efficiency | The application should meet the previous performance requirements when there are less than 1000 users connected per hour| |
| NFR2.5 | Efficiency | Application size < 100 MB| |
| NFR3.1	| Reliability		| Mean Time Between Failure > 20 days | |
| NFR3.2	| Reliability		| The application must be available to users 98 % of the time (during working hours [Mon – Fri, 08:00 – 19:00] ) every month | |
| NFR4.1	| Maintainability	| An error should be fixed, 80% of the times, in less than 24 hours| |
| NFR4.2	| Maintainability	| About 20 person hours needed to fix a major defect | |
| NFR5.1	| Security		| Personal data must be processed in compliance with the GDPR| GDPR: https://eur-lex.europa.eu/eli/reg/2016/679/oj |
| NFR5.2	| Security		| Only authorized users can access to the data. Users must authenticate themselves using their credentials (e-mail + secure password). Basic user must not be able to exploit Manager tasks| Secure password constraints: <br>- Minimum length greater (or equal) than 12 characters <br> - Must include: [at least 1 special symbol (e.g. @_#$%), Numbers, Lowercase & Uppercase characters]. <br> - Must be changed every 10 months|
| NFR6	| Portability		| The application should run on the majority of the most used browsers in their secure versions| Firefox 88+, Chrome 93+, Safari (macOS) 11.1.1+, Safari (iOS) 12.4.3+, Opera 72+|
| NFR7	| Implementation		| The application front-end and back-end is coded in Javascript | |
| NFR8 | Domain | Currency is Euro | FR2 |


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


\<next describe here each use case in the UCD>
### Use case 1, UC1 - Create User Account
| Actors Involved        | Manager|
| ------------- |:-------------:|
|  Precondition     |           Account M does not exist                                                |
|  Post condition     |                Account M added in the system                 |  
|  Nominal Scenario     |  New Manage creates a new account M and populates its fields.  |

### Use case 2, UC2 - Delete the account

| Actors Involved        |   Manager|
| ------------- |:-------------:|
|  Precondition     |                       Account M exists                       |
|  Post condition     |             Account M removed from system                                                 |
|  Nominal Scenario   |  Manager  selects an account M to delete |


### Use case 3, UC3 - Add new items

| Actors Involved        | Manager, Items|
| ------------- |:-------------:|
|  Precondition     |           item I not exist in warehouse                                 |
|  Post condition     |                   item I added in the warehouse                   |
|  Nominal Scenario     | manager add one or more items to warehouse |


### Use case 4, UC4 - Modify item information 

| Actors Involved        | Manager, Items|
| ------------- |:-------------:|
|  Precondition     |           item I exist in warehouse                                 |
|  Post condition     |                                      |
|  Nominal Scenario     | manager modify one or more information of items in warehouse |
|  Variants     | Only manager can modify the information of items in warehouse |

### Use case 5, UC5 - Delete item 

| Actors Involved        | Manager, Items|
| ------------- |:-------------:|
|  Precondition     |           item I exist in warehouse                                 |
|  Post condition     |              item I removed from the warehouse                        |
|  Nominal Scenario     | manager remove one or more item from warehouse |

### Use case 6, UC6 - Quality test 

| Actors Involved        |  Items, Quality Office employees|
| ------------- |:-------------:|
|  Precondition     |           item I be chosen to be test                                 |
|  Post condition     |              item been tested                        |
|  Nominal Scenario     | Quality Office employees test the chosen item and test whether the quality is good or not |
|  Variants     | After the item been tested, it will be add to the warehouse if quality is good |

### Use case 7, UC7 - Create new internal order 

| Actors Involved        | Manager, Items,  Organizational Units|
| ------------- |:-------------:|
|  Precondition     |            Organizational Units OU send a request of  item I and item I exist in warehouse                                 |
|  Post condition     |              new internal order O added in system             |
|  Nominal Scenario     | Organizational Units send a request to warehouse  |

### Use case 8, UC8 - Complete internal order 

| Actors Involved        | Manager, Items, Payment service,  Organizational Units|
| ------------- |:-------------:|
|  Precondition     |            Order O exist in system                                 |
|  Post condition     |              item I send to OU , OU pay the price ,the number of item I  decreased, order O removed from system            |
|  Nominal Scenario     | Organizational Units pick the ordered items from warehouse |





##### Scenario 1.1 

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

| Scenario 1.1 | |
| ------------- |:-------------:| 
|  Precondition     | \<Boolean expression, must evaluate to true before the scenario can start> |
|  Post condition     | \<Boolean expression, must evaluate to true after scenario is finished> |
| Step#        | Description  |
|  1     |  |  
|  2     |  |
|  ...     |  |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2
..

### Use case x, UCx
..



# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the system, and their relationships> 

\<concepts are used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >




