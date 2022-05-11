'use strict';

const sqlite = require('sqlite3');

// open the database 
const db = new sqlite.Database('ezwh.db', (err) => {
  if(err) throw err;
});

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
        db.all(sql, [rfid, id], (err, rows) => {
            if (err) {
                reject(err);   
                return;
            }
            resolve(rows);
        });
    });
};


