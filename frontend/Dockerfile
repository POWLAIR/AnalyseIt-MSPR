# Utilisation d'une image Node.js LTS
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de config
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

# Définir production
ENV NODE_ENV=production

# Important : ne PAS hardcoder NEXT_PUBLIC_API_URL ici !

# Exposer le port
EXPOSE 3000

# Build + Démarrage séparement
# Build sera déclenché manuellement avec la bonne variable d'environnement
CMD ["npm", "start"]
