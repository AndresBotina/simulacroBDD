const mysql = require('mysql2/promise');

/**
 * MySQL connection pool configuration using mysql2/promise.
 */
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345a',
    database: 'salud_plus',
    waitForConnections: true,
    connectionLimit: 10,
    port: 3306
});

module.exports = pool;