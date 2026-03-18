-- Table pour la programmation des chants pour les répétitions
CREATE TABLE IF NOT EXISTS programme_repetition (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_dimanche DATE NOT NULL,
    id_chanteur_principal INT,
    id_chanteur_secondaire INT,
    description TEXT,
    annee YEAR NOT NULL,
    trimestre TINYINT NOT NULL CHECK (trimestre >= 1 AND trimestre <= 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_chanteur_principal) REFERENCES choristes(id) ON DELETE SET NULL,
    FOREIGN KEY (id_chanteur_secondaire) REFERENCES choristes(id) ON DELETE SET NULL,
    UNIQUE KEY unique_dimanche (date_dimanche),
    INDEX idx_trimestre (annee, trimestre)
);
