const express = require('express');
const router = express.Router();
const donController = require('../controllers/donController');

// GET /api/dons - Liste tous les dons
router.get('/', donController.getAll);

// POST /api/dons - Créer un don
router.post('/', donController.create);

// PUT /api/dons/:id - Modifier un don
router.put('/:id', donController.update);

// DELETE /api/dons/:id - Supprimer un don
router.delete('/:id', donController.delete);

module.exports = router;
