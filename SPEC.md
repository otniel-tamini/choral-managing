# David Sewa - Application de Gestion Comptable

## 1. Concept & Vision

Application de comptabilité dédiée à la chorale **David Sewa**, diseñada pour simplifier la gestion financière quotidienne. L'interface évoque warmth communautaire avec des tons dorés et profonds, reflétant la richesse musicale et spirituelle de la chorale. Usage simple, accessible même aux non-techniciens.

## 2. Design Language

### Aesthetic Direction
Style moderne et épuré avec touches traditionnelles africaines - évoque la dignité et la richesse culturelle.

### Color Palette
- **Primary**: #D4AF37 (Or)
- **Secondary**: #2C3E50 (Bleu nuit profond)
- **Accent**: #E74C3C (Rouge chaleureux)
- **Background**: #F8F9FA (Gris très clair)
- **Surface**: #FFFFFF
- **Text Primary**: #2C3E50
- **Text Secondary**: #7F8C8D
- **Success**: #27AE60
- **Warning**: #F39C12
- **Error**: #E74C3C

### Typography
- **Headings**: 'Playfair Display', serif (élégance traditionnelle)
- **Body**: 'Inter', sans-serif (lisibilité moderne)
- **Monospace**: 'JetBrains Mono' (chiffres financiers)

### Spatial System
- Base unit: 8px
- Spacing scale: 8, 16, 24, 32, 48, 64px
- Border radius: 8px (cards), 4px (inputs), 50% (avatars)
- Shadows: subtle, warm tones

### Motion Philosophy
- Transitions douces (200-300ms ease-out)
- Micro-interactions sur hover (scale 1.02)
- Fade-in pour les chargement de données
- Slide-in pour les notifications

## 3. Layout & Structure

### Architecture des pages
```
├── Dashboard (/)
├── Choristes (/choristes)
├── Cotisations (/cotisations)
├── Dons (/dons)
├── Dépenses (/depenses)
└── Rapports (/rapports)
```

### Sidebar Navigation
- Logo Chorale en haut
- Navigation principale avec icônes
- Indicateur actif avec highlight doré
- Nom et rôle utilisateur en bas

### Responsive Strategy
- Desktop first (1200px+)
- Tablette (768px-1199px): sidebar collapsible
- Mobile (< 768px): bottom navigation

## 4. Features & Interactions

### 4.1 Gestion des Choristes
- **Liste**: Tableau avec recherche instantanée, filtre statut
- **CRUD Modal**: Formulaire avec validation temps réel
- **Historique**: Vue détaillée avec timeline cotisations
- **États**: 
  - Actif (badge vert)
  - Inactif (badge gris)

### 4.2 Cotisations Mensuelles
- **Vue mensuelle**: Grille par année/mois
- **Ajout rapide**: Sélection choriste → montant → validation
- **Indicateur paiement**: Vert (payé), Rouge (en retard)
- **Filtres**: Par année, mois, statut paiement

### 4.3 Dons
- **Liste**: Tableau chronologique inversé
- **Statistiques**: Don moyen, plus grand don
- **Filtres**: Par période, montant

### 4.4 Dépenses
- **Catégories visuelles**: Icônes distinctes par catégorie
- **Filtres**: Catégorie, période
- **Saisie**: libellé, montant, catégorie, date, description

### 4.5 Dashboard
- **Cartes KPI**: 4 métriques principales avec icônes
- **Graphique évolution**: Line chart cotisations vs dépenses (12 mois)
- **Graphique répartition**: Doughnut chart dépenses par catégorie
- **10 dernières transactions**: Timeline compact

### 4.6 Rapports
- **Sélection période**: Trimestre ou année
- **Aperçu PDF**: Dans le navigateur
- **Téléchargement**: PDF formaté professionnellement
- **Export Excel**: CSV compatible Excel

## 5. Component Inventory

### Sidebar
- États: expanded, collapsed
- Hover: highlight doré
- Active: background doré 10%, bordure gauche

### DataTable
- Header sticky
- Hover rows: background subtle
- Pagination: 10, 25, 50 items
- Actions: Edit, Delete avec confirmation

### Modal
- Overlay sombre (rgba(0,0,0,0.5))
- Animation: scale 0.95 → 1, opacity
- Close: X button, click outside, Escape key

### Form Inputs
- Default: border gris
- Focus: border doré, shadow subtle
- Error: border rouge, message dessous
- Success: border vert temporaire

### Buttons
- Primary: background doré, text noir
- Secondary: outline doré
- Danger: background rouge
- Disabled: opacity 0.5, cursor not-allowed
- Loading: spinner intégré

### Cards (Dashboard)
- Shadow légère
- Hover: shadow plus prononcée
- Icon avec background circulaire

### Charts
- Palette: Or, Bleu nuit, Rouge, Vert
- Tooltips au hover
- Légende interactive

## 6. Technical Approach

### Backend (Node.js + Express)

#### Structure MVC
```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── choristeController.js
│   ├── CotisationController.js
│   ├── donController.js
│   ├── depenseController.js
│   └── dashboardController.js
├── models/
│   └── index.js
├── routes/
│   └── index.js
├── middleware/
│   └── validation.js
├── server.js
└── package.json
```

#### Base de données MySQL

**Table: choristes**
| Champ | Type | Contraintes |
|-------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| nom | VARCHAR(100) | NOT NULL |
| prenom | VARCHAR(100) | NOT NULL |
| telephone | VARCHAR(20) | |
| statut | ENUM('actif','inactif') | DEFAULT 'actif' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

**Table: cotisations**
| Champ | Type | Contraintes |
|-------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| choriste_id | INT | FK → choristes.id |
| mois | TINYINT | 1-12 |
| année | YEAR | NOT NULL |
| montant | DECIMAL(10,0) | NOT NULL |
| date_paiement | DATE | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Table: dons**
| Champ | Type | Contraintes |
|-------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| donateur | VARCHAR(200) | NOT NULL |
| montant | DECIMAL(10,0) | NOT NULL |
| date | DATE | NOT NULL |
| description | TEXT | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Table: depenses**
| Champ | Type | Contraintes |
|-------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| libelle | VARCHAR(200) | NOT NULL |
| montant | DECIMAL(10,0) | NOT NULL |
| categorie | ENUM | transport,materiel,evenement,autre |
| date | DATE | NOT NULL |
| description | TEXT | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Index**: choriste_id sur cotisations, date sur toutes les tables.

#### API Endpoints

**Choristes**
- `GET /api/choristes` - Liste avec filtres
- `GET /api/choristes/:id` - Détail avec historique
- `POST /api/choristes` - Création
- `PUT /api/choristes/:id` - Modification
- `DELETE /api/choristes/:id` - Suppression

**Cotisations**
- `GET /api/cotisations` - Liste avec filtres
- `POST /api/cotisations` - Création
- `PUT /api/cotisations/:id` - Modification
- `DELETE /api/cotisations/:id` - Suppression
- `GET /api/cotisations/chronique/:choristeId` - Historique choriste
- `GET /api/cotisations/mois/:annee/:mois` - Cotisations du mois

**Dons**
- `GET /api/dons` - Liste
- `POST /api/dons` - Création
- `PUT /api/dons/:id` - Modification
- `DELETE /api/dons/:id` - Suppression

**Dépenses**
- `GET /api/depenses` - Liste
- `POST /api/depenses` - Création
- `PUT /api/depenses/:id` - Modification
- `DELETE /api/depenses/:id` - Suppression

**Dashboard**
- `GET /api/dashboard` - Métriques globales
- `GET /api/dashboard/evolution` - Données graphiques mensuelles

**Rapports**
- `GET /api/rapports/trimestriel/:annee/:trimestre` - Rapport trimestriel
- `GET /api/rapports/annuel/:annee` - Rapport annuel
- `GET /api/export/excel/:type` - Export Excel

### Frontend (Vue.js 3)

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TheSidebar.vue
│   │   │   └── TheHeader.vue
│   │   ├── common/
│   │   │   ├── DataTable.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Button.vue
│   │   │   └── InputField.vue
│   │   └── charts/
│   │       ├── LineChart.vue
│   │       └── DoughnutChart.vue
│   ├── views/
│   │   ├── DashboardView.vue
│   │   ├── ChoristesView.vue
│   │   ├── CotisationsView.vue
│   │   ├── DonsView.vue
│   │   ├── DepensesView.vue
│   │   └── RapportsView.vue
│   ├── services/
│   │   └── api.js
│   ├── stores/
│   │   └── app.js
│   ├── router/
│   │   └── index.js
│   ├── App.vue
│   └── main.js
└── package.json
```

### Docker Setup
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: david_sewa
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
  
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - mysql
    environment:
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=rootpassword
      - DB_NAME=david_sewa
  
  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```
