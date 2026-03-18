-- Initialisation de la base de données David Sewa

-- Table des choristes
CREATE TABLE IF NOT EXISTS choristes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    statut ENUM('actif', 'inactif') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_statut (statut)
);

-- Table des activites
CREATE TABLE IF NOT EXISTS activites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annee YEAR NOT NULL,
    nom VARCHAR(200) NOT NULL,
    date_debut DATE,
    date_fin DATE,
    statut ENUM('prevu', 'en cours', 'termine', 'annule') DEFAULT 'prevu',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_annee (annee)
);

-- Table des cotisations
CREATE TABLE IF NOT EXISTS cotisations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    choriste_id INT NOT NULL,
    mois TINYINT NULL,
    annee YEAR NOT NULL,
    montant DECIMAL(10,0) NOT NULL,
    date_paiement DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (choriste_id) REFERENCES choristes(id) ON DELETE CASCADE,
    INDEX idx_annee_mois (annee, mois),
    INDEX idx_choriste (choriste_id)
);

-- Table des dons
CREATE TABLE IF NOT EXISTS dons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donateur VARCHAR(200) NOT NULL,
    montant DECIMAL(10,0) NOT NULL,
    activite_id INT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activite_id) REFERENCES activites(id) ON DELETE SET NULL,
    INDEX idx_date (date),
    INDEX idx_activite (activite_id)
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS depenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(200) NOT NULL,
    montant DECIMAL(10,0) NOT NULL,
    categorie ENUM('transport', 'materiel', 'evenement', 'autre') NOT NULL,
    activite_id INT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activite_id) REFERENCES activites(id) ON DELETE SET NULL,
    INDEX idx_categorie (categorie),
    INDEX idx_date (date),
    INDEX idx_activite (activite_id)
);

-- Données de test - Choristes
INSERT INTO choristes (nom, prenom, telephone, statut) VALUES
('Kone', 'Aminata', '+225 07 00 11 22 33', 'actif'),
('Diallo', 'Mamadou', '+225 07 00 44 55 66', 'actif'),
('Traore', 'Fatou', '+225 07 00 77 88 99', 'actif'),
('Koné', 'Boubacar', '+225 07 01 11 22 33', 'actif'),
('Sangaré', 'Aïssatou', '+225 07 01 44 55 66', 'inactif'),
('Cissé', 'Oumar', '+225 07 02 11 22 33', 'actif'),
('Toure', 'Mariama', '+225 07 02 44 55 66', 'actif'),
('Bamba', 'Cheick', '+225 07 03 11 22 33', 'actif');

-- Données de test - Cotisations (2026)
INSERT INTO cotisations (choriste_id, mois, annee, montant, date_paiement) VALUES
(1, 1, 2026, 5000, '2026-01-05'),
(1, 2, 2026, 5000, '2026-02-03'),
(1, 3, 2026, 5000, '2026-03-02'),
(2, 1, 2026, 5000, '2026-01-08'),
(2, 2, 2026, 5000, '2026-02-07'),
(3, 1, 2026, 5000, '2026-01-10'),
(4, 1, 2026, 5000, '2026-01-15'),
(4, 2, 2026, 5000, '2026-02-12'),
(4, 3, 2026, 5000, '2026-03-10'),
(6, 1, 2026, 5000, '2026-01-20'),
(7, 1, 2026, 5000, '2026-01-25'),
(8, 1, 2026, 5000, '2026-01-28');

-- Données de test - Dons
INSERT INTO dons (donateur, montant, date, description) VALUES
('Membre sympathisant', 50000, '2026-01-15', 'Don anonyme'),
('Paroisse Saint-Jean', 100000, '2026-02-01', 'Soutien annuel'),
('Famille Koné', 25000, '2026-02-20', 'Don marriage'),
('Entreprise ABC', 200000, '2026-03-01', 'Sponsor concert');

-- Données de test - Dépenses
INSERT INTO depenses (libelle, montant, categorie, date, description) VALUES
('Carburant minibus', 30000, 'transport', '2026-01-10', 'Déplacement répétition'),
('Location salle', 75000, 'evenement', '2026-01-25', 'Concert charité'),
('Microphones', 120000, 'materiel', '2026-02-05', 'Équipement nouveau'),
('Transport chorale', 45000, 'transport', '2026-02-15', 'Festival régional'),
('Costumes scène', 180000, 'materiel', '2026-02-28', 'Achats costumes'),
('Réception invités', 60000, 'evenement', '2026-03-05', 'Événement communautaire');
