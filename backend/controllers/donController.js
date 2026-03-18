const { pool } = require('../config/database');

// Récupérer tous les dons
exports.getAll = async (req, res) => {
  try {
    const { debut, fin, minMontant, maxMontant } = req.query;
    let query = 'SELECT * FROM dons WHERE 1=1';
    const params = [];

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

    if (minMontant) {
      query += ' AND montant >= ?';
      params.push(minMontant);
    }

    if (maxMontant) {
      query += ' AND montant <= ?';
      params.push(maxMontant);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur getAll dons:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Créer un don
exports.create = async (req, res) => {
  try {
    const { donateur, montant, activite_id, date, description } = req.body;

    if (!donateur || !montant || !date) {
      return res.status(400).json({ error: 'Donateur, montant et date sont obligatoires' });
    }

    if (montant <= 0) {
      return res.status(400).json({ error: 'Le montant doit être positif' });
    }

    const [result] = await pool.query(
      'INSERT INTO dons (donateur, montant, activite_id, date, description) VALUES (?, ?, ?, ?, ?)',
      [donateur, montant, activite_id || null, date, description || null]
    );

    const [don] = await pool.query('SELECT * FROM dons WHERE id = ?', [result.insertId]);
    res.status(201).json(don[0]);
  } catch (error) {
    console.error('Erreur create don:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Modifier un don
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { donateur, montant, activite_id, date, description } = req.body;

    if (!donateur || !montant || !date) {
      return res.status(400).json({ error: 'Donateur, montant et date sont obligatoires' });
    }

    const [result] = await pool.query(
      'UPDATE dons SET donateur = ?, montant = ?, activite_id = ?, date = ?, description = ? WHERE id = ?',
      [donateur, montant, activite_id || null, date, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Don non trouvé' });
    }

    const [don] = await pool.query('SELECT * FROM dons WHERE id = ?', [id]);
    res.json(don[0]);
  } catch (error) {
    console.error('Erreur update don:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Supprimer un don
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM dons WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Don non trouvé' });
    }

    res.json({ message: 'Don supprimé avec succès' });
  } catch (error) {
    console.error('Erreur delete don:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};
