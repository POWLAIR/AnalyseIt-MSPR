# Utilisation d'une image Node.js légère
FROM node:18-alpine

# Définition du répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json ./

# Installer les dépendances AVANT de copier les fichiers pour optimiser le cache
RUN npm install --legacy-peer-deps

# Copier les fichiers d'environnement
COPY .env.local ./

# Copier le reste des fichiers du projet
COPY . .

# Construire l'application Next.js
RUN npm run build

# Vérification que Next.js est bien installé
RUN ls -la /app/node_modules/.bin/

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start"]
