require('dotenv').config();
const express = require('express');
const connectMongo = require('./config/mongo');
const pool = require('./config/mysql');

const app = express();

/**
 * Middleware to parse JSON in request bodies
 */
app.use(express.json());

/**
 * MongoDB connection initialization (Mongoose)
 */
connectMongo();

/**
 * API Route definitions
 */
const migrationRoutes = require('./routes/migration'); // CSV Import logic
const doctorsRoutes = require('./routes/doctors');     // Doctor management (SQL + NoSQL Sync)
const reportsRoutes = require('./routes/reports');     // Financial reports (SQL Aggregations)
const patientsRoutes = require('./routes/patients');   // History lookup (NoSQL)

// Route mounting
app.use('/api', migrationRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/patients', patientsRoutes);

/**
 * Express Server Start
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SaludPlus server running on port ${PORT}`);
});
