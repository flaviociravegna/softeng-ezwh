'use strict';

const db = require('./DB').db;

/*************** POSITION ********************/

exports.getAllPositions = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM positions';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

exports.createNewPosition = (position) => {
    return new Promise((resolve, reject) => {
        const sql_query = "INSERT INTO positions(positionID, aisle, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume) VALUES(?,?,?,?,?,?,?,?)";
        db.run(sql_query, [position.positionID, position.aisle, position.row, position.col, position.maxWeight, position.maxVolume, position.occupiedWeight, position.occupiedVolume], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

exports.getPositionById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM positions WHERE positionID = ?';
        db.get(sql, [id], (err, row) => {
            if (err)
                reject(err);

            if (row == undefined)
                resolve({ error: 'Position not found.' });
            else
                resolve(row);
        });
    });
};

exports.modifyPosition = (oldPositionID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume) => {
    return new Promise((resolve, reject) => {
        const newPosID = newAisleID + newRow + newCol;
        const sql_query = "UPDATE positions SET positionID=?, aisle=?, row=?, col=?, maxWeight=?, maxVolume=?, occupiedWeight=?, occupiedVolume=? WHERE positionID=?";
        db.run(sql_query, [newPosID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume, oldPositionID], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

exports.modifyPositionID = (oldPositionID, newPositionID) => {
    const newAisleID = newPositionID.substring(0, 4);
    const newRow = newPositionID.substring(4, 8);
    const newCol = newPositionID.substring(8, 12);

    return new Promise((resolve, reject) => {
        const sql_query = "UPDATE positions SET positionID=?, aisle=?, row=?, col=? WHERE positionID=?";
        db.run(sql_query, [newPositionID, newAisleID, newRow, newCol, oldPositionID], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

//delete an existing position, given its positionID
exports.deletePosition = (positionID) => {
    return new Promise((resolve, reject) => {
        const sql_query = "DELETE FROM positions WHERE positionID=?";
        db.run(sql_query, [positionID], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

// check if position is empty or not
exports.searchPosition = (positionID) => {
    return new Promise((resolve, reject) => {
        const sql_query = "SELECT * FROM SKUs WHERE positionID=?";
        db.all(sql_query, [positionID], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

exports.deleteAllPositions = () => {
    return new Promise((resolve, reject) => {
        const sql_query = "DELETE FROM Positions";
        db.run(sql_query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

/*********************************************/
exports.updatePositionWeightAndVolume = (positionID, newOccupiedWeight, newOccupiedVolume) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE positions SET occupiedWeight = ?, occupiedVolume = ? WHERE positionID = ?", [newOccupiedWeight, newOccupiedVolume, positionID], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(null);
        });
    });
}