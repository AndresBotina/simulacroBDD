const express = require('express');
const connectMongo = require('./config/mongo.js');
const pool = require('./config/mysql.js');

const app = express();
app.use(express.json());

connectMongo();

async function testMySQL() {
    try {
        const [rows] = await pool.query('SELECT 1');
        console.log('MySQL conectado correctamente');
    } catch (error) {
        console.error('Error MySQL:', error.message);
    }
}

const doctorsRoutes = require('./routes/doctors.js');
app.use('/api/doctors', doctorsRoutes);

const migrationRoutes = require('./routes/migration.js');
app.use('/api/migration', migrationRoutes);

testMySQL();


app.listen(3000, () => console.log('Servidor corriendo'));




