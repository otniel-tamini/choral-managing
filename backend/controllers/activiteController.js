const { pool } = require('../config/database');

exports.getAllActivites = async (req, res, next) => {
  try {
    const { annee } = req.query;
    let query = 'SELECT * FROM activites';
    const queryParams = [];

    if (annee) {
      query += ' WHERE annee = ?';
      queryParams.push(annee);
    }
    
    query += ' ORDER BY date_debut DESC';

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getActiviteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM activites WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Activité non trouvée' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createActivite = async (req, res, next) => {
  try {
    const { annee, nom, date_debut, date_fin, statut, description } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO activites (annee, nom, date_debut, date_fin, statut, description) VALUES (?, ?, ?, ?, ?, ?)',
      [annee, nom, date_debut, date_fin, statut || 'prevu', description]
    );
    
    res.status(201).json({
      id: result.insertId,
      message: 'Activité créée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.updateActivite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { annee, nom, date_debut, date_fin, statut, description } = req.body;
    
    const [result] = await pool.query(
      'UPDATE activites SET annee = ?, nom = ?, date_debut = ?, date_fin = ?, statut = ?, description = ? WHERE id = ?',
      [annee, nom, date_debut, date_fin, statut, description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activité non trouvée' });
    }
    
    res.json({ message: 'Activité mise à jour avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.deleteActivite = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM activites WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activité non trouvée' });
    }
    
    res.json({ message: 'Activité supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};
