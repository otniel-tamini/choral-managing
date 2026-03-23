const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'david_sewa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDatabase = async () => {
  const connection = await pool.getConnection();
  
  try {
    // Create choristes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS choristes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20),
        statut ENUM('actif', 'inactif') DEFAULT 'actif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_statut (statut)
      )
    `);

    // Create cotisations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cotisations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        choriste_id INT NOT NULL,
        mois TINYINT NOT NULL CHECK (mois >= 1 AND mois <= 12),
        annee YEAR NOT NULL,
        montant DECIMAL(10,0) NOT NULL,
        date_paiement DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (choriste_id) REFERENCES choristes(id) ON DELETE CASCADE,
        INDEX idx_annee_mois (annee, mois),
        INDEX idx_choriste (choriste_id),
        UNIQUE KEY unique_cotisation (choriste_id, mois, annee)
      )
    `);

    // Create dons table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS dons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donateur VARCHAR(200) NOT NULL,
        montant DECIMAL(10,0) NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_date (date)
      )
    `);

    // Create depenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS depenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        libelle VARCHAR(200) NOT NULL,
        montant DECIMAL(10,0) NOT NULL,
        categorie ENUM('transport', 'materiel', 'evenement', 'autre') NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_categorie (categorie),
        INDEX idx_date (date)
      )
    `);

    // Create programme_repetition table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS programme_repetition (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_dimanche DATE NOT NULL,
        id_chanteur_principal INT,
        id_chanteur_secondaire INT,
        description TEXT,
        annee YEAR NOT NULL,
        trimestre TINYINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_chanteur_principal) REFERENCES choristes(id) ON DELETE SET NULL,
        FOREIGN KEY (id_chanteur_secondaire) REFERENCES choristes(id) ON DELETE SET NULL,
        UNIQUE KEY unique_dimanche (date_dimanche),
        INDEX idx_trimestre (annee, trimestre)
      )
    `);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur initialization base de données:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { pool, initDatabase };
