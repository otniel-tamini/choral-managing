# David Sewa - Application de Gestion Comptable

Application web complète pour la gestion comptable de la chorale **David Sewa**.

## 🚀 Démarrage rapide

### Avec Docker (Recommandé)

```bash
# Cloner le projet
git clone <repo-url>
cd david-sewa

# Lancer l'application
docker-compose up -d

# L'application sera disponible sur:
# - Frontend: http://localhost:8080
# - API: http://localhost:3000/api
```

### Développement local

#### Prérequis
- Node.js 18+
- MySQL 8.0+

#### Backend

```bash
cd backend
npm install
cp .env.example .env  # Modifier les configs si nécessaire
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📁 Structure du projet

```
david-sewa/
├── backend/
│   ├── config/
│   │   └── database.js       # Configuration MySQL
│   ├── controllers/          # Logique métier
│   ├── routes/               # Routes API
│   ├── .env                  # Variables d'environnement
│   ├── server.js             # Point d'entrée
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Composants Vue
│   │   ├── views/            # Pages
│   │   ├── services/         # Appels API
│   │   └── router/           # Routing
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── SPEC.md
└── README.md
```

## 🔌 API Endpoints

### Choristes
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/choristes | Liste des choristes |
| GET | /api/choristes/:id | Détail choriste |
| POST | /api/choristes | Créer choriste |
| PUT | /api/choristes/:id | Modifier choriste |
| DELETE | /api/choristes/:id | Supprimer choriste |

### Cotisations
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/cotisations | Liste cotisations |
| POST | /api/cotisations | Créer cotisation |
| GET | /api/cotisations/mois/:annee/:mois | Cotisations du mois |

### Dons
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/dons | Liste des dons |
| POST | /api/dons | Créer un don |
| PUT | /api/dons/:id | Modifier un don |
| DELETE | /api/dons/:id | Supprimer un don |

### Dépenses
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/depenses | Liste des dépenses |
| POST | /api/depenses | Créer une dépense |
| PUT | /api/depenses/:id | Modifier une dépense |
| DELETE | /api/depenses/:id | Supprimer une dépense |

### Dashboard
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/dashboard | Statistiques globales |
| GET | /api/dashboard/evolution | Données graphiques |

### Rapports
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/rapports/trimestriel/:annee/:trimestre | Rapport trimestriel |
| GET | /api/rapports/annuel/:annee | Rapport annuel |

### Export
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/export/excel/:type | Export CSV |

## 📊 Base de données

### Schéma relationnel

```
┌─────────────────┐     ┌─────────────────┐
│   choristes     │     │  cotisations   │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │────<│ choriste_id (FK)│
│ nom             │     │ mois           │
│ prenom         │     │ annee          │
│ telephone      │     │ montant        │
│ statut          │     │ date_paiement  │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│      dons       │     │   depenses     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)        │
│ donateur        │     │ libelle        │
│ montant         │     │ montant        │
│ date           │     │ categorie      │
│ description    │     │ date          │
└─────────────────┘     │ description    │
                        └─────────────────┘
```

## 🎨 Fonctionnalités

- ✅ Gestion des choristes (CRUD)
- ✅ Gestion des cotisations mensuelles
- ✅ Gestion des dons
- ✅ Gestion des dépenses par catégorie
- ✅ Tableau de bord avec graphiques
- ✅ Rapports trimestriels et annuels (PDF)
- ✅ Export Excel (CSV)
- ✅ Interface responsive
- ✅ Validation des formulaires

## 🛠️ Technologies

**Backend:**
- Node.js + Express.js
- MySQL 8.0
- PDFKit (génération PDF)
- ExcelJS (export Excel)

**Frontend:**
- Vue.js 3 (Composition API)
- Tailwind CSS
- Chart.js + vue-chartjs
- Axios

## 📝 Licence

Propriétaire - Chorale David Sewa
# choral-managing
