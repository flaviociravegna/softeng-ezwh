'use strict';

const sqlite = require('sqlite3');

class DatabaseConnection {
    static db = new sqlite.Database("./ezwh.db", (err) => { if (err) throw err; });

    static async createConnection() {
        await this.createTablePositions();
        await this.createTableRestockOrders();
        await this.createTableRestockOrdersProducts();
        await this.createTableRestockOrdersSKUItems();
        await this.createTableRestockOrderTransportNote();
        await this.createTableReturnOrders();
        await this.createTableReturnOrdersProducts();
        await this.createTableSKUItems();
        await this.createTableSKUs();
        await this.createTableTestDescriptors();
        await this.createTableTestResults();
        await this.createTableUsers();
        await this.createTableItems();
        await this.createTableInternalOrders();
        await this.createTableInternalOrdersSKUItems();
        await this.createTableInternalOrdersProducts();
        await this.deleteAllUsers();
        await this.populateTableUser();
    }

    static createTablePositions() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS Positions (positionID TEXT PRIMARY KEY UNIQUE NOT NULL, aisle TEXT, row TEXT, col TEXT, maxWeight INTEGER, maxVolume INTEGER, occupiedWeight INTEGER, occupiedVolume INTEGER);";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableRestockOrders() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS RestockOrders (id INTEGER PRIMARY KEY UNIQUE NOT NULL, issueDate TEXT, state TEXT, supplierID INTEGER, transportNote TEXT);";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableRestockOrdersProducts() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS RestockOrdersProducts (restockOrderID INTEGER, skuID INTEGER, quantity INTEGER, productID INTEGER, description TEXT, PRIMARY KEY (restockOrderID, productID));";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableRestockOrdersSKUItems() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS RestockOrdersSKUItems (restockOrderID INTEGER, RFID TEXT, PRIMARY KEY (restockOrderID, RFID));";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableRestockOrderTransportNote() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS RestockOrderTransportNote (RestockOrderID INTEGER NOT NULL, deliveryDate TEXT, PRIMARY KEY (RestockOrderID));";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableReturnOrders() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS ReturnOrders (id INTEGER PRIMARY KEY UNIQUE NOT NULL, returnDate TEXT, restockOrderID INTEGER);";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableReturnOrdersProducts() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS ReturnOrdersProducts (SKUId INTEGER, description TEXT, price NUMERIC, RFID TEXT, ReturnOrderID INTEGER, PRIMARY KEY (RFID, ReturnOrderID));";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableSKUItems() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS SKUItems (RFID TEXT PRIMARY KEY UNIQUE NOT NULL, available INTEGER (0, 1), dateOfStock STRING, skuID INTEGER NOT NULL);";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableSKUs() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS SKUs (id INTEGER PRIMARY KEY NOT NULL UNIQUE, description TEXT, weight INTEGER, volume INTEGER, notes TEXT, positionID TEXT, availableQuantity INTEGER, price DECIMAL);";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableTestDescriptors() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS TestDescriptors (id INTEGER PRIMARY KEY UNIQUE NOT NULL, name TEXT, description TEXT, idSKU INTEGER);";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableTestResults() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS TestResults (id INTEGER UNIQUE NOT NULL, date TEXT, result BOOLEAN, idTestDescriptor INTEGER NOT NULL, RFID TEXT NOT NULL, PRIMARY KEY (id, RFID));";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableUsers() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS Users (userId INTEGER PRIMARY KEY NOT NULL UNIQUE, username TEXT NOT NULL, name TEXT, surname TEXT, hash TEXT NOT NULL, type TEXT);";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableItems() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS Items (id INTEGER UNIQUE NOT NULL, description TEXT, price DECIMAL, skuID INTEGER, supplierID INTEGER, PRIMARY KEY (id, supplierID));";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableInternalOrdersSKUItems() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS InternalOrdersSKUItems (internalOrderID INTEGER, RFID TEXT, PRIMARY KEY (internalOrderID, RFID));";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableInternalOrdersProducts() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS InternalOrdersProducts (internalOrderID INTEGER, skuID INTEGER, quantity INTEGER, PRIMARY KEY (internalOrderID, skuID));";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static createTableInternalOrders() {
        return new Promise(async (resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS InternalOrders (id INTEGER PRIMARY KEY UNIQUE NOT NULL, issueDate TEXT, state TEXT, customerID INTEGER);";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static populateTableUser() {
        return new Promise(async (resolve, reject) => {
            const sql = "INSERT INTO Users (type, hash, surname, name, username, userId) VALUES ('customer','$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka','foo','foo','user1@ezwh.com',1), " +
                "('qualityEmployee','$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka','foo','foo','qualityEmployee1@ezwh.com',2), " +
                "('clerk','$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka','foo','foo','clerk1@ezwh.com',3), " +
                "('deliveryEmployee','$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka','foo','foo','deliveryEmployee1@ezwh.com',4), " +
                "('supplier','$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka','foo','foo','supplier1@ezwh.com',5), " +
                "('manager','$2a$10$NMZhJWWI3WXgWP4hVlKo5upRaTDLC7d3n77.wJyh1ZgmllaQ7qeka','foo','foo','manager1@ezwh.com',6);";
            this.db.run(sql, [], function (err) {
                if (err)
                    reject(err);
                else {
                    resolve('Tables created');
                }
            });
        });
    }

    static deleteAllUsers() {
        return new Promise((resolve, reject) => {
            const sql_query = "DELETE FROM users";
            this.db.run(sql_query, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(null);
            });
        });
    }
}

module.exports = DatabaseConnection;