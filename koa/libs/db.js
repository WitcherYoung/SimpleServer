const mysql = require("mysql");
// 封装了promise的mysql操作的包
const coMysql = require("co-mysql");
const config = require("../config");

const db = mysql.createPool({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME
});

module.exports = coMysql(db);