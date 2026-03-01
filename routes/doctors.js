const express = require('express');
const router = express.Router();
const doctorController = require('../index/controllers/doctor');

router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.put('/:id', doctorController.updateDoctor);

module.exports = router;