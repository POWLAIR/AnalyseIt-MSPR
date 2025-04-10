import os
import pandas as pd
import logging
import glob
from time import sleep
from datetime import datetime
import backoff
from sqlalchemy.orm import Session
from sqlalchemy.dialects.mysql import insert
from sqlalchemy import func
from kagglehub import dataset_download
from sqlalchemy.exc import SQLAlchemyError, OperationalError

from ..db.models.base import Epidemic, DailyStats, Localisation, DataSource, OverallStats
from ..utils.data_cleaning import clean_dataset


logger = logging.getLogger(__name__)

KAGGLE_DATASETS = {
    "mpox": "utkarshx27/mpox-monkeypox-data",
    "covid19": "josephassaker/covid19-global-dataset",
    "corona": "imdevskp/corona-virus-report",
}

@backoff.on_exception(backoff.expo,
                     (SQLAlchemyError, OperationalError),
                     max_tries=5)
def get_or_create_location(db: Session, row: pd.Series) -> int:
    location_name = row.get("location", "Unknown")
    if pd.isna(location_name) or location_name.strip() == "":
        location_name = "Unknown"

    location = db.query(Localisation).filter_by(country=location_name).first()

    if not location:
        region = row.get("region") or row.get("state") or row.get("province") or None
        iso_code = row.get("iso_code") or row.get("iso") or row.get("code") or None

        location = Localisation(
            country=location_name,
            region=region if pd.notna(region) else None,
            iso_code=iso_code if pd.notna(iso_code) else None
        )
        db.add(location)
        db.commit()
        db.refresh(location)

    return location.id

def get_csv_files_from_directory(dataset_path: str):
    """Retourne tous les fichiers CSV dans un répertoire de dataset."""
    return glob.glob(os.path.join(dataset_path, "**", "*.csv"), recursive=True)

@backoff.on_exception(backoff.expo,
                     (SQLAlchemyError, OperationalError),
                     max_tries=5)
def insert_or_update_stats(db: Session, daily_stats: list) -> int:
    processed = 0
    for stats in daily_stats:
        max_retries = 3
        retry_count = 0
        
        # Vérifier que les clés étrangères sont valides
        if not stats.get('id_epidemic'):
            logger.error(f"id_epidemic manquant dans les statistiques: {stats}")
            continue
            
        if not stats.get('id_source'):
            logger.error(f"id_source manquant dans les statistiques: {stats}")
            continue
            
        if not stats.get('id_loc'):
            logger.error(f"id_loc manquant dans les statistiques: {stats}")
            continue
        
        while retry_count < max_retries:
            try:
                # Utiliser une requête INSERT ... ON DUPLICATE KEY UPDATE
                stmt = insert(DailyStats).values(stats)
                
                # Ne pas inclure les clés étrangères dans la mise à jour
                stmt = stmt.on_duplicate_key_update(
                    cases=stmt.inserted.cases,
                    deaths=stmt.inserted.deaths,
                    active=stmt.inserted.active,
                    recovered=stmt.inserted.recovered,
                    new_cases=stmt.inserted.new_cases,
                    new_deaths=stmt.inserted.new_deaths,
                    new_recovered=stmt.inserted.new_recovered
                )
                
                db.execute(stmt)
                processed += 1
                break
            except Exception as e:
                retry_count += 1
                if retry_count == max_retries:
                    logger.error(f"Erreur insertion stats après {max_retries} tentatives: {e}")
                    continue
                logger.warning(f"Tentative {retry_count}/{max_retries} échouée: {e}")
                sleep(2 ** retry_count)  # Exponential backoff

        if processed % 100 == 0:
            try:
                db.commit()
            except Exception as e:
                logger.error(f"Erreur commit: {e}")
                db.rollback()
                continue

    try:
        db.commit()
    except Exception as e:
        logger.error(f"Erreur commit final: {e}")
        db.rollback()
        raise

    return processed

@backoff.on_exception(backoff.expo,
                     Exception,
                     max_tries=5)
def process_generic_data(db: Session, df: pd.DataFrame, epidemic_name: str, source_id: int) -> int:
    # Rechercher l'épidémie existante
    epidemic = db.query(Epidemic).filter_by(name=epidemic_name.capitalize()).first()
    
    # Si l'épidémie n'existe pas, la créer
    if not epidemic:
        epidemic = Epidemic(
            name=epidemic_name.capitalize(),
            type="Viral",
            description=f"Données pour {epidemic_name}",
            start_date=df['date'].min(),
            end_date=None
        )
        db.add(epidemic)
        db.commit()
        db.refresh(epidemic)  # Rafraîchir pour obtenir l'ID
    
    # Vérifier que l'épidémie a un ID valide
    if not epidemic.id:
        logger.error(f"Épidémie {epidemic_name} n'a pas d'ID valide après création")
        return 0
    
    logger.info(f"Traitement des données pour l'épidémie {epidemic_name} (ID: {epidemic.id})")
    
    batch_size = 100
    total_rows = len(df)
    processed_rows = 0

    for i in range(0, total_rows, batch_size):
        batch = df.iloc[i:i+batch_size]
        daily_stats = []
        for _, row in batch.iterrows():
            try:
                location_id = get_or_create_location(db, row)
                stats = {
                    'id_epidemic': epidemic.id,  # Utiliser l'ID de l'épidémie
                    'id_source': source_id,
                    'id_loc': location_id,
                    'date': row['date'],
                    'cases': int(row.get('cases', 0)),
                    'deaths': int(row.get('deaths', 0)),
                    'recovered': int(row.get('recovered', 0)),
                    'active': int(row.get('active', 0)),
                    'new_cases': int(row.get('new_cases', 0)),
                    'new_deaths': int(row.get('new_deaths', 0)),
                    'new_recovered': int(row.get('new_recovered', 0))
                }
                daily_stats.append(stats)
            except Exception as e:
                logger.error(f"Erreur ligne batch: {e}")
                continue

        if daily_stats:
            processed = insert_or_update_stats(db, daily_stats)
            processed_rows += processed

        sleep(0.01)

    return processed_rows

@backoff.on_exception(backoff.expo,
                     (SQLAlchemyError, OperationalError),
                     max_tries=5)
def calculate_overall_stats(db: Session):
    try:
        epidemics = db.query(Epidemic).all()
        for epidemic in epidemics:
            stats = db.query(
                func.sum(DailyStats.cases).label('total_cases'),
                func.sum(DailyStats.deaths).label('total_deaths')
            ).filter(DailyStats.id_epidemic == epidemic.id).first()

            if stats:
                total_cases = stats.total_cases or 0
                total_deaths = stats.total_deaths or 0
                fatality_ratio = (total_deaths / total_cases * 100) if total_cases > 0 else 0

                overall_stats = db.query(OverallStats).filter_by(id_epidemic=epidemic.id).first()
                if not overall_stats:
                    overall_stats = OverallStats(id_epidemic=epidemic.id)
                    db.add(overall_stats)

                overall_stats.total_cases = total_cases
                overall_stats.total_deaths = total_deaths
                overall_stats.fatality_ratio = fatality_ratio
                db.commit()
    except Exception as e:
        logger.error(f"Erreur stats globales: {e}")
        db.rollback()
        raise

def extract_and_load_datasets(db: Session):
    results = []
    max_retries = 3
    
    for name, path in KAGGLE_DATASETS.items():
        retry_count = 0
        while retry_count < max_retries:
            try:
                logger.info(f"Début du traitement du dataset {name} depuis {path}")
                dataset_path = dataset_download(path)
                logger.info(f"Téléchargement terminé pour {name} -> {dataset_path}")

                # Créer ou récupérer la source de données
                data_source = db.query(DataSource).filter_by(source_type=name).first()
                if not data_source:
                    logger.info(f"Création d'une nouvelle source de données pour {name}")
                    data_source = DataSource(
                        source_type=name,
                        reference=path,
                        url=f"https://www.kaggle.com/datasets/{path}"
                    )
                    db.add(data_source)
                    db.commit()
                    db.refresh(data_source)
                    logger.info(f"Source de données créée avec l'ID {data_source.id}")
                else:
                    logger.info(f"Source de données existante trouvée pour {name} (ID: {data_source.id})")

                # Trouver tous les fichiers CSV dans le répertoire
                csv_files = get_csv_files_from_directory(dataset_path)
                logger.info(f"{len(csv_files)} CSV trouvés pour {name}")

                if not csv_files:
                    logger.warning(f"Aucun fichier CSV trouvé pour {name}")
                    results.append({
                        "dataset": name,
                        "status": "warning",
                        "message": "Aucun fichier CSV trouvé"
                    })
                    break

                for file in csv_files:
                    file_retry_count = 0
                    while file_retry_count < max_retries:
                        try:
                            logger.info(f"Traitement du fichier {file}")
                            df = pd.read_csv(file)
                            logger.info(f"Fichier {file} lu avec succès, {len(df)} lignes")
                            
                            df = clean_dataset(df, dataset_type=name, file_name=os.path.basename(file))
                            logger.info(f"Données nettoyées pour {file}")
                            
                            rows = process_generic_data(db, df, name, data_source.id)
                            logger.info(f"Traitement terminé pour {file}: {rows} lignes traitées")
                            
                            results.append({
                                "dataset": name,
                                "file": os.path.basename(file),
                                "rows": rows,
                                "status": "success"
                            })
                            break
                        except Exception as e:
                            file_retry_count += 1
                            if file_retry_count == max_retries:
                                logger.error(f"Erreur fichier {file} après {max_retries} tentatives: {e}")
                                results.append({
                                    "dataset": name,
                                    "file": os.path.basename(file),
                                    "error": str(e),
                                    "status": "error"
                                })
                            else:
                                logger.warning(f"Tentative {file_retry_count}/{max_retries} échouée pour {file}: {e}")
                                sleep(2 ** file_retry_count)  # Exponential backoff
                break
            except Exception as e:
                retry_count += 1
                if retry_count == max_retries:
                    logger.error(f"Erreur sur le dataset {name} après {max_retries} tentatives: {e}")
                    results.append({
                        "dataset": name,
                        "status": "error",
                        "error": str(e)
                    })
                else:
                    logger.warning(f"Tentative {retry_count}/{max_retries} échouée pour {name}: {e}")
                    sleep(2 ** retry_count)  # Exponential backoff

    try:
        logger.info("Calcul des statistiques globales")
        calculate_overall_stats(db)
        logger.info("Statistiques globales calculées avec succès")
    except Exception as e:
        logger.error(f"Erreur lors du calcul des statistiques globales: {e}")
        results.append({
            "dataset": "overall_stats",
            "status": "error",
            "error": str(e)
        })

    return results
