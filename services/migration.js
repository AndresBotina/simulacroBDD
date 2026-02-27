const fs = require('fs');
const csv = require('csv-parser');
const pool = require('../config/mysql.js');

exports.migrateData = async (req, res) => {

    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {

            try {

                for (const row of results) {

                    //Insertar paciente (idempotente)
                    await pool.query(
                        `INSERT INTO patients (name, email, phone, address)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                        [row.patient_name, row.patient_email, row.phone, row.address]
                    );

                }

                res.json({ message: 'Migración parcial completada' });

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error en migración' });
            }

        });
};