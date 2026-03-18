const { pool } = require('../config/database');

// Export Excel (CSV format)
exports.exportExcel = async (req, res) => {
  try {
    const { type } = req.params;
    const { annee } = req.query;
    const currentYear = annee || new Date().getFullYear();

    let data = [];
    let filename = '';

    switch (type) {
      case 'cotisations':
        const [cotisations] = await pool.query(`
          SELECT c.mois, c.annee, ch.nom, ch.prenom, c.montant, c.date_paiement
          FROM cotisations c
          JOIN choristes ch ON c.choriste_id = ch.id
          WHERE c.annee = ?
          ORDER BY c.annee, c.mois, ch.nom
        `, [currentYear]);
        data = cotisations;
        filename = `cotisations-${currentYear}.csv`;
        break;

      case 'dons':
        const [dons] = await pool.query(`
          SELECT donateur, montant, date, description
          FROM dons
          WHERE YEAR(date) = ?
          ORDER BY date
        `, [currentYear]);
        data = dons;
        filename = `dons-${currentYear}.csv`;
        break;

      case 'depenses':
        const [depenses] = await pool.query(`
          SELECT libelle, categorie, montant, date, description
          FROM depenses
          WHERE YEAR(date) = ?
          ORDER BY date
        `, [currentYear]);
        data = depenses;
        filename = `depenses-${currentYear}.csv`;
        break;

      case 'choristes':
        const [choristes] = await pool.query(`
          SELECT nom, prenom, telephone, statut, created_at
          FROM choristes
          ORDER BY nom, prenom
        `);
        data = choristes;
        filename = 'choristes.csv';
        break;

      default:
        return res.status(400).json({ error: 'Type invalide' });
    }

    // Generate CSV
    if (data.length === 0) {
      return res.status(404).json({ error: 'Aucune donnée à exporter' });
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(';'),
      ...data.map(row => headers.map(h => {
        let val = row[h];
        if (val instanceof Date) val = val.toLocaleDateString('fr-FR');
        if (val === null || val === undefined) val = '';
        return String(val).replace(/;/g, ',');
      }).join(';'))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.write('\ufeff'); // BOM for Excel
    res.send(csvContent);
  } catch (error) {
    console.error('Erreur exportExcel:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};
