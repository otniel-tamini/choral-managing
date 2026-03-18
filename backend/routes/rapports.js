const express = require('express');
const router = express.Router();
const rapportController = require('../controllers/rapportController');

// GET /api/rapports/trimestriel/:annee/:trimestre
router.get('/trimestriel/:annee/:trimestre', rapportController.getTrimestriel);

// GET /api/rapports/annuel/:annee
router.get('/annuel/:annee', rapportController.getAnnuel);

// GET /api/rapports/activites/:annee
router.get('/activites/:annee', rapportController.getActivitesAnnuel);

module.exports = router;
