const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'salud_plus',
    waitForConnections: true,
    connectionLimit: 10,
    port: 3306
});

module.exports = pool;