# **Pandemic Analysis Platform**

Cette plateforme est conçue pour collecter, nettoyer, analyser et visualiser les données sur les pandémies. Elle utilise une architecture basée sur **Docker**, avec un backend en **FastAPI**, un frontend en **Next.js**, et une base de données **MySQL**.

## **Fonctionnalités principales**

- **Backend** : API REST utilisant FastAPI, connectée à une base de données MySQL pour gérer les données des pandémies.
- **Frontend** : Interface utilisateur interactive en Next.js avec Tailwind CSS pour les styles.
- **Base de données** : Stockage des données relationnelles avec MySQL.
- **CI/CD** : Pipeline GitHub Actions pour le linting, les tests et la construction des conteneurs Docker.

---

## **Structure du projet**

```
.github/workflows/
  └── ci.yml                # Pipeline CI/CD pour GitHub Actions

backend/
  ├── core/
  │   └── db.py             # Connexion à la base de données MySQL
  ├── tests/
  │   └── test_main.py      # Tests unitaires pour le backend
  ├── Dockerfile            # Dockerfile pour le backend
  ├── main.py               # Point d'entrée de l'application FastAPI
  ├── requirements.txt      # Dépendances Python pour le backend

frontend/
  ├── app/
  │   ├── components/
  │   │   └── TestButton/   # Composant interactif de test
  │   ├── styles/
  │   │   └── globals.css   # Styles globaux pour le projet
  │   ├── favicon.ico       # Favicon du site
  │   ├── layout.tsx        # Layout global du site
  │   └── page.tsx          # Page principale de l'application
  ├── Dockerfile            # Dockerfile pour le frontend
  ├── next.config.js        # Configuration Next.js
  ├── package.json          # Dépendances Node.js pour le frontend

docker-compose.yml          # Configuration des services Docker
```

---

## **Prérequis**

Avant de commencer, assurez-vous d'avoir installé :

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git Bash](https://git-scm.com/downloads/win)

---

## **Installation**

1. Clonez le dépôt :

   ```bash
   git clone <URL_DU_DEPOT>
   cd pandemic-analysis-platform
   ```

2. Configuration de l'environnement :

- Créez un fichier `.env.local` dans le dossier `frontend` avec les variables d'environnement suivantes :

  ```bash
  cd frontend
  cp .env.example .env.local
  ```

  - Copiez le fichier `.env.example` dans le dossier `backend` pour créer votre configuration :

  ```bash
  cd backend
  cp .env.example .env
  ```

3. Construisez et démarrez les conteneurs Docker :

Au sein d'un terminal git bash, exécutez la commande suivante :

```bash
docker-compose build --no-cache
docker-compose up
```

3. Les services seront accessibles aux ports suivants :
   - **Backend** : [http://localhost:8000](http://localhost:8000)
   - **Frontend** : [http://localhost:3000](http://localhost:3000)
   - **MySQL** : Port 3306

---

## **Commandes utiles**

### Backend

- Accéder au conteneur backend :
  ```bash
  docker exec -it backend bash
  ```
- Installer une nouvelle dépendance Python :
  ```bash
  pip install <nom_dependance>
  ```

### Frontend

- Installer une nouvelle dépendance Node.js :
  ```bash
  docker exec -it frontend bash
  npm install <nom_dependance>
  ```

### Général

- Redémarrer les conteneurs :
  ```bash
  docker-compose down
  docker-compose up -d
  ```

---

## **Tests**

### Backend

Pour exécuter les tests du backend, utilisez :

```bash
docker exec -it backend pytest
```

### Frontend

Pour exécuter les tests du frontend, utilisez :

```bash
docker exec -it frontend npm run test
```

---
## **Linter **
### Backend

pour linter le backend, utilisez :

```bash
docker exec -it backend flake8 .
```

### Frontend

pour linter le frontend, utilisez :

```bash
docker exec -it frontend npm run lint
```

## **Contribution**

1. Forkez le dépôt.
2. Créez une branche pour vos modifications :
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```
3. Soumettez une Pull Request.

---

## **Licence**

Ce projet est sous licence **MIT**.
