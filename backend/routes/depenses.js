const express = require('express');
const router = express.Router();
const depenseController = require('../controllers/depenseController');

// GET /api/depenses - Liste avec filtres
router.get('/', depenseController.getAll);

// POST /api/depenses - Créer une dépense
router.post('/', depenseController.create);

// PUT /api/depenses/:id - Modifier une dépense
router.put('/:id', depenseController.update);

// DELETE /api/depenses/:id - Supprimer une dépense
router.delete('/:id', depenseController.delete);

module.exports = router;
