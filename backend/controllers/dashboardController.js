const { pool } = require('../config/database');

// Récupérer les statistiques du dashboard
exports.getStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Total cotisations de l'année
    const [cotisationsResult] = await pool.query(
      'SELECT COALESCE(SUM(montant), 0) as total FROM cotisations WHERE annee = ?',
      [currentYear]
    );

    // Total dons de l'année
    const [donsResult] = await pool.query(
      'SELECT COALESCE(SUM(montant), 0) as total FROM dons WHERE YEAR(date) = ?',
      [currentYear]
    );

    // Total dépenses de l'année
    const [depensesResult] = await pool.query(
      'SELECT COALESCE(SUM(montant), 0) as total FROM depenses WHERE YEAR(date) = ?',
      [currentYear]
    );

    // Cotisations du mois en cours
    const [cotisationsMois] = await pool.query(
      'SELECT COALESCE(SUM(montant), 0) as total FROM cotisations WHERE annee = ? AND mois = ?',
      [currentYear, currentMonth]
    );

    // Nombre de choristes actifs
    const [nbChoristes] = await pool.query(
      "SELECT COUNT(*) as total FROM choristes WHERE statut = 'actif'"
    );

    // 10 dernières transactions (cotisations + dons)
    const [derniereCotisations] = await pool.query(`
      SELECT 'cotisation' as type, c.id, c.montant, c.date_paiement as date, 
             CONCAT(ch.nom, ' ', ch.prenom) as description
      FROM cotisations c
      JOIN choristes ch ON c.choriste_id = ch.id
      ORDER BY c.date_paiement DESC
      LIMIT 5
    `);

    const [derniersDons] = await pool.query(`
      SELECT 'don' as type, id, montant, date, donateur as description
      FROM dons
      ORDER BY date DESC
      LIMIT 5
    `);

    const [dernieresDepenses] = await pool.query(`
      SELECT 'depense' as type, id, montant, date, libelle as description
      FROM depenses
      ORDER BY date DESC
      LIMIT 5
    `);

    // Fusionner et trier
    const transactions = [...derniereCotisations, ...derniersDons, ...dernieresDepenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    const totalCotisations = parseFloat(cotisationsResult[0].total);
    const totalDons = parseFloat(donsResult[0].total);
    const totalDepenses = parseFloat(depensesResult[0].total);
    const solde = totalCotisations + totalDons - totalDepenses;

    res.json({
      totalCotisations,
      totalDons,
      totalDepenses,
      solde,
      cotisationsMois: parseFloat(cotisationsMois[0].total),
      nbChoristes: nbChoristes[0].total,
      currentYear,
      currentMonth,
      transactions
    });
  } catch (error) {
    console.error('Erreur getStats:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Récupérer les données d'évolution mensuelle
exports.getEvolution = async (req, res) => {
  try {
    const annee = parseInt(req.query.annee) || new Date().getFullYear();

    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    // Données mensuelles des cotisations
    const [cotisationsParMois] = await pool.query(`
      SELECT mois, SUM(montant) as total 
      FROM cotisations 
      WHERE annee = ? 
      GROUP BY mois
    `, [annee]);

    // Données mensuelles des dons
    const [donsParMois] = await pool.query(`
      SELECT MONTH(date) as mois, SUM(montant) as total 
      FROM dons 
      WHERE YEAR(date) = ? 
      GROUP BY MONTH(date)
    `, [annee]);

    // Données mensuelles des dépenses par catégorie
    const [depensesParMois] = await pool.query(`
      SELECT MONTH(date) as mois, categorie, SUM(montant) as total 
      FROM depenses 
      WHERE YEAR(date) = ? 
      GROUP BY MONTH(date), categorie
    `, [annee]);

    // Construire le tableau d'évolution
    const evolution = [];
    for (let i = 1; i <= 12; i++) {
      const cotMonth = cotisationsParMois.find(c => c.mois === i);
      const donMonth = donsParMois.find(d => d.mois === i);
      const depMonth = depensesParMois.filter(d => d.mois === i);

      evolution.push({
        mois: i,
        moisNom: moisNoms[i - 1],
        cotisations: cotMonth ? parseFloat(cotMonth.total) : 0,
        dons: donMonth ? parseFloat(donMonth.total) : 0,
        depenses: depMonth.reduce((sum, d) => sum + parseFloat(d.total), 0),
        depensesParCategorie: {
          transport: depMonth.find(d => d.categorie === 'transport')?.total || 0,
          materiel: depMonth.find(d => d.categorie === 'materiel')?.total || 0,
          evenement: depMonth.find(d => d.categorie === 'evenement')?.total || 0,
          autre: depMonth.find(d => d.categorie === 'autre')?.total || 0
        }
      });
    }

    // Totaux par catégorie pour l'année
    const [totauxCategories] = await pool.query(`
      SELECT categorie, SUM(montant) as total 
      FROM depenses 
      WHERE YEAR(date) = ? 
      GROUP BY categorie
    `, [annee]);

    res.json({
      annee,
      evolution,
      categories: {
        transport: totauxCategories.find(t => t.categorie === 'transport')?.total || 0,
        materiel: totauxCategories.find(t => t.categorie === 'materiel')?.total || 0,
        evenement: totauxCategories.find(t => t.categorie === 'evenement')?.total || 0,
        autre: totauxCategories.find(t => t.categorie === 'autre')?.total || 0
      }
    });
  } catch (error) {
    console.error('Erreur getEvolution:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};
