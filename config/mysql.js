// ESTÁS EN: config/mysql.js
// ESTE ARCHIVO DEFINE LA CONEXIÓN A LA BASE DE DATOS RELACIONAL (MYSQL)
const mysql = require('mysql2/promise'); // librería para manejar mysql con promesas

/**
 * Configuración del pool de conexiones para MySQL.
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

// ESTE POOL SE IMPORTA EN LOS CONTROLADORES PARA HACER CONSULTAS SQL
module.exports = pool;