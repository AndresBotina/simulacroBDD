// ESTÁS EN EL CAMINO: routes/patients.js
// AQUÍ SE DEFINE LA RUTA PARA BUSCAR HISTORIAS CLÍNICAS EN MONGODB
const express = require('express');
const router = express.Router();
const patientController = require('../index/controllers/patient'); // controlador de pacientes

// RUTA: GET /api/patients/:email/history
// EL CAMINO SALTA AL ARCHIVO "index/controllers/patient.js"
router.get('/:email/history', patientController.getHistoryByEmail); // busca por email en la base NoSQL

module.exports = router;
