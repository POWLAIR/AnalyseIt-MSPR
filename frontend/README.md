# AnalyseIt Frontend

## Description

AnalyseIt est une application web moderne développée avec Next.js 14, TypeScript et Tailwind CSS. L'application offre une interface utilisateur intuitive pour l'analyse et la visualisation de données.

## Technologies Utilisées

- **Framework**: Next.js 14
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**:
  - Radix UI
  - Flowbite React
  - Framer Motion
- **Visualisation de données**:
  - Chart.js
  - Recharts
- **HTTP Client**: Axios
- **Utilitaires**:
  - date-fns
  - class-variance-authority
  - clsx
  - tailwind-merge

## Structure du Projet

```
frontend/
├── app/                    # Dossier principal de l'application Next.js
│   ├── admin/             # Section administration
│   ├── api/               # Routes API
│   ├── components/        # Composants réutilisables
│   ├── crud/             # Opérations CRUD
│   ├── dashboard/        # Tableau de bord
│   ├── features/         # Fonctionnalités spécifiques
│   ├── lib/              # Utilitaires et configurations
│   ├── stats/            # Visualisations statistiques
│   └── globals.css       # Styles globaux
├── public/               # Fichiers statiques
├── types/               # Définitions TypeScript
└── package.json         # Dépendances et scripts
```

## Installation

1. Cloner le repository

```bash
git clone [URL_DU_REPO]
cd frontend
```

2. Installer les dépendances

```bash
npm install
```

3. Configurer les variables d'environnement

```bash
cp .env.exemple .env.local
```

Modifiez les variables dans `.env.local` selon vos besoins.

## Scripts Disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Compile l'application pour la production
- `npm run start` : Démarre l'application en mode production
- `npm run lint` : Vérifie le code avec ESLint

## Fonctionnalités Principales

- Dashboard interactif
- Visualisation de données avec graphiques
- Interface d'administration
- Opérations CRUD
- API REST
- Statistiques et analyses

## Développement

### Architecture

L'application suit une architecture modulaire avec :

- Pages basées sur le système de routage de Next.js
- Composants réutilisables
- Hooks personnalisés
- Services API
- Types TypeScript

### Style et Design

- Utilisation de Tailwind CSS pour le styling
- Composants UI de Radix et Flowbite
- Animations avec Framer Motion
- Design responsive

## Déploiement

L'application peut être déployée avec Docker :

```bash
docker build -t analyseit-frontend .
docker run -p 3000:3000 analyseit-frontend
```

## Contribution

1. Créez une branche pour votre fonctionnalité
2. Committez vos changements
3. Poussez vers la branche
4. Ouvrez une Pull Request

## Licence

[Insérer la licence appropriée]

## Documentation Technique

### Architecture des Composants

#### Composants UI de Base

L'application utilise une bibliothèque de composants UI personnalisée construite sur Radix UI et Flowbite :

- **Composants de Base**:
  - `button.tsx`: Boutons personnalisables avec variantes
  - `input.tsx`: Champs de saisie stylisés
  - `select.tsx`: Menus déroulants avancés
  - `dialog.tsx`: Modales et dialogues
  - `toast.tsx`: Notifications système
  - `table.tsx`: Tableaux de données
  - `card.tsx`: Cartes pour l'affichage de contenu
  - `badge.tsx`: Badges et étiquettes
  - `progress.tsx`: Barres de progression
  - `tabs.tsx`: Navigation par onglets

#### Composants de Visualisation

Système complet de visualisation de données utilisant Chart.js et Recharts :

- **Types de Graphiques**:
  - `BarChart.tsx`: Graphiques en barres
  - `LineChart.tsx`: Graphiques en ligne
  - `PieChart.tsx`: Graphiques circulaires
  - `DoughnutChart.tsx`: Graphiques en anneau
  - `DetailedCharts.tsx`: Visualisations complexes
  - `ChartContainer.tsx`: Conteneur de graphiques réutilisable

### Système de Design

#### Configuration Tailwind

Le projet utilise une configuration Tailwind personnalisée avec :

- **Palette de Couleurs**:

  ```typescript
  colors: {
    primary: {
      50: '#f0f7ff',
      // ... 9 niveaux de teintes
      950: '#0a2e4e',
    },
    accent: {
      turquoise: '#2dd4bf',
      green: '#22c55e',
      blue: '#3b82f6',
      purple: '#a855f7',
    }
  }
  ```

- **Effets Visuels**:
  - Effets de verre (glass morphism)
  - Dégradés personnalisés
  - Ombres spécialisées
  - Flous d'arrière-plan

### Gestion d'État et API

#### Structure des Données

- Types TypeScript pour la validation des données
- Interfaces pour les modèles de données
- Hooks personnalisés pour la gestion d'état

#### Intégration API

- Utilisation d'Axios pour les requêtes HTTP
- Intercepteurs pour la gestion des erreurs
- Gestion des tokens d'authentification
- Cache et mise en cache des requêtes

### Performance et Optimisation

#### Techniques d'Optimisation

- Chargement différé des composants
- Optimisation des images
- Mise en cache des requêtes API
- Code splitting automatique

#### Bonnes Pratiques

- Lazy loading des routes
- Optimisation des bundles
- Gestion efficace des assets
- Monitoring des performances

### Tests et Qualité de Code

#### Outils de Test

- Tests unitaires avec Jest
- Tests de composants avec React Testing Library
- Tests d'intégration
- Tests de performance

#### Qualité de Code

- ESLint pour le linting
- Prettier pour le formatage
- Husky pour les pre-commit hooks
- Revue de code automatisée

### Sécurité

#### Mesures de Sécurité

- Protection CSRF
- Validation des entrées
- Sanitization des données
- Gestion sécurisée des tokens

#### Authentification

- JWT pour l'authentification
- Refresh tokens
- Gestion des sessions
- Protection des routes

### Déploiement et CI/CD

#### Pipeline de Déploiement

- Build automatisé
- Tests automatisés
- Déploiement continu
- Environnements de staging

#### Configuration Docker

- Multi-stage builds
- Optimisation des images
- Variables d'environnement
- Health checks
