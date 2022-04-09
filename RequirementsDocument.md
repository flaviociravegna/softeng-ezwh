 #Requirements Document 

Date: 22 march 2022
	27 march 2022

Version: 0.5

 
| Version number | Change |
| ----------------- |:-----------:|
| 0.1| added first stakeholders and some FR|
| 0.2| completed the stakeholders and interfaces| 
| 0.3| added new stakeholder/actor employee and made a prototype of the context diagram|
| 0.4| started NF requirements|
| 0.5| Completed NFR and Context Diagram
| 0.6| Added FR "Read bar code on product" and related NFR (link to the standard)
| 0.7| Completed use cases [1..5]


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
|	Quality office employee	| Sets the quality standart and testing of items ordered from different suppliers| 
|	OU 				| OU(organizational units) are subparts of the company which have the need to ask and manage items from the companys warehouse|
|	Payment service	| Service which will allow companies to pay directly to their suppliers for the ordered items|
|	Competitors		| Other applications that provide similar services|
|	Item			| Product that must be managed in the warehouse|
|	IT manager		| Will be the one to manage the application and its correct use and functionality|
|	Employee 		| Are the users of the application on a base level and represent the OU when making orders|


# Context Diagram and interfaces

## Context Diagram
\<Define here Context diagram using UML use case diagram>


Actors: Employee, Manager, IT Manager, Quality Office employee, Supplier, Item, Payment service

## Interfaces
\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| :-----:|
| Employee 		| Graphical User Interface | Screen, Keyboard |
| Manager		| Graphical User Interface | Screen, keyboard |
| IT Manager	| Graphical User Interface | Screen, keyboard |
| Quality Office employee	| Graphical User Interface | Screen, Keyboard |
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
|	FR1.2 	|User Authentication|
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
|	  FR3.1.5.2		| Read bar code on product |
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
|	FR6 	| Server Management |
| 	 FR6.1 | Add Server	|
| 	 FR6.2 | Remove a Server	|


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
| NFR7	| Domain	| The Bar Code number is an UPC-A 12 digits Code. Implementation details can be found at the following link:<br> https://www.gs1.org/docs/barcodes/GS1_General_Specifications.pdf | FR3.1.5.2 |
| NFR8	| Domain 	| Currency is Euro | FR2 |


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


### Use case 1, UC1 - Manage Users Account
| Actors Involved        | IT Manager |
| ------------- |:-------------:|
|  Precondition     |           IT Manager M exists and is logged in            	|
|  Post condition   |                        					    |  
|  Nominal Scenario |  M creates registers a new user account and its access rights		|
|  Variants			|  M modifies an user that is already registered					|


##### Scenario 1.1
| Scenario |  User registration |
| ------------- |:-------------:| 
|  Precondition     | IT Manager M exists and is logged in  |
|  Post condition   | Account A is created  |
|  Step#        	| Description  			|
|  1	 |  Application asks for ID, Name, Surname, E-mail 		|
|  2     |  M inserts the credentials of the new account A 		|  
|  3     |  M selects the access rights for the new account A 	|
|  4   	 |  M confirms the inserted data 						|

##### Scenario 1.2
| Scenario |  User profile management |
| ------------- |:-------------:| 
|  Precondition     | IT Manager M exists and is logged in  |
| 					| Account A exists						||
|  Post condition   | Account A is modified  |
|  Step#        		| Description  		|
|  1	 |  Application asks to select the user account that needs to be modified 		|
|  2     |  M selects the right account A 		|  
|  3     |  M modifies the fields of account A 	|
|  4   	 |  M confirms the updated data 		|

##### Scenario 1.3
| Scenario |  Delete user |
| ------------- |:-------------:| 
|  Precondition     | IT Manager M exists and is logged in  |
| 					| Account A exists						|
|  Post condition   | Account A is deleted  |
|  Step#        		| Description  		|
|  1	 |  Application asks to select the user account that needs to be deleted 		|
|  2     |  M selects the right account A 		|
|  3   	 |  M confirms the action 		|

### Use case 2, UC2 - Authorize and Authenticate
| Actors Involved        | IT Manager, Manager, Employee |
| ------------- |:-------------:|
|  Precondition     |            	|
|  Post condition   |               |  
|  Nominal Scenario |  Login (user authenticated)		|
|  Variants			|  Logout	|
|  Exceptions		|  Login: wrong password,  Login: expired password, Login: account not defined |

##### Scenario 2.1
| Scenario |  Login |
| ------------- |:-------------:| 
|  Precondition     | Account A exists  |
|  Post condition   | User U logged in  |
|  Step#        	| Description  		|
|  1	 |  Application asks for E-mail, password 		|
|  2     |  U inserts the credentials (e-mail and password) of the account A 	|  
|  3     |  U confirms the inserted data 				|
|  4     |  The application checks the credentials 		|
|  5   	 |  User U logged in |
|  6	 |  The application shows the functionalities related to the user rights |

##### Scenario 2.2
| Scenario |  Login (exception: wrong password) |
| ------------- |:-------------:| 
|  Precondition     | Account A exists 		|
|  Post condition   | User U not logged in  |
|  Step#        	| Description  			|
|  1	 |  Application asks for E-mail, password 		|
|  2     |  U inserts the credentials (e-mail and password) of the account A 	|  
|  3     |  U confirms the inserted data 				|
|  4     |  The application checks the credentials 		|
|  5   	 |  Application shows an error message to alert the user that the inserted password is wrong |

##### Scenario 2.3
| Scenario |  Login (exception: password expired) |
| ------------- |:-------------:| 
|  Precondition     | Account A exists 		|
|  Post condition   | User U not logged in  |
|  Step#        	| Description  			|
|  1	 |  Application asks for E-mail, password 		|
|  2     |  U inserts the credentials (e-mail and password) of the account A 	|  
|  3     |  U confirms the inserted data 				|
|  4     |  The application checks the credentials 		|
|  5   	 |  Application shows an error message to alert the user that the inserted password is expired and must be updated. The system sends an email to the IT Manager in order to update the password |
|  6	 |  User U not logged in |

##### Scenario 2.4
| Scenario |  Login (exception: account not defined) |
| ------------- |:-------------:| 
|  Precondition     | Account A does not exists 		|
|  Post condition   | User U not logged in  			|
|  Step#        	| Description  						|
|  1	 |  Application asks for E-mail, password 		|
|  2     |  U inserts the credentials (e-mail and password) of the account A 	|  
|  3     |  U confirms the inserted data 				|
|  4     |  The application checks the credentials 		|
|  5   	 |  Application shows an error message to alert the user that the account associated to the inserted credentials is not defined   |
|  6	 |  User U not logged in |

##### Scenario 2.5
| Scenario |  Logout (variant) |
| ------------- |:-------------:| 
|  Precondition     | Account A exists, User U logged in  |
|  Post condition   | User U logged off  |
|  Step#        	| Description  		|
|  1	 |  User U wants to log off		|
|  3     |  U clicks on the "Logout" button			      |
|  5   	 |  User U logged off |

### Use case 3, UC3 - Item management

| Actors Involved        | Manager, Employee, Item |
| ------------- |:-------------:|
|  Precondition     |  Manager (or Employee) is logged in          	|
|  Post condition   |             						|  
|  Nominal Scenario |  Add new item in a warehouse (bar code)	|
|  Variants			|  Add manually a new item in a warehouse	|
|					|  Modify item information					|
|					|  Check item information					|
|					|  Delete item from warehouse				|
|  Exceptions		|  Add new item in a warehouse - exception, |

##### Scenario 3.1
| Scenario |  Add new item in a warehouse (bar code) |
| ------------- |:-------------:|
|  Precondition     | Employee E logged in, item I does not exist in a warehouse  |
|  Post condition   | item I added in a warehouse           |
|  Step#        	| Description  		|
|  1	 |  E reads the item barcode with the bar code scanner	|
|  2     |  U clicks on the "Add" button					    |
|  3   	 |  Item I added in the warehouse 						|

##### Scenario 3.2
| Scenario |  Add manually a new item in a warehouse|
| ------------- |:-------------:|
|  Precondition     | Manager M logged in, item I does not exist in a warehouse  |
|  Post condition   | item I added in a warehouse           |
|  Step#        	| Description  		|
|  1	 |  Application asks for item ID, descriptor |
|  2	 |  M selects the warehouse where the item will be stored, inserts item ID and selects/inserts the associated item descriptor  |
|  3     |  M confirms							|
|  4   	 |  Item I added in the warehouse 		|

##### Scenario 3.3
| Scenario |  Add new item in a warehouse - exception |
| ------------- |:-------------:|
|  Precondition     | Manager M logged in, item I exist in a warehouse  |
|  Post condition   | item I not added in a warehouse           |
|  Step#        	| Description  		|
|  1	 |  Application asks for item ID, descriptor, warehouse |
|  2	 |  M selects the warehouse where the item will be stored, inserts item ID and selects/inserts the associated item descriptor	|
|  3     |  M clicks on the "Add" button		 |
|  4   	 |  Application shows an error message to alert the Manager that the item already exists in the selected warehouse  |
|  5   	 |  Item I not added in the warehouse 		|

##### Scenario 3.4
| Scenario | Show item information |
| ------------- |:-------------:|
|  Precondition     | Manager M logged in, item I exist     |
|  Post condition   | item I information showed             |
|  Step#        	| Description  		|
|  1	 |  Application shows an item list		|
|  2	 |  M selects the desired item 			|
|  3     |  Application shows item informations	|

##### Scenario 3.5
| Scenario |  Modify item information |
| ------------- |:-------------:|
|  Precondition     | Manager M logged in, item I exist     |
|  Post condition   | item I modified                       |
|  Step#        	| Description  		|
|  1	 |  Application shows an item list		|
|  2	 |  M selects the desired item 			|
|  3     |  Application shows item informations	|
|  4   	 |  M modifies the item informations	|
|  5	 |  M confirms							|
|  6	 |  Item I updated						|

##### Scenario 3.6 

| Scenario | Delete item from warehouse |
| ------------- |:-------------:| 
|  Precondition     | Manager M is logged in, Item I exists	 |
|  Post condition   | Item is deleted				 		 |
|  Step#       	    | Description  |
|  1	 |  Application shows an item list		|
|  2	 |  M selects the desired item 			|
|  3	 |  M confirms							|
|  4	 |  Item I deleted						|

### Use case 4, UC4 - List available items 

| Actors Involved        | Employee, Item |
| ------------- |:-------------:|
|  Precondition     |  Employee E is logged in          	|
|  Post condition   |             								|  
|  Nominal Scenario |  Show available item list					|
|  Variants			|  Show available item list using filters	|

##### Scenario 4.1 
| Scenario | Show available item list |
| ------------- |:-------------:|
|  Precondition     | Employee E is logged in   		     |
|  Post condition   | List of item showed          		     |
|  Step#        	| Description  		|
|  1	 |  E wants to look at the available items							|
|  2	 |  Application shows an item list	looking for the available ones	|

##### Scenario 4.2 
| Scenario | Show available item list (filter based) |
| ------------- |:-------------:|
|  Precondition     | Employee E is logged in   		     |
|  Post condition   | Filtered list of item showed         	 |
|  Step#        	| Description  		|
|  1	 |  E wants to look at the available items							|
|  2	 |  E selects the filters											|
|  3	 |  Application shows a filtered item list, looking for the available ones	|

### Use case 5, UC5 - CRUD Internal order 

|  Actors Involved        | Manager, Item, Employee|
|  ------------- |:-------------:|
|  Precondition		  | (Organizational Unit) Employee E logged in, a collection of items exists in the warehouses |
|  Post condition     | Internal Order O is added, modified or deleted	|
|  Nominal Scenario   | Add internal order   	|
|  Variants			  | Modify internal order	|
|					  | Cancel internal order 	|

##### Scenario 5.1
| Scenario |  Add internal order |
| ------------- |:-------------:| 
|  Precondition     | Employee E is logged in, internal order O does not exists  	 |
|  Post condition   | Internal Order O is added  |
|  Step#        	| Description  			|
|  1	 |  Application asks E to select an item that is available								|
|  2     |  E select the item(s) with their quantity |
|  3   	 |  E confirms the internal order request												|
|  4	 |  Internal Order O is added	|

##### Scenario 5.2
| Scenario |  Modify internal order |
| ------------- |:-------------:| 
|  Precondition     | Employee E is logged in, internal order O exists  		|
|  Post condition   | Internal Order O is modified  |
|  Step#        	| Description  			|
|  1	 |  Application asks to select the internal order that needs to be modified								|
|  2     |  E updates the items with their quantity |
|  3   	 |  E confirms the internal order modification |
|  4	 |  Internal Order O is modified	|

##### Scenario 5.3
| Scenario |  Cancel internal order |
| ------------- |:-------------:| 
|  Precondition     | Employee E is logged in, internal order O exists  		 |
|  Post condition   | Internal Order O does not exists  	 |
|  Step#        	| Description  			|
|  1	 |  Application asks to select the internal order (showing only the ones created by the employee's Organizational Unit) that needs to be deleted |
|  2     |  E selects the order |
|  3   	 |  E confirms			|
|  4	 |  Internal Order O is cancelled	|

### Use case 6, UC6 - Manage Internal order 

|  Actors Involved        | Manager, Item, Employee|
|  ------------- |:-------------:|
|  Precondition		  | User (Manager or Employee) logged in, internal order O exists  |
|  Post condition     | 	|
|  Nominal Scenario   | Set order status to "Delivered to pick up area" |
|  Variants			  | Set order status to "Completed" |

##### Scenario 6.1
| Scenario | Set order status to "Delivered to pick up area" |
| ------------- |:-------------:| 
|  Precondition     | Employee E is logged in, internal order O exists with status "not delivered", items requested are available  	 |
|  Post condition   | Internal Order O status is set to "Delivered to pick up area"  |
|  Step#        	| Description  			|
|  1	 |  Application shows the internal order informations: all the items requested are available and their position is known |
|  2   	 |  E collects the items requested by the internal order |
|  3	 |  E scans the bar code of each item		  |
|  4	 |  The application sets the items requested to "not available" and decreases the quantities of available items |
|  3     |  The internal order status is set as "delivered to pick up area" by E1 |
|  5	 |  Internal Order O is delivered to pick up area	|

##### Scenario 6.2
| Scenario | Set order status to "Completed" |
| ------------- |:-------------:| 
|  Precondition     | (Warehouse) Employee E1 is logged in, (Other OU) Employee E2 exists, internal order O exists with status "delivered to pick up area"|
|  Post condition   | Internal Order O status is completed  |
|  Step#        	| Description  			|
|  1	 |  E2 arrives in the pick up area to collect the internal order |
|  2   	 |  E2 authenticates |
|  3   	 |  E2 collects the items requested by the internal order |
|  4     |  The internal order status is set as "Completed" by E1 |
|  5	 |  Internal Order O is completed	|




### Use case 7, UC7 - Quality test 

| Actors Involved        |  Items, Quality Office employee|
| ------------- |:-------------:|
|  Precondition     |           item I exists and it has not yet been tested                                |
|  Post condition     |              item been tested                        |
|  Nominal Scenario     | Quality Office employees test the chosen item and test whether the quality is good or not |
|  Variants     | After the item been tested, it will be add to the warehouse if quality is good |

##### Scenario 6.1 

| Scenario |  Item's quality is good |
| ------------- |:-------------:| 
|  Precondition     | item I exists and it has not yet been tested  |
|  Post condition     | item been tested   |
| Step#        | Description  |
|  1     |  Quality Office employees selects item I|  
|  2     |  Quality Office employees choose a type of test to test the quality of I|
|  3    |  Item I pass the test |
|  4    |  Item I been added to warehouse |

##### Scenario 6.2 

| Scenario |  Item's quality is not good |
| ------------- |:-------------:| 
|  Precondition     | item I exists and it has not yet been tested  |
|  Post condition     | item been tested   |
| Step#        | Description  |
|  1     |  Quality Office employees selects item I|  
|  2     |  Quality Office employees choose a type of test to test the quality of I|
|  3    |  Item I not pass the test |
|  4    |  Item I been rejected and sent back to the supplier |


### Use case 9, UC9 - Issue an order 

| Actors Involved        | Manager, Item, Payment service |
| ------------- |:-------------:|
|  Precondition     |            Item I exists in the warehouse and it is in short supply                            |
|  Post condition     |        The order is issued | 
| | Physical space in warehouse is updated       |
|  Nominal Scenario     | The manager chooses a supplier from the list of supplier for the selected item and orders the quantity needed |
| Exceptions | The order cannot be issued because there's not enough physical space in the warehouse|




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




