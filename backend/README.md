# Backend AnalyseIt

Backend FastAPI pour l'analyse et la visualisation de données épidémiologiques. Ce projet fournit une API RESTful pour gérer et analyser les données d'épidémies mondiales.

## 🌟 Fonctionnalités

- API RESTful avec documentation OpenAPI (Swagger)
- Gestion complète des épidémies et de leurs statistiques
- ETL automatisé depuis Kaggle
- Tableau de bord d'analyse
- Gestion des localisations géographiques
- Suivi des sources de données
- Statistiques quotidiennes et globales

## 🛠️ Technologies

- **FastAPI** (0.109.0) : Framework web moderne et performant
- **SQLAlchemy** (2.0.25) : ORM pour la gestion de la base de données
- **PyMySQL** (1.1.0) : Driver MySQL pour Python
- **Pydantic** (2.5.3) : Validation des données
- **Pandas & NumPy** : Analyse et manipulation des données
- **Alembic** (1.13.1) : Migrations de base de données
- **Kaggle Hub** : Intégration avec les datasets Kaggle
- **Pytest** (7.4.4) : Tests unitaires et d'intégration

## 📁 Structure du Projet

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/     # Points d'entrée API
│   │   └── dependencies.py
│   ├── core/
│   │   └── config/       # Configuration
│   ├── db/
│   │   ├── models/       # Modèles SQLAlchemy
│   │   ├── repositories/ # Accès aux données
│   │   └── session.py    # Configuration DB
│   ├── routes/          # Routage API
│   ├── services/        # Logique métier
│   ├── utils/           # Utilitaires
│   └── main.py         # Point d'entrée
├── tests/              # Tests
└── sql/               # Scripts SQL
```

## 🚀 Installation

1. Cloner le repository :

```bash
git clone <repository-url>
cd backend
```

2. Créer l'environnement virtuel :

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# ou
venv\Scripts\activate     # Windows
```

3. Installer les dépendances :

```bash
pip install -r requirements.txt
```

4. Configuration :

```bash
cp .env.exemple .env
# Éditer .env avec vos paramètres
```

## ⚙️ Configuration

Variables d'environnement requises :

```env
DATABASE_URL=mysql://user:password@localhost:3306/analyseit
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your-secret-key
```

## 🏃‍♂️ Démarrage

1. Démarrer le serveur :

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Accéder à :

- API : http://localhost:8000
- Documentation : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc

## 🔄 Points d'entrée API

### Administration

- `GET /api/v1/admin/health` : Vérification de l'état
- `POST /api/v1/admin/run-etl` : Exécution de l'ETL
- `GET /api/v1/admin/extract-data` : Extraction des données

### Épidémies

- `GET /api/v1/epidemics/` : Liste des épidémies
- `GET /api/v1/epidemics/{id}` : Détails d'une épidémie
- `GET /api/v1/epidemics/stats` : Statistiques globales
- `GET /api/v1/epidemics/filters` : Options de filtrage

### Tableau de bord

- `GET /api/v1/dashboard/` : Données du tableau de bord
- `GET /api/v1/dashboard/stats` : Statistiques détaillées

### Statistiques

- `GET /api/v1/stats/daily` : Statistiques quotidiennes
- `GET /api/v1/stats/overall` : Vue d'ensemble

### Données

- `GET /api/v1/locations/` : Gestion des localisations
- `GET /api/v1/data-sources/` : Sources de données

## 🐳 Docker

```bash
# Construction de l'image
docker build -t analyseit-backend .

# Lancement du conteneur
docker run -p 8000:8000 analyseit-backend
```

## 🧪 Tests

```bash
# Tests unitaires
pytest

# Avec couverture
pytest --cov=app tests/

# Tests spécifiques
pytest tests/test_api.py -v
```

## 🔒 Sécurité

- Validation des données avec Pydantic
- Protection CORS configurée
- Gestion sécurisée des connexions DB
- Variables d'environnement pour les secrets

## 📚 Documentation

La documentation complète de l'API est disponible via Swagger UI (/docs) et ReDoc (/redoc), incluant :

- Schémas de données
- Exemples de requêtes
- Réponses attendues
- Codes d'erreur

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
