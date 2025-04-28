# Utilisation d'une image Node.js LTS
FROM node:18-alpine

# Définition du répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Installer les dépendances de développement en premier
RUN npm install -D postcss-import autoprefixer tailwindcss @tailwindcss/forms

# Installer toutes les autres dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Définir NODE_ENV pour le build
ENV NODE_ENV=production

# Build l'application
RUN npm run build

# Définir les variables d'environnement pour le runtime
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NODE_ENV=production

# Le reste des fichiers sera monté comme un volume dans docker-compose
# pour le développement

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Commande de démarrage pour la production
CMD ["npm", "start"]
