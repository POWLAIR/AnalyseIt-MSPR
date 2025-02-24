"""Application FastAPI principale."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.db import engine  # Assurez-vous que ce module existe et est importable
from pandas import read_csv
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/test-endpoint")
def test_endpoint():
    """Endpoint de test du backend."""
    return {"message": "Le backend fonctionne correctement !"}


@app.get("/test-db")
def test_db():
    """Test de connexion à la base de données."""
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1").fetchone()
            return {"status": "success", "result": result[0]}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


@app.get("/extract-data")
def extract_data():
    """Endpoint pour extraire les données de la base de données."""
    logger.info("Démarrage du processus d'extraction des données")
    try:
        # Définir les chemins des fichiers locaux
        files = {
            "mpox": "data/mpox-monkeypox-data.csv",
            "covid19": "data/covid19-global-dataset.csv",
            "corona": "data/corona-virus-report.csv"
        }

        results = []
        for name, file_path in files.items():
            try:
                logger.info(f"Tentative de lecture du fichier: {name} ({file_path})")
                # Lecture du fichier CSV
                df = read_csv(file_path)

                # Vérification basique du format
                if df.empty:
                    logger.warning(f"Le fichier {name} est vide")
                    raise ValueError(f"Le fichier {name} est vide")

                logger.info(f"Fichier {name} lu avec succès: {len(df)} lignes, {len(df.columns)} colonnes")
                
                # Enregistrement dans la base de données
                logger.info(f"Début de l'insertion dans la table {name}")
                df.to_sql(name, engine, if_exists="replace", index=False)
                logger.info(f"Données insérées avec succès dans la table {name}")

                results.append({
                    "file": name,
                    "status": "success",
                    "rows": len(df),
                    "columns": list(df.columns)
                })

            except Exception as file_error:
                logger.error(f"Erreur lors du traitement du fichier {name}: {str(file_error)}")
                results.append({
                    "file": name,
                    "status": "error",
                    "error": str(file_error)
                })

        logger.info("Processus d'extraction terminé")
        return {
            "message": "Traitement des fichiers terminé",
            "results": results
        }

    except Exception as e:
        logger.error(f"Erreur générale lors de l'extraction: {str(e)}")
        return {
            "status": "error",
            "message": f"Erreur lors de l'extraction des données : {str(e)}"
        }
