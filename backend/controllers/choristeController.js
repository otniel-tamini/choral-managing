const { pool } = require('../config/database');

// Récupérer tous les choristes
exports.getAll = async (req, res) => {
  try {
    const { statut, search } = req.query;
    let query = 'SELECT * FROM choristes WHERE 1=1';
    const params = [];

    if (statut) {
      query += ' AND statut = ?';
      params.push(statut);
    }

    if (search) {
      query += ' AND (nom LIKE ? OR prenom LIKE ? OR telephone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY nom, prenom';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur getAll choristes:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Récupérer un choriste par ID avec son historique
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [choriste] = await pool.query('SELECT * FROM choristes WHERE id = ?', [id]);
    
    if (choriste.length === 0) {
      return res.status(404).json({ error: 'Choriste non trouvé' });
    }

    // Récupérer l'historique des cotisations
    const [cotisations] = await pool.query(
      'SELECT * FROM cotisations WHERE choriste_id = ? ORDER BY annee DESC, mois DESC',
      [id]
    );

    res.json({
      ...choriste[0],
      cotisations: cotisations
    });
  } catch (error) {
    console.error('Erreur getById choriste:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Créer un choriste
exports.create = async (req, res) => {
  try {
    const { nom, prenom, telephone, statut } = req.body;

    if (!nom || !prenom) {
      return res.status(400).json({ error: 'Nom et prénom sont obligatoires' });
    }

    const [result] = await pool.query(
      'INSERT INTO choristes (nom, prenom, telephone, statut) VALUES (?, ?, ?, ?)',
      [nom, prenom, telephone || null, statut || 'actif']
    );

    const [choriste] = await pool.query('SELECT * FROM choristes WHERE id = ?', [result.insertId]);
    res.status(201).json(choriste[0]);
  } catch (error) {
    console.error('Erreur create choriste:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Modifier un choriste
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, telephone, statut } = req.body;

    if (!nom || !prenom) {
      return res.status(400).json({ error: 'Nom et prénom sont obligatoires' });
    }

    const [result] = await pool.query(
      'UPDATE choristes SET nom = ?, prenom = ?, telephone = ?, statut = ? WHERE id = ?',
      [nom, prenom, telephone || null, statut || 'actif', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Choriste non trouvé' });
    }

    const [choriste] = await pool.query('SELECT * FROM choristes WHERE id = ?', [id]);
    res.json(choriste[0]);
  } catch (error) {
    console.error('Erreur update choriste:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Supprimer un choriste
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM choristes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Choriste non trouvé' });
    }

    res.json({ message: 'Choriste supprimé avec succès' });
  } catch (error) {
    console.error('Erreur delete choriste:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};
