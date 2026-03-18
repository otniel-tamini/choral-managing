const { pool } = require('../config/database');

// Récupérer toutes les dépenses
exports.getAll = async (req, res) => {
  try {
    const { categorie, debut, fin } = req.query;
    let query = 'SELECT * FROM depenses WHERE 1=1';
    const params = [];

    if (categorie) {
      query += ' AND categorie = ?';
      params.push(categorie);
    }

    if (debut) {
      query += ' AND date >= ?';
      params.push(debut);
    }

    if (fin) {
      query += ' AND date <= ?';
      params.push(fin);
    }

    if (req.query.activite_id) {
      query += ' AND activite_id = ?';
      params.push(req.query.activite_id);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur getAll depenses:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Créer une dépense
exports.create = async (req, res) => {
  try {
    const { libelle, montant, categorie, activite_id, date, description } = req.body;

    if (!libelle || !montant || !categorie || !date) {
      return res.status(400).json({ error: 'Libellé, montant, catégorie et date sont obligatoires' });
    }

    const categoriesValides = ['transport', 'materiel', 'evenement', 'autre'];
    if (!categoriesValides.includes(categorie)) {
      return res.status(400).json({ error: 'Catégorie invalide' });
    }

    if (montant <= 0) {
      return res.status(400).json({ error: 'Le montant doit être positif' });
    }

    const [result] = await pool.query(
      'INSERT INTO depenses (libelle, montant, categorie, activite_id, date, description) VALUES (?, ?, ?, ?, ?, ?)',
      [libelle, montant, categorie, activite_id || null, date, description || null]
    );

    const [depense] = await pool.query('SELECT * FROM depenses WHERE id = ?', [result.insertId]);
    res.status(201).json(depense[0]);
  } catch (error) {
    console.error('Erreur create depense:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Modifier une dépense
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, montant, categorie, activite_id, date, description } = req.body;

    if (!libelle || !montant || !categorie || !date) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    const categoriesValides = ['transport', 'materiel', 'evenement', 'autre'];
    if (!categoriesValides.includes(categorie)) {
      return res.status(400).json({ error: 'Catégorie invalide' });
    }

    const [result] = await pool.query(
      'UPDATE depenses SET libelle = ?, montant = ?, categorie = ?, activite_id = ?, date = ?, description = ? WHERE id = ?',
      [libelle, montant, categorie, activite_id || null, date, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    const [depense] = await pool.query('SELECT * FROM depenses WHERE id = ?', [id]);
    res.json(depense[0]);
  } catch (error) {
    console.error('Erreur update depense:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Supprimer une dépense
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM depenses WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error) {
    console.error('Erreur delete depense:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};
