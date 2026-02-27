const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const migrationController = require('../services/migration');

const upload = multer({
    dest: path.join(__dirname, '../uploads')
});

router.post('/upload', upload.single('file'), migrationController.migrateData);

module.exports = router;