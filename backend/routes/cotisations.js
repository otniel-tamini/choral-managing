const express = require('express');
const router = express.Router();
const cotisationController = require('../controllers/cotisationController');

// GET /api/cotisations - Liste avec filtres
router.get('/', cotisationController.getAll);

// GET /api/cotisations/chronique/:choristeId - Historique d'un choriste
router.get('/chronique/:choristeId', cotisationController.getHistorique);

// GET /api/cotisations/mois/:annee/:mois - Cotisations d'un mois
router.get('/mois/:annee/:mois', cotisationController.getByMois);

// GET /api/cotisations/annee/:annee - Cotisations d'une année
router.get('/annee/:annee', cotisationController.getByAnnee);

// POST /api/cotisations - Créer une cotisation
router.post('/', cotisationController.create);

// POST /api/cotisations/annee - Payer pour toute l'année
router.post('/annee', cotisationController.payForYear);

// PUT /api/cotisations/:id - Modifier une cotisation
router.put('/:id', cotisationController.update);

// DELETE /api/cotisations/:id - Supprimer une cotisation
router.delete('/:id', cotisationController.delete);

module.exports = router;
