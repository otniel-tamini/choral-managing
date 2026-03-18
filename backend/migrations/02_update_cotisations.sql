-- Migration pour rendre le mois nullable et retirer la contrainte unique
ALTER TABLE cotisations MODIFY COLUMN mois TINYINT NULL;
ALTER TABLE cotisations DROP INDEX unique_cotisation;
