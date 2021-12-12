// kvs.js
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
var db;

// raw function

function run(sql, params) {
	return new Promise((resolve, reject) => {
		db.run(sql, params, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
}

function get(sql, params) {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) reject(err);
			resolve(row);
		});
	});
}

function all(sql, params) {
	return new Promise((resolve, reject) => {
    if (params != null) {
      db.all(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });  
    } else {
      db.all(sql, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });  
    }
	});
}

function each(sql, func) {
	return new Promise((resolve, reject) => {
		db.each(sql,
      (err, row) => {
        func(err, row);
      }, (err) => {
			  if (err) reject(err);
			  resolve();
		});
	});
}

async function init(name)
{
  console.log("kvs.init("+name+")");
  var exists = fs.existsSync(name);
  db = new sqlite3.Database(name);
  if (!exists) {
    await run(
      "CREATE TABLE Dreams (id INTEGER PRIMARY KEY AUTOINCREMENT, dream TEXT)"
    );
    console.log("New table Dreams created!");

    await run(
      'INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")'
    );
  } else {
    console.log('Database "Dreams" ready to go!');
    var row = await all("SELECT * from Dreams");
    if (row) {
      for (var i = 0; i < row.length; i++) {
        console.log(`record: ${row[i].dream}`);
      }
    }
  }
}

async function getDreams(func)
{
  var rows = await all("SELECT * from Dreams", null);
  func(rows);
}

async function addDreams(params, func)
{
  //console.log("### kvs.addDreams("+params+")");
  var error = await run(`INSERT INTO Dreams (dream) VALUES (?)`, params);
  func(error);
}

async function clearDreams(func)
{
  //console.log("# clearDreams");
  var error = await each("SELECT * from Dreams", async (err, row) => {
    var err = await run("DELETE FROM Dreams WHERE ID=?", row.id);
    if (err) {
      console.log(err);
    } else {
      console.log(`deleted row ${row.id}`);
    }
  });
  func(error);
}

module.exports.init = init; 
module.exports.getDreams = getDreams;
module.exports.addDreams = addDreams;
module.exports.clearDreams = clearDreams;