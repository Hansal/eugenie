const config = require('./config');
const mysql = require('mysql');
const db = {};

db.execute = (sql, params, callback) => {
    var client = mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port
    });

    client.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Conencted");
        }

    });

    client.query(sql, params, (err, results) => {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log("Got Data");
            callback(null, results);
        }
        client.end();
    });
};

module.exports = db;
