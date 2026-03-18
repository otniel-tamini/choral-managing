const { pool } = require('../config/database');

// Récupérer toutes les cotisations avec filtres
exports.getAll = async (req, res) => {
  try {
    const { annee, mois, choristeId } = req.query;
    let query = `
      SELECT c.*, ch.nom, ch.prenom 
      FROM cotisations c 
      JOIN choristes ch ON c.choriste_id = ch.id 
      WHERE 1=1
    `;
    const params = [];

    if (annee) {
      query += ' AND c.annee = ?';
      params.push(annee);
    }

    if (mois) {
      query += ' AND c.mois = ?';
      params.push(mois);
    }

    if (choristeId) {
      query += ' AND c.choriste_id = ?';
      params.push(choristeId);
    }

    query += ' ORDER BY c.annee DESC, c.mois DESC, c.date_paiement DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur getAll cotisations:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Récupérer l'historique d'un choriste
exports.getHistorique = async (req, res) => {
  try {
    const { choristeId } = req.params;

    const [choriste] = await pool.query('SELECT * FROM choristes WHERE id = ?', [choristeId]);
    if (choriste.length === 0) {
      return res.status(404).json({ error: 'Choriste non trouvé' });
    }

    const [cotisations] = await pool.query(
      'SELECT * FROM cotisations WHERE choriste_id = ? ORDER BY annee DESC, mois DESC',
      [choristeId]
    );

    res.json({
      choriste: choriste[0],
      cotisations: cotisations,
      total: cotisations.reduce((sum, c) => sum + parseFloat(c.montant), 0)
    });
  } catch (error) {
    console.error('Erreur getHistorique:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Récupérer les cotisations d'un mois
exports.getByMois = async (req, res) => {
  try {
    const { annee, mois } = req.params;

    const [rows] = await pool.query(`
      SELECT c.*, ch.nom, ch.prenom 
      FROM cotisations c 
      JOIN choristes ch ON c.choriste_id = ch.id 
      WHERE c.annee = ? AND c.mois = ?
      ORDER BY ch.nom, ch.prenom
    `, [annee, mois]);

    // Récupérer tous les choristes actifs pour identifier ceux qui n'ont pas payé
    const [choristesActifs] = await pool.query(
      "SELECT * FROM choristes WHERE statut = 'actif'"
    );

    const choristesPayes = rows.map(r => r.choriste_id);
    const choristesNonPayes = choristesActifs.filter(c => !choristesPayes.includes(c.id));

    res.json({
      cotisations: rows,
      total: rows.reduce((sum, c) => sum + parseFloat(c.montant), 0),
      choristesNonPayes: choristesNonPayes,
      mois: parseInt(mois),
      annee: parseInt(annee)
    });
  } catch (error) {
    console.error('Erreur getByMois:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Récupérer les cotisations d'une année
exports.getByAnnee = async (req, res) => {
  try {
    const { annee } = req.params;

    const [rows] = await pool.query(`
      SELECT c.*, ch.nom, ch.prenom 
      FROM cotisations c 
      JOIN choristes ch ON c.choriste_id = ch.id 
      WHERE c.annee = ?
      ORDER BY c.mois DESC, ch.nom
    `, [annee]);

    // Grouper par choriste pour le total payé et grouper par mois pour historique
    const parChoriste = {};
    rows.forEach(r => {
      if (!parChoriste[r.choriste_id]) {
        parChoriste[r.choriste_id] = {
          nom: r.nom,
          prenom: r.prenom,
          totalPaye: 0,
          details: []
        };
      }
      parChoriste[r.choriste_id].totalPaye += parseFloat(r.montant);
      parChoriste[r.choriste_id].details.push(r);
    });

    const parMois = {};
    for (let i = 1; i <= 12; i++) {
        parMois[i] = {
            cotisations: rows.filter(r => r.mois === i),
            total: rows.filter(r => r.mois === i).reduce((sum, c) => sum + parseFloat(c.montant), 0)
        };
    }

    res.json({
      annee: parseInt(annee),
      total: rows.reduce((sum, c) => sum + parseFloat(c.montant), 0),
      parMois: parMois,
      parChoriste: Object.values(parChoriste)
    });
  } catch (error) {
    console.error('Erreur getByAnnee:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Créer une cotisation
exports.create = async (req, res) => {
  try {
    const { choriste_id, mois, annee, montant, date_paiement } = req.body;

    // Validation
    if (!choriste_id || !annee || !montant || !date_paiement) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    if (mois && (mois < 1 || mois > 12)) {
      return res.status(400).json({ error: 'Le mois doit être entre 1 et 12' });
    }

    if (montant <= 0) {
      return res.status(400).json({ error: 'Le montant doit être positif' });
    }

    // Vérifier si le choriste existe
    const [choriste] = await pool.query('SELECT * FROM choristes WHERE id = ?', [choriste_id]);
    if (choriste.length === 0) {
      return res.status(404).json({ error: 'Choriste non trouvé' });
    }

    // Remove 'existante' validation to allow multiple partial payments in a month
    // Validation is strictly focused on valid input data
    
    const [result] = await pool.query(
      'INSERT INTO cotisations (choriste_id, mois, annee, montant, date_paiement) VALUES (?, ?, ?, ?, ?)',
      [choriste_id, mois || null, annee, montant, date_paiement]
    );

    const [cotisation] = await pool.query('SELECT * FROM cotisations WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...cotisation[0], nom: choriste[0].nom, prenom: choriste[0].prenom });
  } catch (error) {
    console.error('Erreur create cotisation:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Créer une cotisation annuelle (12 mois)
exports.payForYear = async (req, res) => {
  try {
    const { choriste_id, annee, date_paiement } = req.body;

    if (!choriste_id || !annee || !date_paiement) {
      return res.status(400).json({ error: 'Choriste, année et date sont obligatoires' });
    }

    // Vérifier si le choriste existe
    const [choriste] = await pool.query('SELECT * FROM choristes WHERE id = ?', [choriste_id]);
    if (choriste.length === 0) {
      return res.status(404).json({ error: 'Choriste non trouvé' });
    }

    // Récupérer les cotisations existantes pour cette année et ce choriste
    const [existantes] = await pool.query(
      'SELECT mois FROM cotisations WHERE choriste_id = ? AND annee = ?',
      [choriste_id, annee]
    );
    const moisPayes = existantes.map(e => e.mois);

    const moisAInserer = [];
    for (let i = 1; i <= 12; i++) {
        if (!moisPayes.includes(i)) {
            moisAInserer.push([choriste_id, i, annee, 100, date_paiement]); // Par défaut 100 F par mois
        }
    }

    let insertedCount = 0;
    if (moisAInserer.length > 0) {
        const [result] = await pool.query(
            'INSERT INTO cotisations (choriste_id, mois, annee, montant, date_paiement) VALUES ?',
            [moisAInserer]
        );
        insertedCount = result.affectedRows;
    }

    res.status(201).json({ 
        message: 'Paiement annuel enregistré',
        moisAjoutes: insertedCount,
        nom: choriste[0].nom, 
        prenom: choriste[0].prenom 
    });
  } catch (error) {
    console.error('Erreur payForYear cotisation:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Modifier une cotisation
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { montant, date_paiement } = req.body;

    if (!montant || !date_paiement) {
      return res.status(400).json({ error: 'Montant et date sont obligatoires' });
    }

    const [result] = await pool.query(
      'UPDATE cotisations SET montant = ?, date_paiement = ? WHERE id = ?',
      [montant, date_paiement, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cotisation non trouvée' });
    }

    const [cotisation] = await pool.query(`
      SELECT c.*, ch.nom, ch.prenom 
      FROM cotisations c 
      JOIN choristes ch ON c.choriste_id = ch.id 
      WHERE c.id = ?
    `, [id]);

    res.json(cotisation[0]);
  } catch (error) {
    console.error('Erreur update cotisation:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Supprimer une cotisation
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM cotisations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cotisation non trouvée' });
    }

    res.json({ message: 'Cotisation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur delete cotisation:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};
