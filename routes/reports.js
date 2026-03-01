const express = require('express');
const router = express.Router();
const reportController = require('../index/controllers/report');

router.get('/revenue', reportController.getRevenueReport);

module.exports = router;
