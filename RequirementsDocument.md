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
|	Competitors		| Other applications that provide similar services|
|	Item			| Product that must be managed in the warehouse|
|	IT manager		| Will be the one to manage the application and its correct use and functionality|
|	Employee 		| Are the users of the application on a base level and represent the OU when making orders|


# Context Diagram and interfaces

## Context Diagram
\<Define here Context diagram using UML use case diagram>


Actors: Employee, Manager, IT Manager, Quality Office employee, Supplier, Item, Payment service

## Interfaces

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| :-----:|
| Employee 		| Graphical User Interface | Screen, Keyboard |
| Manager		| Graphical User Interface | Screen, keyboard |
| IT Manager	| Graphical User Interface | Screen, keyboard |
| Quality Office employee	| Graphical User Interface | Screen, Keyboard |
| Supplier 		| Graphical User Interface | Screen, Keyboard |
| Item			| ReadBarCode  | Laser Beam (Bar Code Reader) |

# Stories and personas
\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>


# Functional and non functional requirements

## Functional Requirements

| ID        | Description  |
| ------------- |:-------------:| 
|  FR1 		| User Management |
|   FR1.1 	| User registration|
|  	  FR1.1.1	| Send user sign up request |
|	FR1.2 	|User Authentication|
|   	FR1.2.1 | User Log in|
| 		FR1.2.2 | User level of access authentication |
|   FR1.3 	| User Log out|
|	FR1.4 	| User profile management|
|  FR3 		| Warehouse management|
|   FR3.1 	| Item management|
|	 FR3.1.1 	| Internal Order management|
| 	  FR3.1.1.1 	| Add a new order |
| 	  FR3.1.1.2 	| Complete an existing order |
| 	  FR3.1.1.3 	| Cancel an order |
| 	  FR3.1.1.4 	| List order log |
| 	   FR3.1.1.4.1 	| Filter order log based on order information |
| 	 FR3.1.2 	| List available items|
| 	  FR3.1.2.1 	| Filter based upon item information |
| 	 FR3.1.3	| Add new item to warehouse |
|	  FR3.1.3.1		| Add using bar code |
|	 FR3.1.4 	| Delete item from warehouse |
|	 FR3.1.5 	| Modify or check item information |
|	  FR3.1.5.1 	| Show item information  |
| 	  FR3.1.5.2 	| Modify item information  |
| 	 FR3.1.6 	| Low supply notification |
|	 FR3.1.7 	| Order to a supplier management|
| 	FR3.2 	| Add a new warehouse |
| 	FR3.3 	| Remove a warehouse |
| 	FR3.4 	| Modify warehouse information |
| 	FR3.5 	| List warehouses |
| 	FR3.6 	| Drop Point Management |
| 	  FR3.6.1	| Add drop point 	|
| 	  FR3.6.2	| Delete Drop Point |
| 	  FR3.6.2	| List Drop Points 	|
|  FR4		| Manage suppliers |
|	 FR4.1 	| Add new supplier to record|
| 	  FR4.1.1 	| Create new supplier account|
|	 FR4.2 	|List suppliers|
|	  FR4.2.1 	| Filter suppliers based on items|
|	FR4.3 	|List supplier's incoming orders|
|  FR5 		| Manage quality check |
|	 FR5.1 	| List items in the quality office domain |
| 	  FR5.1.1 | Filter based on type of test 	|
| 	 FR5.2 	| Test management |
| 	  FR5.2.1 | Add new test |
| 	  FR5.2.2 | Remove a test |
| 	  FR5.2.3 | Modify a test |
| 	   FR5.2.3.1 | Change test properties |
| 	   FR5.2.3.2 | Manage items to be tested |
|		FR5.2.3.2.1 | Add item to test |
| 		FR5.2.3.2.2 | Remove item from test |
| 		FR5.2.3.2.3 | Test History			|
| 		FR5.2.3.2.4 | List items in the test |
|		 FR5.2.3.2.4.1 | Filter based on item result|

| ------------- |:-------------:| 

### Access right, actor vs function

| Function | Employee | Manager | IT Manager | Quality Office Employee | Supplier |
| -------- | ----- | ------------ | ------- | --------| ------------|
| FR1.1 | no | yes | yes | no | no |
| FR1.1.1 | yes | yes | yes | yes | yes|
| FR1.2 | yes  | yes |  yes | yes | yes|
| FR1.3 | yes  | yes |  yes | yes | yes|
| FR1.4 | no | no | yes | yes | no |
| FR3.1 | yes  | yes |  yes | no | no |
| FR3.1.1 | yes  | yes |  yes | no | no |
| FR3.1.5.1 | yes  | yes |  yes | yes | yes |
| FR3.1.5.1 | no  | yes |  yes | yes | yes |
| FR3.1.7 | no  | yes |  yes | no | no |
| FR3.2, FR3.3, FR3.4, FR3.5, FR3.6| no  | yes |  yes | no | no |
| FR4 | no | yes | yes | no| no |
| FR4.2 | yes  | yes |  yes | yes | yes|
| FR4.3 | no  | no |  yes | no | yes|
| FR5 | no  | yes|  yes| yes | no |


## Non Functional Requirements


| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----| :-----:|
|  NFR1     | Usability |   A manager should be able to use all the system functions after two hours training| All FR |
|  NFR2.1     | Efficiency |  Following functional requirements should be completed in less than ½ sec | FR3.1, FR3.2, FR3.3, FR3.4, FR3.5, FR3.6, FR5.2.X|
|  NFR2.2     | Efficiency | Following functional requirements should require less than 1 sec| FR1, FR3.1.1.6, FR3.1.2, FR3.6.2, FR4.2, FR4.3, FR5.1, FR5.2.3.2.4 |
| NFR2.3 | Efficiency | Menu navigation must be not percepted (response time < 0.1 sec)| All FR | 
| NFR2.4 | Efficiency | The application should meet the previous performance requirements when there are less than 1000 users connected per hour| All FR |
| NFR2.5 | Efficiency | Application size < 100 MB| All FR |
| NFR3.1	| Reliability		| Mean Time Between Failure > 20 days | All FR |
| NFR3.2	| Reliability		| The application must be available to users 98 % of the time (during working hours [Mon – Fri, 08:00 – 19:00] ) every month | All FR |
| NFR4.1	| Maintainability	| An error should be fixed, 80% of the times, in less than 24 hours| All FR |
| NFR4.2	| Maintainability	| About 20 person hours needed to fix a major defect | All FR |
| NFR5.1	| Security		| Personal data must be processed in compliance with the GDPR. <br>GDPR: https://eur-lex.europa.eu/eli/reg/2016/679/oj| All FR |
| NFR5.2	| Security		| Only authorized users can access to the data. Users must authenticate themselves using their credentials (e-mail + secure password). Basic user must not be able to exploit Manager tasks. <br><br>Secure password constraints: <br>- Minimum length greater (or equal) than 12 characters <br> - Must include: [at least 1 special symbol (e.g. @_#$%), Numbers, Lowercase & Uppercase characters]. <br> - Must be changed every 10 months| All FR |
| NFR6	| Portability		| The application should run on the majority of the most used browsers in their secure versions <br>(Firefox 88+, Chrome 93+, Safari (macOS) 11.1.1+, Safari (iOS) 12.4.3+, Opera 72+)| All FR |
| NFR7	| Domain	| The Bar Code number is an UPC-A 12 digits Code. Implementation details can be found at the following link:<br> https://www.gs1.org/docs/barcodes/GS1_General_Specifications.pdf | All FR |
| NFR8	| Domain 	| Currency is Euro | FR2 |


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


### Use case 1, UC1 - Manage User Account
| Actors Involved        | IT Manager, Employee E |
| ------------- |:-------------:|
|  Precondition     |  IT Manager M exists and is logged in |
|					|  Employee E exists 		   			|
|  Post condition   |                        										    |  
|  Nominal Scenario |  M creates registers a new user account and its access rights		|
|  Variants			|  M modifies an user that is already registered					|
|  					|  M deletes an	user												|
|  					|  E sends an user sign up request									|

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
| 					| Account A exists						|
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
|  3   	 |  M confirms the action 				|

##### Scenario 1.4
| Scenario |  Send user sign up request |
| ------------- |:-------------:| 
|  Precondition     | IT Manager M exists		|
|					| Employee E wants to sign up 	|
|  Post condition   | Account A is created  	|
|  Step#        	| Description  				|
|  1	 |  Application asks for Company Name, E-mail, Name, Surname, Password 	|
|  2     |  E inserts the credentials of the account A	 										| 
|  3     |  E reads and accepts the user agreement		 										|
|  4   	 |  An e-mail is sent to the IT Manager to notify a "sign up request" 					|

### Use case 2, UC2 - Authorize and Authenticate
| Actors Involved   | IT Manager, Manager, Employee, Supplier |
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
|  1	 |  Application asks for E-mail/username, password 		|
|  2     |  U inserts the credentials  of the account A |  
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
|  Precondition     | Account A exists	|
|					| User U (Employee, Manager, IT Manager, Supplier) logged in  |
|  Post condition   | User U logged off |
|  Step#        	| Description  		|
|  1	 |  User U wants to log off			|
|  2     |  Employee logs out				|
|  3   	 |  Application shows login page 	|

### Use case 3, UC3 - Item management

| Actors Involved        | Manager, Employee, Item |
| ------------- |:-------------:|
|  Precondition     |  Manager (or Employee) is logged in          	|
|  Post condition   |             								|  
|  Nominal Scenario |  Add manually a new item in supplier's offered item list |
|  Variants			|  Add new item in a warehouse (bar code)	|
|					|  Modify item information					|
|					|  Check item information					|
|					|  Delete item from warehouse				|
|					|  Show available item list					|
|					|  Show available item list using filters	|
|  Exceptions		|  Add new item in a warehouse - exception  |

##### Scenario 3.1
| Scenario |  Add manually a new item in supplier's offered item list|
| ------------- |:-------------:|
|  Precondition     | Supplier S logged in	|
|					| item I does not exist in supplier's offered item list  |
|  Post condition   | item I added in a warehouse           |
|  Step#        	| Description  			|
|  1	 |  Application asks for item informations (Name, Description, price per unit etc) |
|  3     |  M confirms the inserted/selected data		 |
|  4   	 |  Item I added in the "supplier's offered item" list 				 |

##### Scenario 3.2
| Scenario |  Add new item in a warehouse (bar code) |
| ------------- |:-------------:|
|  Precondition     | Employee E logged in|
|					| item I does not exist in a warehouse  |
|					| warehouse has enough space to hold item I  |
|  Post condition   | item I added in a warehouse           |
|  Step#        	| Description  		|
|  1	 |  E reads the item barcode with the bar code scanner	|
|  2     |  E confirms										    |
|  3   	 |  Item I added in the warehouse 						|

##### Scenario 3.3
| Scenario |  Add new item in a warehouse - exception |
| ------------- |:-------------:|
|  Precondition     | Employee E logged in	|
|					| item I exist in a warehouse  |
|  Post condition   | item I not added in a warehouse           |
|  Step#        	| Description  		|
|  1	 |  E scans the item's barcode					 |
|  3     |  M confirms		 |
|  4   	 |  Application shows an error message to alert the Manager that the item already exists in the selected warehouse  |
|  5   	 |  Item I not added in the warehouse 			 |

##### Scenario 3.4
| Scenario | Show item information |
| ------------- |:-------------:|
|  Precondition     | Employee E logged in	|
|					| item I exist    		|
|  Post condition   | item I information showed             |
|  Step#        	| Description  			|
|  1	 |  Application shows an item list		|
|  2	 |  E selects the desired item 			|
|  3     |  Application shows item informations	|

##### Scenario 3.5
| Scenario |  Modify item information |
| ------------- |:-------------:|
|  Precondition     | Manager M logged in	|
|					| item I exist    		|
|  Post condition   | item I modified       |
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
|  Precondition     | Manager M is logged in	 |
|					| item I exist    		|
|  Post condition   | Item is deleted				 		 |
|  Step#       	    | Description  |
|  1	 |  Application shows an item list		|
|  2	 |  M selects the desired item 			|
|  3	 |  M confirms							|
|  4	 |  Item I deleted						|

##### Scenario 3.7
| Scenario | Show available item list |
| ------------- |:-------------:|
|  Precondition     | Employee E is logged in   		     |
|  Post condition   | List of item showed          		     |
|  Step#        	| Description  		|
|  1	 |  E wants to look at the available items							|
|  2	 |  Application shows an item list	looking for the available ones	|

##### Scenario 3.8
| Scenario | Show available item list (filter based) |
| ------------- |:-------------:|
|  Precondition     | Employee E is logged in   		     |
|  Post condition   | Filtered list of item showed         	 |
|  Step#        	| Description  		|
|  1	 |  E wants to look at the available items							|
|  2	 |  E selects the filters											|
|  3	 |  Application shows a filtered item list, looking for the available ones	|

### Use case 4, UC4 - CRUD Internal order 

|  Actors Involved        | Manager, Item, Employee|
|  ------------- |:-------------:|
|  Precondition		  | (Organizational Unit) Employee E logged in		|
|  Post condition     | Internal Order O is added, modified or deleted	|
|  Nominal Scenario   | Add internal order   	|
|  Variants			  | Modify internal order	|
|					  | Cancel internal order 	|

##### Scenario 4.1
| Scenario |  Add internal order |
| ------------- |:-------------:| 
|  Precondition     |  OU Employee E is logged in	|
|					| internal order O does not exists  	 |
|  Post condition   | Internal Order O is added |
|  Step#        	| Description  			|
|  1	 |  Application asks E to select an item that is available		|
|  2     |  E select the item(s) and their amount						|
|  3   	 |  E confirms the internal order request						|
|  4	 |  Internal Order O is added									|

##### Scenario 4.2
| Scenario |  Modify internal order |
| ------------- |:-------------:| 
|  Precondition     | OU Employee E is logged in 		|
|					| internal order O exists  		|
|  Post condition   | Internal Order O is modified  |
|  Step#        	| Description  			|
|  1	 |  Application asks to select the internal order that needs to be modified								|
|  2     |  E updates the items with their quantity 	|
|  3   	 |  E confirms the internal order modification  |
|  4	 |  Internal Order O is modified				|

##### Scenario 4.3
| Scenario |  Cancel internal order |
| ------------- |:-------------:| 
|  Precondition     | OU Employee E is logged in		|
|					| internal order O exists  		|
|  Post condition   | Internal Order O does not exists  	 |
|  Step#        	| Description  			|
|  1	 |  E looks at the order list 	  |
|  2	 |  E selects a specific order 	  |
|  3   	 |  Applications shows the order details 	  |
|  4   	 |  E cancels the order		 	  |
|  5	 |  Internal Order O is cancelled |


### Use case 5, UC5 - Manage Internal order 

|  Actors Involved        | Item, Employee|
|  ------------- |:-------------:|
|  Precondition		  | User (Manager or Employee) logged in |
|					  | internal order O exists  		     |
|  Post condition     | 	|
|  Nominal Scenario   | Set order status to "Delivered to pick up area" |
|  Variants			  | Set order status to "Completed" |
|  					  | Set order status to "Cancelled" |
|  					  | Set order status to "On Going"  |
|					  | Show internal order item list	|

##### Scenario 5.1
| Scenario | Set order status to "Delivered to pick up area" |
| ------------- |:-------------:| 
|  Precondition     | Employee E is logged in 	|
|					| internal order O exists with status "On Going" |
|					| items requested are available  	 |
|  Post condition   | Internal Order O status is set to "Delivered to pick up area"  |
|  Step#        	| Description  			|
|  1	 |  Application shows the internal order informations: all the items requested are available and their position is known |
|  2   	 |  E collects the items requested by the internal order |
|  3	 |  E scans the bar code of each item		  |
|  4	 |  The application sets the items requested to "not available" and decreases the quantities of available items |
|  5     |  The internal order status is set as "delivered to pick up area"  |
|  6	 |  Internal Order O is delivered to pick up area	|

##### Scenario 5.2
| Scenario | Set order status to "Completed" |
| ------------- |:-------------:| 
|  Precondition     | (Warehouse) Employee E1 is logged in  |
|					| (Other OU) Employee E2 exists 		|
|					| internal order O exists with status "delivered to pick up area"|
|  Post condition   | Internal Order O status is completed  |
|  Step#        	| Description  			|
|  1	 |  E2 arrives in the pick up area to collect the internal order |
|  2   	 |  E2 authenticates |
|  3   	 |  E2 collects the items requested by the internal order |
|  4     |  The internal order status is set as "Completed"		  |
|  5	 |  Internal Order O is completed	|

##### Scenario 5.3
| Scenario | Set order status to "Cancelled" |
| ------------- |:-------------:| 
|  Precondition     | Employee E is logged in	|
|					| internal order O exists 	|
|  Post condition   | Internal Order O is cancelled  |
|  Step#        	| Description  			|
|  1	 |  A "cancel order" notification arrives 	  |
|  2	 |  Internal Order O is cancelled			  |

##### Scenario 5.4
| Scenario | Show internal order item list |
| ------------- |:-------------:|
|  Precondition     | Employee E is logged in   		     |
|  Post condition   | list of item showed         	 |
|  Step#        	| Description  		|
|  1	 |  E wants to look at the items ordered by an OU	|
|  2	 |  E selects the internal order	|
|  3	 |  Application shows an item list	|


### Use case 6, UC6 - Manage Suppliers 

|  Actors Involved        | Manager, Supplier |
|  ------------- |:-------------:|
|  Precondition		  | Manager M is logged in  |
|  Post condition     | Supplier S is added, modified or deleted	|
|  Nominal Scenario   | Add new supplier	   	|
|  Variants			  | Modify supplier			|
|					  | Delete supplier		 	|
|					  | Show supplier informations 	|

##### Scenario 6.1
| Scenario |  Add new supplier |
| ------------- |:-------------:|
|  Precondition     | Manager M logged in |
|					| Supplier S does not exists in the system	|
|  Post condition   | Supplier S added  |
|  Step#        	| Description  		|
|  1	 |  M wants to add a new supplier in the system			|
|  2     |  M inserts name, address, phone number			    |
|  3     |  M confirms the inserted data					    |
|  4   	 |  S added in the system	 							|

##### Scenario 6.2
| Scenario |  Modify supplier |
| ------------- |:-------------:|
|  Precondition     | Manager M logged in |
|					| Supplier S exists in the system	|
|  Post condition   | Supplier S modified   |
|  Step#        	| Description  			|
|  1	 |  M wants to modify a supplier						|
|  2     |  M modifies the supplier informations			    |
|  3     |  M confirms the updated data						    |
|  4   	 |  S modified				 							|

##### Scenario 6.3
| Scenario |  Delete supplier |
| ------------- |:-------------:|
|  Precondition     | Manager M logged in |
|					| Supplier S exists in the system	|
|  Post condition   | Supplier S deleted  |
|  Step#        	| Description  		|
|  1	 |  M wants to delete a supplier in the system			|
|  2     |  M selects the supplier							    |
|  3     |  M confirms the operation						    |
|  4   	 |  S deleted				 							|

##### Scenario 6.4
| Scenario |  Show supplier informations |
| ------------- |:-------------:|
|  Precondition     | Manager M logged in |
|					| Supplier S exists in the system	|
|  Post condition   | Supplier S information are shown			|
|  Step#        	| Description  								|
|  1	 |  M wants to supplier informations					|
|  2     |  M selects the supplier							    |
|  3     |  Application shows supplier informations			    |


##### Scenario 6.5
| Scenario |  Filter suppliers based on items |
| ------------- |:-------------:|
|  Precondition     | Manager M logged in |
|					| Item I exists in the system	|
|  Post condition   | Suppliers for each item are shown			|
|  Step#        	| Description  								|
|  1	 |  M selects a specific item							|
|  3     |  Application shows suppliers for the selected item   |

### Use case 7, UC7 - Perform quality test 

| Actors Involved        |  Items, Quality Office employee|
| ------------- |:-------------:|
|  Precondition     |           item I exists and it has not yet been tested                                |
|  Post condition     |              item been tested                        |
|  Nominal Scenario     | Quality Office employees test the chosen item and test whether the quality is good or not |
|  Variants     | After the item been tested, it will be add to the warehouse if quality is good |

##### Scenario 7.1 

| Scenario |  Item's quality is good |
| ------------- |:-------------:| 
|  Precondition     | item I exists and it has not yet been tested  |
|  Post condition     | item been tested   |
| Step#        | Description  |
|  1     |  Quality Office employee selects item I|  
|  2     |  Quality Office employee chooses a type of test to test the quality of I|
|  3    |  Item I pass the test |
|  4    |   Quality Office employee set the status "Passed" for Item I|
|  5	|  Item I is added to warehouse |

##### Scenario 7.2 

| Scenario |  Item's quality is not good |
| ------------- |:-------------:| 
|  Precondition     | item I exists and it has not yet been tested  |
|  Post condition     | item been tested   |
| Step#        | Description  |
|  1     |  Quality Office employees selects item I|  
|  2     |  Quality Office employees choose a type of test to test the quality of I|
|  3    |  Item I not pass the test |
|  4    |   Quality Office employee set the status "Failed" for Item I|
|  5    |  Item I is rejected and sent back to the supplier |

### Use case 8, UC8 - Manage Tests

|  Actors Involved        | Quality Test Employee|
|  ------------- |:-------------:|
|  Precondition		  | Quality Test Employee E logged in  |
|  Post condition     | Test is added, modified or deleted	|
|  Nominal Scenario   | Add new test	   	|
|  Variants			  | Modify test			|
|					  | Delete test		 	|

##### Scenario 8.1
| Scenario |  Add new test |
| ------------- |:-------------:|
|  Precondition     | Quality Test Office Employee QE is logged in |
|					| Test T does not exists in the system	|
|  Post condition   | Test T added  |
|  Step#        	| Description  		|
|  1	 |  QE wants to add a new test in the system			|
|  2     |  QE inserts name and description		    |
|  3     |  QE confirms the inserted data					    |
|  4   	 |  T added in the system 							|

##### Scenario 8.2
| Scenario |  Modify test |
| ------------- |:-------------:|
|  Precondition     | Quality Test Office Employee QE is logged in |
|					| Test T exists in the system	|
|  Post condition   | Test T modified   |
|  Step#        	| Description  			|
|  1	 |  QE wants to modify a test						|
|  2	 |  QE selects the test to be modified from the list of tests in the system |
|  3     |  QE modifies the test informations (name and/or description)			    |
|  4     |  QE confirms the updated data						    |
|  5   	 |  T modified				 							|

##### Scenario 8.3
| Scenario |  Delete test |
| ------------- |:-------------:|
|  Precondition     | Quality Test Office Employee QE is logged in |
|					| Test T exists in the system	|
|  Post condition   | Test deleted  |
|  Step#        	| Description  		|
|  1	 |  QE wants to delete a test						|
|  2	 |  QE chooses the test to be deleted from the list of tests in the system |
|  3     |  QE confirms the operation						    |
|  4   	 |  T deleted			 							|

### Use case 9, UC9 - Manage Warehouse

|  Actors Involved        | Manager |
|  ------------- |:-------------:|
|  Precondition		  | Manager M is logged in		|
|  Post condition     | Warehouse W is added, modified or deleted	|
|  Nominal Scenario   | Add new warehouse  	|
|  Variants			  | Modify warehouse	|
|					  | Delete warehouse 	|
|					  | Show WH details	 	|

##### Scenario 9.1
| Scenario |  Add warehouse |
| ------------- |:-------------:| 
|  Precondition     | Manager M is logged in	|
|					| Warehouse W does not exists  	 |
|  Post condition   | Warehouse W is added |
|  Step#        	| Description  		|
|  1	 |  M wants to add a new warehouse in the system			|
|  2     |  M inserts name and address		    |
|  3     |  M confirms the inserted data					    |
|  4   	 |  W added in the system 							|

##### Scenario 9.2
| Scenario |  Modify warehouse |
| ------------- |:-------------:|
|  Precondition     | Manager M is logged in |
|					| Warehouse W exists in the system	|
|  Post condition   | Warehouse W modified   |
|  Step#        	| Description  			|
|  1	 |  M wants to modify a warehouse						|
|  2	 |  M selects the warehouse to be modified from the list of warehouses in the system |
|  3     |  M modifies the warehouse informations 		    |
|  4     |  M confirms the updated data						    |
|  5   	 |  W modified				 							|

##### Scenario 9.3
| Scenario |  Delete warehouse |
| ------------- |:-------------:|
|  Precondition     | Manager M is logged in |
|					| Warehouse W exists in the system	|
|  Post condition   | Warehouse deleted  |
|  Step#        	| Description  		|
|  1	 |  M wants to delete a warehouse						|
|  2	 |  M chooses the warehouse to be deleted from the list of warehouses  in the system |
|  3     |  M confirms the operation						    |
|  4   	 |  W deleted			 							|

##### Scenario 10.4
| Scenario | Show WH Details	|
| ------------- |:-------------:|
|  Precondition     | Employee E is logged in		 |
|  Post condition   | Application shows the list 	|
|  Step#        	| Description  		|
|  1	 |  S wants to see his orders						|
|  2	 |  Application shows a list of managers, items, suppliers and shows the position on a map	|

### Use case 10, UC10 - Issue an order to Supplier

|  Actors Involved        | Manager, Item, Supplier |
|  ------------- |:-------------:|
|  Precondition		  | Manager M is logged in		|
|  Post condition     | The order of item I is successfully sent 				|
|  Nominal Scenario   | The order is issued  	|
|  Variants			  | List supplier's incoming orders	|
|  Exceptions		  | The order cannot be issued because there is not enough space in the warehouse	|


##### Scenario 10.1
| Scenario |  Issue an order successfully after notification |
| ------------- |:-------------:| 
|  Precondition     | Manager M is logged in	|
|					| Item I is in short supply  	 |
|  Post condition   | The order of item I is successfully sent |
|  Step#        	| Description  		|
|  1	 |  M gets notified that item I is in short supply			|
|  2     |  M decides to issue an order for item I		    |
|  3     |  M presses on the notification					    |
|  4   	 |  M selects the supplier from the suppliers list of the selected item							|
|  5   	 |  M chooses the quantity to be ordered of the selected item 							|
|  6   	 |  M confirms the data entered 					|
|  7  	 |  The system checks that there is enough space in the warehouse for the order to be issued |
|  8	 |  The order is successfully issued |

##### Scenario 10.2
| Scenario |  Issue an order unsuccessfully after notification |
| ------------- |:-------------:| 
|  Precondition     | Manager M is logged in	|
|					| Item I is in short supply  	 |
|  Post condition   | The order of item I is successfully sent |
|  Step#        	| Description  		|
|  1	 |  M gets notified that item I is in short supply			|
|  2     |  M decides to issue an order for item I		    |
|  3     |  M presses on the notification					|
|  4   	 |  M selects the supplier from the suppliers list of the selected item							|
|  5   	 |  M chooses the quantity to be ordered of the selected item 							|
|  6   	 |  M confirms the data entered 					|
|  7 	 |  The system notifies M that there is not enough space in the warehouse for the required quantity				|
|  8 	 |  M updates the quantity (M selects a smaller quantity) |
|  9   	 |  M confirms the data entered 					|
|  10 	 |  The system checks that there is enough space in the warehouse for the order to be issued |
|  11	 |  The order is successfully issued |

##### Scenario 10.3
| Scenario |  Issue an order successfully without notification |
| ------------- |:-------------:| 
|  Precondition     | Manager M is logged in	|
|  Post condition   | The order of item I is successfully sent |
|  Step#        	| Description  		|
|  1     |  M decides to issue an order for item I		    |
|  2   	 |  M selects the supplier from the suppliers list of the selected item							|
|  3   	 |  M chooses the quantity to be ordered of the selected item 							|
|  4   	 |  M confirms the data entered 					|
|  5  	 |  The system checks that there is enough space in the warehouse for the order to be issued |
|  6	 |  The order is successfully issued |

##### Scenario 10.4
| Scenario | List supplier's incoming orders	|
| ------------- |:-------------:|
|  Precondition     | Supplier S is logged in		 |
|  Post condition   | Application shows the list 	|
|  Step#        	| Description  		|
|  1	 |  S wants to see his orders						|
|  2	 |  Application shows a list of them, with order informations and their status (Read, New, Important etc) 	|


### Use case 11, UC11 - Manage Drop Point

|  Actors Involved        | Manager |
|  ------------- |:-------------:|
|  Precondition		  | Manager M is logged in		|
|  Post condition     | 			 				|
|  Nominal Scenario   | A new drop point is added  	|
|  Variants			  | A drop point is removed		|
|  Variants			  | List drop points			|

##### Scenario 11.1
| Scenario |  A new drop point is added |
| ------------- |:-------------:| 
|  Precondition     | Manager M is logged in	|
|					| Drop point D does not exists in the system  	 |
|  Post condition   | Drop point D exists in the system |
|  Step#        	| Description  		|
|  1	 |  M wants to add a new drop point in the system	|
|  2     |  M inserts name, address and additional instructions, if needed	|
|  3     |  M confirms the inserted data					|
|  4   	 |  D added in the system 							|

##### Scenario 11.2
| Scenario |  A drop point is removed |
| ------------- |:-------------:|
|  Precondition     | Manager M is logged in |
|					| Drop point D exists in the system  	 |
|  Post condition   | Drop point D does not exists in the system |
|  Step#        	| Description  		|
|  1	 |  M wants to delete a drop point						|
|  2	 |  M chooses the drop point to be deleted from a list of drop points |
|  3     |  M confirms the operation						    |
|  4   	 |  W deleted			 								|

##### Scenario 11.2
| Scenario |  list drop points |
| ------------- |:-------------:|
|  Precondition     | Manager M is logged in |
|  Post condition   | Application shows the list				|
|  Step#        	| Description  		|
|  1	 |  M wants to see all drop points						|
|  2	 |  Application shows a list of available drop points 	|


##### Use Case 12, UC12 - Manage items to be tested
|  Actors Involved        | Quality Office Employee E, Item I |
|  ------------- |:-------------:|
|  Precondition		  | Quality Office Employee E is logged in		|
|  Post condition     | 			 				|
|  Nominal Scenario   | Add item to test		 	|
|  Variants			  | Remove item from test 		|
|  					  | Test History				|
|					  | List tested items (filters)	|

##### Scenario 12.1
| Scenario |  Add item to test |
| ------------- |:-------------:|
|  Precondition     | Quality Office Employee E is logged in |
|					| Item I not tested						 |
|  Post condition   | Application adds the item to a specific test	 |
|  Step#        	| Description  		|
|  1	 |  E selects the item		|
|  2	 |  Application adds the item to the test	 	|

##### Scenario 12.2
| Scenario |  Remove item from test |
| ------------- |:-------------:|
|  Precondition     | Quality Office Employee E is logged in |
|					| Item I not tested						 |
|  Post condition   | Application removes the item from a specific test	 |
|  Step#        	| Description  		|
|  1	 |  Application shows a list of items				|
|  2	 |  E selects the item		|
|  3	 |  Application removes the item to the test	 	|

##### Scenario 12.3
| Scenario |  Test History |
| ------------- |:-------------:|
|  Precondition     | Quality Office Employee E is logged in |
|  Post condition   | Application shows the tests executed	 |
|  Step#        	| Description  		|
|  1	 |  M wants to see the test history		|
|  2	 |  Application shows a list of executed tests	 	|

##### Scenario 12.4
| Scenario |  List tested items (filters) |
| ------------- |:-------------:|
|  Precondition     | Quality Office Employee E is logged in |
|  Post condition   | Application shows the (filtered) items tested |
|  Step#        	| Description  		|
|  1	 |  M wants to see the tested items		|
|  2	 |  M selects a specific test 			|
|  3	 |  (optional) E selects/inserts the filters 	|
|  4	 |  Application shows a list of the items	 	|


# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the system, and their relationships> 

\<concepts are used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >




