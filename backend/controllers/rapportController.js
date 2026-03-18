const PDFDocument = require('pdfkit');
const { pool } = require('../config/database');

const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

// Rapport trimestriel
exports.getTrimestriel = async (req, res) => {
  try {
    const { annee, trimestre } = req.params;
    const t = parseInt(trimestre);
    
    if (t < 1 || t > 4) {
      return res.status(400).json({ error: 'Trimestre invalide (1-4)' });
    }

    const debutMois = (t - 1) * 3 + 1;
    const finMois = t * 3;

    // Récupérer les cotisations du trimestre
    const [cotisations] = await pool.query(`
      SELECT c.*, ch.nom, ch.prenom 
      FROM cotisations c 
      JOIN choristes ch ON c.choriste_id = ch.id 
      WHERE c.annee = ? AND c.mois >= ? AND c.mois <= ?
      ORDER BY c.mois, ch.nom
    `, [annee, debutMois, finMois]);

    // Récupérer les dons du trimestre
    const [dons] = await pool.query(`
      SELECT * FROM dons 
      WHERE YEAR(date) = ? AND MONTH(date) >= ? AND MONTH(date) <= ?
      ORDER BY date
    `, [annee, debutMois, finMois]);

    // Récupérer les dépenses du trimestre
    const [depenses] = await pool.query(`
      SELECT * FROM depenses 
      WHERE YEAR(date) = ? AND MONTH(date) >= ? AND MONTH(date) <= ?
      ORDER BY date
    `, [annee, debutMois, finMois]);

    const totalCotisations = cotisations.reduce((sum, c) => sum + parseFloat(c.montant), 0);
    const totalDons = dons.reduce((sum, d) => sum + parseFloat(d.montant), 0);
    const totalDepenses = depenses.reduce((sum, d) => sum + parseFloat(d.montant), 0);
    const solde = totalCotisations + totalDons - totalDepenses;

    // Format PDF
    if (req.query.format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=rapport-T${trimestre}-${annee}.pdf`);
      doc.pipe(res);

      // En-tête
      doc.fontSize(20).text('CHORALE DAVID SEWA', { align: 'center' });
      doc.fontSize(14).text(`Rapport Trimestriel - T${trimestre} ${annee}`, { align: 'center' });
      doc.moveDown();

      // Période
      doc.fontSize(10).text(
        `Période: ${moisNoms[debutMois - 1]} - ${moisNoms[finMois - 1]} ${annee}`,
        { align: 'center' }
      );
      doc.moveDown(2);

      // Résumé financier
      doc.fontSize(14).text('RÉSUMÉ FINANCIER', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Total Cotisations: ${totalCotisations.toLocaleString('fr-FR')} FCFA`);
      doc.text(`Total Dons: ${totalDons.toLocaleString('fr-FR')} FCFA`);
      doc.text(`Total Dépenses: ${totalDepenses.toLocaleString('fr-FR')} FCFA`);
      doc.moveDown();
      doc.fontSize(12).text(`SOLDE: ${solde.toLocaleString('fr-FR')} FCFA`, { bold: true });
      doc.moveDown(2);

      // Détails Cotisations
      if (cotisations.length > 0) {
        doc.fontSize(14).text('COTISATIONS', { underline: true });
        doc.moveDown();
        doc.fontSize(9);
        cotisations.forEach(c => {
          doc.text(`${c.nom} ${c.prenom} - ${moisNoms[c.mois - 1]} ${c.annee}: ${parseFloat(c.montant).toLocaleString('fr-FR')} FCFA`);
        });
        doc.moveDown();
      }

      // Détails Dons
      if (dons.length > 0) {
        doc.fontSize(14).text('DONS', { underline: true });
        doc.moveDown();
        doc.fontSize(9);
        dons.forEach(d => {
          doc.text(`${d.donateur} - ${new Date(d.date).toLocaleDateString('fr-FR')}: ${parseFloat(d.montant).toLocaleString('fr-FR')} FCFA`);
        });
        doc.moveDown();
      }

      // Détails Dépenses
      if (depenses.length > 0) {
        doc.fontSize(14).text('DÉPENSES', { underline: true });
        doc.moveDown();
        doc.fontSize(9);
        depenses.forEach(d => {
          doc.text(`${d.libelle} (${d.categorie}) - ${new Date(d.date).toLocaleDateString('fr-FR')}: ${parseFloat(d.montant).toLocaleString('fr-FR')} FCFA`);
        });
      }

      // Pied de page
      doc.moveDown(2);
      doc.fontSize(8).text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        { align: 'center' }
      );

      doc.end();
    } else {
      // JSON response
      res.json({
        periode: { debut: debutMois, fin: finMois, annee: parseInt(annee) },
        totalCotisations,
        totalDons,
        totalDepenses,
        solde,
        cotisations,
        dons,
        depenses
      });
    }
  } catch (error) {
    console.error('Erreur getTrimestriel:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Rapport annuel
exports.getAnnuel = async (req, res) => {
  try {
    const { annee } = req.params;

    // Récupérer toutes les cotisations de l'année
    const [cotisations] = await pool.query(`
      SELECT c.*, ch.nom, ch.prenom 
      FROM cotisations c 
      JOIN choristes ch ON c.choriste_id = ch.id 
      WHERE c.annee = ?
      ORDER BY c.mois, ch.nom
    `, [annee]);

    // Récupérer tous les dons de l'année
    const [dons] = await pool.query(`
      SELECT * FROM dons 
      WHERE YEAR(date) = ?
      ORDER BY date
    `, [annee]);

    // Récupérer toutes les dépenses de l'année
    const [depenses] = await pool.query(`
      SELECT * FROM depenses 
      WHERE YEAR(date) = ?
      ORDER BY date
    `, [annee]);

    // Dépenses par catégorie
    const [depensesParCategorie] = await pool.query(`
      SELECT categorie, SUM(montant) as total 
      FROM depenses 
      WHERE YEAR(date) = ?
      GROUP BY categorie
    `, [annee]);

    const totalCotisations = cotisations.reduce((sum, c) => sum + parseFloat(c.montant), 0);
    const totalDons = dons.reduce((sum, d) => sum + parseFloat(d.montant), 0);
    const totalDepenses = depenses.reduce((sum, d) => sum + parseFloat(d.montant), 0);
    const solde = totalCotisations + totalDons - totalDepenses;

    // Format PDF
    if (req.query.format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=rapport-annuel-${annee}.pdf`);
      doc.pipe(res);

      // En-tête
      doc.fontSize(20).text('CHORALE DAVID SEWA', { align: 'center' });
      doc.fontSize(14).text(`Rapport Annuel ${annee}`, { align: 'center' });
      doc.moveDown(2);

      // Résumé financier
      doc.fontSize(14).text('RÉSUMÉ FINANCIER ANNUEL', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Total Cotisations: ${totalCotisations.toLocaleString('fr-FR')} FCFA`);
      doc.text(`Total Dons: ${totalDons.toLocaleString('fr-FR')} FCFA`);
      doc.text(`Total Dépenses: ${totalDepenses.toLocaleString('fr-FR')} FCFA`);
      doc.moveDown();
      doc.fontSize(12).text(`SOLDE: ${solde.toLocaleString('fr-FR')} FCFA`, { bold: true });
      doc.moveDown(2);

      // Ventilation des dépenses par catégorie
      doc.fontSize(14).text('DÉPENSES PAR CATÉGORIE', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      depensesParCategorie.forEach(cat => {
        const catLibelles = { transport: 'Transport', materiel: 'Matériel', evenement: 'Événement', autre: 'Autre' };
        doc.text(`${catLibelles[cat.categorie]}: ${parseFloat(cat.total).toLocaleString('fr-FR')} FCFA`);
      });
      doc.moveDown(2);

      // Statistiques
      doc.fontSize(14).text('STATISTIQUES', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Nombre de cotisations: ${cotisations.length}`);
      doc.text(`Nombre de dons: ${dons.length}`);
      doc.text(`Nombre de dépenses: ${depenses.length}`);
      doc.moveDown();

      // Pied de page
      doc.fontSize(8).text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        { align: 'center' }
      );

      doc.end();
    } else {
      res.json({
        annee: parseInt(annee),
        totalCotisations,
        totalDons,
        totalDepenses,
        solde,
        nbCotisations: cotisations.length,
        nbDons: dons.length,
        nbDepenses: depenses.length,
        cotisations,
        dons,
        depenses,
        depensesParCategorie
      });
    }
  } catch (error) {
    console.error('Erreur getAnnuel:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Rapport des activités (Bilan financier par activité)
exports.getActivitesAnnuel = async (req, res) => {
  try {
    const { annee } = req.params;

    // Récupérer toutes les activités de l'année
    const [activites] = await pool.query(
      'SELECT * FROM activites WHERE annee = ? ORDER BY date_debut ASC',
      [annee]
    );

    // Pour chaque activité, calculer le total des dons et des dépenses
    for (let activite of activites) {
      const [dons] = await pool.query(
        'SELECT SUM(montant) as total FROM dons WHERE activite_id = ?',
        [activite.id]
      );
      const totalDons = dons[0].total || 0;

      const [depenses] = await pool.query(
        'SELECT SUM(montant) as total FROM depenses WHERE activite_id = ?',
        [activite.id]
      );
      const totalDepenses = depenses[0].total || 0;

      activite.total_dons = parseFloat(totalDons);
      activite.total_depenses = parseFloat(totalDepenses);
      activite.solde = parseFloat(totalDons) - parseFloat(totalDepenses);
    }

    res.json({
      annee: parseInt(annee),
      nbActivites: activites.length,
      activites: activites
    });

  } catch (error) {
    console.error('Erreur getActivitesAnnuel:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};
