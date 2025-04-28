# Utiliser une image Python légère
FROM python:3.10-slim

# Définir le dossier de travail
WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers nécessaires
COPY requirements.txt .

# Installer les dépendances 
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source de l'API
COPY . .

# Ajouter le répertoire racine au PYTHONPATH
ENV PYTHONPATH=/app

# Exposer le port de l'API
EXPOSE 8000

# Commande de démarrage directement avec Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
