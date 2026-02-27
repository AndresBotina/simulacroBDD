const express = require('express');
const router = express.Router();
const doctorsController = require('../controllers/doctor.js');

router.get('/', doctorsController.getDoctors);

module.exports = router;