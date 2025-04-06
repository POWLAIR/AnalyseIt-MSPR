# Utilisation d'une image Node.js légère
FROM node:18-alpine

# Définition du répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Définir la variable d'environnement
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

# Le reste des fichiers sera monté comme un volume dans docker-compose
# pour le développement

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Commande de démarrage pour le développement
CMD ["npm", "run", "dev"]
