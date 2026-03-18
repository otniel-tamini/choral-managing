-- 1. Création de la table des activités
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

-- 2. Ajout de la clé étrangère sur la table des dépenses
ALTER TABLE depenses 
ADD COLUMN activite_id INT NULL AFTER categorie,
ADD CONSTRAINT fk_depense_activite FOREIGN KEY (activite_id) REFERENCES activites(id) ON DELETE SET NULL;

-- 3. Ajout de la clé étrangère sur la table des dons
ALTER TABLE dons 
ADD COLUMN activite_id INT NULL AFTER montant,
ADD CONSTRAINT fk_don_activite FOREIGN KEY (activite_id) REFERENCES activites(id) ON DELETE SET NULL;
