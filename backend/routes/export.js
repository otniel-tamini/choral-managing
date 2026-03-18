const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// GET /api/export/excel/:type - Export Excel (csv)
router.get('/excel/:type', exportController.exportExcel);

module.exports = router;
