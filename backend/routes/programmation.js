const express = require('express');
const router = express.Router();
const programmationController = require('../controllers/programmationController');

// GET /api/programmation/range - Liste la programmation pour une période
router.get('/range', programmationController.getByRange);

// POST /api/programmation - Créer ou mettre à jour une programmation
router.post('/', programmationController.createOrUpdate);

// GET /api/programmation/export-pdf - Exporter en PDF
router.get('/export-pdf', programmationController.exportPDF);

// DELETE /api/programmation/:id - Supprimer une programmation
router.delete('/:id', programmationController.delete);

module.exports = router;
