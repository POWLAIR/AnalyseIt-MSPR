# Utilisation d’une image Python légère
FROM python:3.12-slim

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source de l’API
COPY . .

# Exposer le port de l’API
EXPOSE 8000

# Commande pour démarrer FastAPI avec Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
