const express = require('express');
const router = express.Router();
const migrationService = require('../index/services/migration');

/**
 * Endpoint to trigger the data migration from CSV to MySQL and MongoDB.
 */
router.post('/migration', async (req, res) => {
    try {
        const fs = require('fs');
        const csv = require('csv-parser');
        const path = require('path');

        const filePath = path.join(__dirname, '../data/simulation_saludplus_data.csv');
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // Process rows sequentially to ensure DB stability
                    for (const row of results) {
                        await migrationService.processRow(row);
                    }
                    res.json({ message: 'Migration completed successfully' });
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