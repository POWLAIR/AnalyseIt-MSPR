"""Application FastAPI principale."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.db import engine  # Assurez-vous que ce module existe et est importable
import logging
import kagglehub
from kagglehub import KaggleDatasetAdapter

import pandas as pd
import numpy as np

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


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Effectue les étapes de nettoyage et de préparation des données :
      1. Suppression des doublons
      2. Gestion des valeurs manquantes
      3. Normalisation des formats (dates, nombres, chaînes)
      4. Vérification de la cohérence (valeurs aberrantes)
    """
    # 1) SUPPRESSION DES DOUBLONS
    df.drop_duplicates(inplace=True)

    if 'id' in df.columns:
        df.drop_duplicates(subset='id', inplace=True)

    
    # 2) GESTION DES VALEURS MANQUANTES (exemple simple)
    for col in df.columns:
        if df[col].dtype in [np.float64, np.int64]:
            mean_value = df[col].mean()
            df[col].fillna(mean_value, inplace=True)
        elif df[col].dtype == object:
            df[col].fillna("inconnu", inplace=True)

    # 3) NORMALISATION DES FORMATS
    #    a) Dates (exemple : colonnes contenant 'date')
    for col in df.columns:
        if "date" in col.lower():
            try:
                df[col] = pd.to_datetime(df[col])
            except Exception as e:
                logger.warning(f"Impossible de convertir la colonne {col} en date : {e}")

    #    b) Conversion nombres (string -> float) si possible
    for col in df.select_dtypes(include=[object]):
        try:
            df[col] = df[col].str.replace(',', '.').astype(float)
        except:
            pass  # Si non convertible, on laisse tel quel

    #    c) Normalisation des chaînes (tout en minuscule, etc.)
    for col in df.select_dtypes(include=[object]):
        df[col] = df[col].astype(str).str.strip().str.lower()

    # 4) EXEMPLE DE VÉRIFICATION DE LA COHÉRENCE (valeurs aberrantes, ici négatives)
    if "cases" in df.columns:
        df = df[df["cases"] >= 0]

    return df


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

# ... (imports et config identiques)

@app.get("/extract-data")
def extract_data():
    """Endpoint pour extraire les données de la base de données."""
    logger.info("Démarrage du processus d'extraction des données")
    try:
        datasets = {
            "mpox": {
                "path": "utkarshx27/mpox-monkeypox-data",
                "file": "owid-monkeypox-data.csv"
            },
            "covid19": {
                "path": "josephassaker/covid19-global-dataset",
                "file": "worldometer_coronavirus_daily_data.csv"
            },
            "corona": {
                "path": "imdevskp/corona-virus-report",
                "file": "covid_19_clean_complete.csv"
            }
        }

        results = []
        for name, dataset_info in datasets.items():
            try:
                logger.info(f"Tentative de chargement du dataset Kaggle: {name}")
                df = kagglehub.load_dataset(
                    KaggleDatasetAdapter.PANDAS,
                    dataset_info["path"],
                    dataset_info["file"]
                )

                df = df.head(10)  # TEST

                if df.empty:
                    logger.warning(f"Le dataset {name} est vide")
                    raise ValueError(f"Le dataset {name} est vide")

                logger.info(f"Dataset {name} chargé avec succès: {len(df)} lignes, {len(df.columns)} colonnes")

                # Nettoyage
                df = clean_dataset(df)

                # Insertion en base
                logger.info(f"Début de l'insertion dans la table {name}")
                with engine.begin() as conn:
                    df.to_sql(name, conn, if_exists="append", index=False)

                # Log des 5 premières lignes insérées pour suivi
                logger.info(f"Extrait des données insérées dans la table {name} :")
                logger.info(df.head().to_string(index=False))

                logger.info(f"Données insérées avec succès dans la table {name} ({len(df)} lignes)")

                results.append({
                    "file": name,
                    "status": "success",
                    "rows": len(df),
                    "columns": list(df.columns)
                })

            except Exception as dataset_error:
                logger.error(f"Erreur lors du traitement du dataset {name}: {str(dataset_error)}")
                results.append({
                    "file": name,
                    "status": "error",
                    "error": str(dataset_error)
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
