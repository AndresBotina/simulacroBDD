// ESTÁS EN EL CAMINO: routes/reports.js
// AQUÍ SE DEFINE LA RUTA PARA GENERAR REPORTES FINANCIEROS DESDE MYSQL
const express = require('express');
const router = express.Router();
const reportController = require('../index/controllers/report'); // controlador de reportes

// RUTA: GET /api/reports/revenue
// EL CAMINO SALTA AL ARCHIVO "index/controllers/report.js"
router.get('/revenue', reportController.getRevenueReport); // genera el reporte de ingresos

module.exports = router;
