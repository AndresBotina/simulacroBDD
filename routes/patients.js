const express = require('express');
const router = express.Router();
const patientController = require('../index/controllers/patient');

router.get('/:email/history', patientController.getHistoryByEmail);

module.exports = router;
