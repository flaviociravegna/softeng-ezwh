'use strict';

const sqlite = require('sqlite3');
const res = require('express/lib/response');
const dbname = "./ezwh.db";
const db = new sqlite.Database(dbname, (err) => { if (err) throw err; });



/***********************************/
