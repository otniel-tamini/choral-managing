const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard - Métriques globales
router.get('/', dashboardController.getStats);

// GET /api/dashboard/evolution - Données graphiques mensuelles
router.get('/evolution', dashboardController.getEvolution);

module.exports = router;
