const { pool } = require('../config/database');

/**
 * Récupère la programmation pour une période donnée
 */
exports.getByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Date de début et date de fin sont obligatoires' });
    }

    const query = `
      SELECT p.*, 
             c1.nom as principal_nom, c1.prenom as principal_prenom,
             c2.nom as secondaire_nom, c2.prenom as secondaire_prenom
      FROM programme_repetition p
      LEFT JOIN choristes c1 ON p.id_chanteur_principal = c1.id
      LEFT JOIN choristes c2 ON p.id_chanteur_secondaire = c2.id
      WHERE p.date_dimanche BETWEEN ? AND ?
      ORDER BY p.date_dimanche ASC
    `;

    const [rows] = await pool.query(query, [startDate, endDate]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur getByRange:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/**
 * Crée ou met à jour une entrée de programmation
 */
exports.createOrUpdate = async (req, res) => {
  try {
    const { 
      date_dimanche, 
      id_chanteur_principal, 
      id_chanteur_secondaire, 
      description
    } = req.body;

    if (!date_dimanche) {
      return res.status(400).json({ error: 'La date est obligatoire' });
    }

    const date = new Date(date_dimanche);
    const annee = date.getFullYear();
    const trimestre = Math.floor(date.getMonth() / 3) + 1;

    // On utilise UPSERT: INSERT ... ON DUPLICATE KEY UPDATE
    const query = `
      INSERT INTO programme_repetition 
        (date_dimanche, id_chanteur_principal, id_chanteur_secondaire, description, annee, trimestre)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        id_chanteur_principal = VALUES(id_chanteur_principal),
        id_chanteur_secondaire = VALUES(id_chanteur_secondaire),
        description = VALUES(description),
        annee = VALUES(annee),
        trimestre = VALUES(trimestre)
    `;

    await pool.query(query, [
      date_dimanche, 
      id_chanteur_principal || null, 
      id_chanteur_secondaire || null, 
      description || null,
      annee,
      trimestre
    ]);

    const [row] = await pool.query('SELECT * FROM programme_repetition WHERE date_dimanche = ?', [date_dimanche]);
    res.json(row[0]);
  } catch (error) {
    console.error('Erreur createOrUpdate programmation:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/**
 * Exporte la programmation en PDF
 */
exports.exportPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Date de début et date de fin sont obligatoires' });
    }

    const query = `
      SELECT p.*, 
             c1.nom as principal_nom, c1.prenom as principal_prenom,
             c2.nom as secondaire_nom, c2.prenom as secondaire_prenom
      FROM programme_repetition p
      LEFT JOIN choristes c1 ON p.id_chanteur_principal = c1.id
      LEFT JOIN choristes c2 ON p.id_chanteur_secondaire = c2.id
      WHERE p.date_dimanche BETWEEN ? AND ?
      ORDER BY p.date_dimanche ASC
    `;

    const [rows] = await pool.query(query, [startDate, endDate]);

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: 'Programmation des Chants - Chorale David Sewa',
        Author: 'David Sewa Admin'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=programmation-${startDate}-au-${endDate}.pdf`);
    doc.pipe(res);

    // Couleurs de la charte
    const navyColor = '#2C3E50';
    const goldColor = '#D4AF37';
    const grayColor = '#F9F9F9';

    // En-tête avec bannière
    doc.rect(0, 0, 600, 100).fill(navyColor);
    doc.fillColor(goldColor).fontSize(26).font('Helvetica-Bold').text('CHORALE DAVID SEWA', 50, 35);
    doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica').text('PROGRAMMATION DES RÉPÉTITIONS', 50, 70);
    
    doc.fillColor('#FFFFFF').fontSize(9).text(
      `Période: ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`,
      400, 70, { align: 'right' }
    );

    doc.moveDown(4);

    // Tableau
    const startX = 50;
    const startY = 130;
    const rowHeight = 35;
    const colDateWidth = 110;
    const colPrincipalWidth = 200;
    const colSecondaireWidth = 200;

    // Header tableau
    doc.rect(startX, startY, 510, 25).fill(goldColor);
    doc.fillColor(navyColor).fontSize(10).font('Helvetica-Bold');
    doc.text('DATE', startX + 10, startY + 8);
    doc.text('CHANTEUR PRINCIPAL', startX + colDateWidth + 10, startY + 8);
    doc.text('REMPLAÇANT (SECONDAIRE)', startX + colDateWidth + colPrincipalWidth + 10, startY + 8);

    let currentY = startY + 25;

    rows.forEach((row, index) => {
      // Nouvelle page si nécessaire
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
        
        // Réimprimer l'entête sur la nouvelle page
        doc.rect(startX, currentY, 510, 22).fill(goldColor);
        doc.fillColor(navyColor).fontSize(10).font('Helvetica-Bold');
        doc.text('DATE', startX + 10, currentY + 7);
        doc.text('CHANTEUR PRINCIPAL', startX + colDateWidth + 10, currentY + 7);
        doc.text('REMPLAÇANT', startX + colDateWidth + colPrincipalWidth + 10, currentY + 7);
        currentY += 22;
      }

      // Fond alterné pour les lignes
      if (index % 2 === 0) {
        doc.rect(startX, currentY, 510, rowHeight).fill(grayColor);
      } else {
        doc.rect(startX, currentY, 510, rowHeight).fill('#FFFFFF');
      }

      // Bordure basse
      doc.moveTo(startX, currentY + rowHeight).lineTo(startX + 510, currentY + rowHeight).strokeColor('#E0E0E0').lineWidth(0.5).stroke();

      // Contenu
      doc.fillColor(navyColor).font('Helvetica-Bold').fontSize(10);
      const dateStr = new Date(row.date_dimanche).toLocaleDateString('fr-FR', {
        weekday: 'short', day: 'numeric', month: 'short'
      });
      doc.text(dateStr.toUpperCase(), startX + 10, currentY + 12);

      doc.font('Helvetica').fontSize(10).fillColor('#333333');
      const principal = row.principal_nom ? `${row.principal_nom.toUpperCase()} ${row.principal_prenom}` : 'Non défini';
      const secondaire = row.secondaire_nom ? `${row.secondaire_nom.toUpperCase()} ${row.secondaire_prenom}` : 'Non défini';

      doc.text(principal, startX + colDateWidth + 10, currentY + 12, { width: colPrincipalWidth - 15 });
      doc.text(secondaire, startX + colDateWidth + colPrincipalWidth + 10, currentY + 12, { width: colSecondaireWidth - 15 });

      currentY += rowHeight;
    });

    // Pied de page
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fillColor('#888888').fontSize(8);
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} - Chorale David Sewa - Page ${i + 1} sur ${totalPages}`,
        50, 800, { align: 'center' }
      );
    }

    doc.end();
  } catch (error) {
    console.error('Erreur exportPDF:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/**
 * Supprime une entrée de programmation
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM programme_repetition WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Programmation non trouvée' });
    }

    res.json({ message: 'Programmation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur delete programmation:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};
