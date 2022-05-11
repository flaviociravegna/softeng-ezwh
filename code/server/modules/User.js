'use strict';

const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');

// open the database 
const db = new sqlite.Database('ezwh.db', (err) => {
  if(err) throw err;
});

class User {
    constructor(id, name, surname, username, type) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.type = type;
    }
}

exports.getUserInfo = (username, password) => { 
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username=?';
        db.get(sql, [username], (err, row) => {
            if (err) 
                reject(err);
            else if (row === undefined)   //nessun utente trovato all'interno del db
                resolve(false); 
            else {                        //utente trovato            
                const user = {id: row.userId, username: row.username, name: row.name};
                bcrypt.compare(password, row.hash).then(result => { //check if the two hashes match with an async call
                    if(result)
                        resolve(user);      //password corretta --> manda info dell'account
                    else
                        resolve(false);     //rigetta login (password errata)
                });
            }
        });
    });
};

exports.getUserInfoById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT users.userId, users.username, users.name, users.surname, users.type FROM users WHERE userId = ?';
        db.get(sql, [id], (err, row) => {
            if (err) 
                reject(err);
            else if (row === undefined) 
                resolve({error: 'User not found.'});
            else {
                const user = {id: row.userId, username: row.username, name: row.name, surname: row.surname, type: row.type}
                resolve(user);
            }
        });
    });
};


exports.getAllUsersExceptManagers = () => { 
    return new Promise((resolve, reject) => {
        const sql = 'SELECT users.userId, users.name, users.surname, users.username, users.type FROM users WHERE users.type != "MANAGER"';
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);   
                return;
            }
            resolve(rows);
        });
    });
};

exports.getAllSuppliers = () => { 
    return new Promise((resolve, reject) => {
        const sql = 'SELECT users.userId, users.name, users.surname, users.username FROM users WHERE users.type == "SUPPLIER"';
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);   
                return;
            }
            resolve(rows);
        });
    });
};

exports.createNewUser = (user) => {
    return new Promise((resolve, reject) => {
        const sql_query = "INSERT INTO users(userId, username, name, surname, hash, type) VALUES(?,?,?,?,?,?)";
        db.run(sql_query, [user.id, user.username, user.name, user.surname, user.hash, user.type], (err, rows) => {
            if(err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(null);
        });
    });
}

// search the maxId among all users
exports.searchMaxID = () => {
    return new Promise((resolve, reject) => {
      const sql_query = "SELECT max(userId) AS max_id FROM users;";
      db.all(sql_query, [], (err, rows) => {
        if(err) {
        
          reject(err);
          return;
        }
        resolve(rows[0].max_id);
      });
    });
}

// get the user
exports.getUserByUsernameAndType = (username, type) => {
    return new Promise((resolve, reject) => {
      const sql_query = "SELECT username, type FROM users WHERE users.username=? AND users.type=?;";
      db.all(sql_query, [username, type], (err, rows) => {
        if(err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
}


exports.modifyUserRights = (username, oldType, newType) => {
    return new Promise((resolve, reject) => {
        const sql_query = "UPDATE users SET type=? WHERE username=? AND type=?";
        db.run(sql_query, [newType, username, oldType], (err, rows) => {
            if(err) {
                reject(err);
                return;
              }
              resolve(null);
            });
    });
}

//delete an existing user, given its username and type.
exports.deleteUser = (username, type) => {
    return new Promise((resolve, reject) => {
        const sql_query = "DELETE FROM users WHERE users.username=? AND users.type=?";
        db.run(sql_query, [username, type], (err, rows) => {
          if(err) {
            reject(err);
            return;
          }
          resolve(null);
        });
    });
}

