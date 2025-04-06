import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

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
    
    # 2) GESTION DES VALEURS MANQUANTES
    for col in df.columns:
        if df[col].dtype in [np.float64, np.int64]:
            mean_value = df[col].mean()
            df[col].fillna(mean_value, inplace=True)
        elif df[col].dtype == object:
            df[col].fillna("inconnu", inplace=True)

    # 3) NORMALISATION DES FORMATS
    # a) Dates
    for col in df.columns:
        if "date" in col.lower():
            try:
                df[col] = pd.to_datetime(df[col])
            except Exception as e:
                logger.warning(f"Impossible de convertir la colonne {col} en date : {e}")

    # b) Conversion nombres si besoin (ex. string -> float)
    for col in df.select_dtypes(include=[object]):
        try:
            df[col] = df[col].str.replace(',', '.').astype(float)
        except:
            pass  # On laisse tel quel si non convertible

    # c) Normalisation des chaînes de caractères
    for col in df.select_dtypes(include=[object]):
        df[col] = df[col].astype(str).str.strip().str.lower()

    # 4) VALEURS ABERRANTES
    # Exemple : si "cases" < 0, on supprime
    if "cases" in df.columns:
        df = df[df["cases"] >= 0]

    return df