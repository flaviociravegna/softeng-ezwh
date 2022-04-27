# Design Document 


Authors: 

Date:

Version:


# Contents

- [High level design](#package-diagram)
- [Low level design](#class-diagram)
- [Verification traceability matrix](#verification-traceability-matrix)
- [Verification sequence diagrams](#verification-sequence-diagrams)

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
FR6    |       |      |      |     x    |            |                |     x     |              |    x  ||x|
FR6.1    |       |      |  x    |         |            |                |          |              |      ||x|
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

