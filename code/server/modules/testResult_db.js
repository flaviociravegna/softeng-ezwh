'use strict';

const db = require('./DB');

class TestResult {
    constructor(id, date, result, idTestDescriptor, RFID) {
        this.id = id;
        this.date = date;
        this.result = result;
        this.idTestDescriptor = idTestDescriptor;
        this.RFID = RFID;
    }
}

exports.getAllTestResultByRFID = (rfid) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM testResults WHERE RFID = ?';
        db.all(sql, [rfid], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

exports.getTestResultById = (rfid, id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM testResults WHERE RFID=? AND id=?';
        db.get(sql, [rfid, id], (err, row) => {
            if (err)
                reject(err);
            if (row == undefined)
                resolve({ error: 'Test Result not found.' });
            else
                resolve(row);
        });
    });
};

// search the maxId among all testResults
exports.searchMaxID = () => {
    return new Promise((resolve, reject) => {
        const sql_query = "SELECT max(id) AS max_id FROM testResults;";
        db.all(sql_query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows[0].max_id);
        });
    });
}

exports.createNewTestResult = (test) => {
    return new Promise((resolve, reject) => {
        const sql_query = "INSERT INTO testResults(id, date, result, idTestDescriptor, RFID) VALUES(?,?,?,?,?)";
        db.run(sql_query, [test.id, test.date, test.result, test.idTestDescriptor, test.rfid], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

exports.modifyTestResult = (id, newIdTestDescriptor, newResult, newDate) => {
    return new Promise((resolve, reject) => {
        const sql_query = "UPDATE TestResults SET idTestDescriptor=?, result=?, date=? WHERE id=?";
        db.run(sql_query, [newIdTestDescriptor, newResult, newDate, id], (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

exports.deleteTestResult = (rfid, id) => {
    return new Promise((resolve, reject) => {
        const sql_query = "DELETE FROM testResults WHERE RFID=? AND id=?";
        db.run(sql_query, [rfid, id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}
