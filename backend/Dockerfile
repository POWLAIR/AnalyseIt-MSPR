# Utiliser une image Python légère
FROM python:3.10-slim

# Définir le dossier de travail
WORKDIR /app

# Installer wget (nécessaire pour le script d'attente)
RUN apt-get update && apt-get install -y wget

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

# Créer un script d'attente pour MySQL
RUN wget -O /wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /wait-for-it.sh

# Copier le code source de l'API
COPY . .

# Ajouter le répertoire racine au PYTHONPATH
ENV PYTHONPATH=/app

# Créer un script de démarrage
RUN echo '#!/bin/bash\n\
/wait-for-it.sh $DB_HOST:$DB_PORT -t 60\n\
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload\n\
' > /start.sh && chmod +x /start.sh

# Exposer le port de l'API
EXPOSE 8000

# Commande de démarrage
CMD ["/start.sh"]
