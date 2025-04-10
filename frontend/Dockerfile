# Utilisation d'une image Node.js LTS
FROM node:20-alpine

# Définition du répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Installer toutes les dépendances en une seule commande
RUN npm install -g npm@latest && \
    npm install && \
    npm install postcss-import @radix-ui/react-select --save && \
    npm audit fix --force

# Copier le reste des fichiers
COPY . .

# Build l'application
RUN npm run build

# Définir la variable d'environnement
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NODE_ENV=development

# Le reste des fichiers sera monté comme un volume dans docker-compose
# pour le développement

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Commande de démarrage pour le développement
CMD ["npm", "run", "dev"]
