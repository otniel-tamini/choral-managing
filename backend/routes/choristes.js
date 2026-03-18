const express = require('express');
const router = express.Router();
const choristeController = require('../controllers/choristeController');

// GET /api/choristes - Liste tous les choristes
router.get('/', choristeController.getAll);

// GET /api/choristes/:id - Récupérer un choriste avec son historique
router.get('/:id', choristeController.getById);

// POST /api/choristes - Créer un choriste
router.post('/', choristeController.create);

// PUT /api/choristes/:id - Modifier un choriste
router.put('/:id', choristeController.update);

// DELETE /api/choristes/:id - Supprimer un choriste
router.delete('/:id', choristeController.delete);

module.exports = router;
