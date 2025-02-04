# Utiliser une image légère Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'installation des dépendances
COPY package.json package-lock.json ./

# Installer les dépendances (avec cache Docker si les fichiers de dépendances n'ont pas changé)
RUN npm install

# Copier le fichier .env
COPY .env ./

# Copier le reste du code source
COPY . .

# Construire l'application React pour la production
RUN npm run build

# Installer "serve" pour servir l'application
RUN npm install -g serve

# Exposer le port pour React
EXPOSE 3000

# Commande pour exécuter l'application
CMD ["serve", "-s", "build", "-l", "3000"]
