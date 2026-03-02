// ESTÁS EN EL CAMINO: routes/migration.js
// AQUÍ SE DEFINE LA RUTA PARA IMPORTAR DATOS DESDE UN ARCHIVO CSV
const express = require('express');
const router = express.Router();
const migrationService = require('../index/services/migration'); // importa la lógica de procesamiento

/**
 * Endpoint para disparar la migración de datos de CSV a MySQL y MongoDB.
 * RUTA: POST /api/migration
 */
router.post('/migration', async (req, res) => {
    try {
        const fs = require('fs');
        const csv = require('csv-parser');
        const path = require('path');

        // PASO A: UBICAR EL ARCHIVO DE DATOS
        const filePath = path.join(__dirname, '../data/simulation_saludplus_data.csv');
        const results = [];

        // PASO B: LEER EL ARCHIVO CSV Y GUARDARLO EN MEMORIA
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // PASO C: PROCESAR CADA FILA UNA POR UNA
                    // AQUÍ EL CAMINO SALTA AL ARCHIVO "index/services/migration.js"
                    for (const row of results) {
                        await migrationService.processRow(row);
                    }
                    res.json({ message: 'Migration completed successfully' }); // responde éxito
                } catch (error) {
                    console.error('Error during migration processing:', error);
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'Error processing migration data' });
                    }
                }
            });
    } catch (error) {
        console.error('Error starting migration:', error);
        res.status(500).json({ message: 'Error starting migration' });
    }
});

module.exports = router;