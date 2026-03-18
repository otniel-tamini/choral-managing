const express = require('express');
const router = express.Router();
const activiteController = require('../controllers/activiteController');

// GET /api/activites
router.get('/', activiteController.getAllActivites);

// GET /api/activites/:id
router.get('/:id', activiteController.getActiviteById);

// POST /api/activites
router.post('/', activiteController.createActivite);

// PUT /api/activites/:id
router.put('/:id', activiteController.updateActivite);

// DELETE /api/activites/:id
router.delete('/:id', activiteController.deleteActivite);

module.exports = router;
