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
def get_or_create_location(db: Session, location_data) -> int:
    """
    Get or create a location record in the database.
    
    Args:
        db: Database session
        location_data: Either a string (country name) or a pandas Series/dict containing location data
    
    Returns:
        int: The ID of the location
    """
    try:
        # Handle string input (direct country name)
        if isinstance(location_data, str):
            location_name = location_data
            region = None
            iso_code = None
        # Handle dictionary-like input (pandas Series or dict)
        else:
            location_name = location_data.get("location", "Unknown") if hasattr(location_data, "get") else str(location_data)
            region = location_data.get("region") or location_data.get("state") or location_data.get("province") if hasattr(location_data, "get") else None
            iso_code = location_data.get("iso_code") or location_data.get("iso") or location_data.get("code") if hasattr(location_data, "get") else None

        # Normalize location name
        if pd.isna(location_name) or location_name.strip() == "":
            location_name = "Unknown"

        # Try to find existing location
        location = db.query(Localisation).filter_by(country=location_name).first()

        if not location:
            # Create new location
            location = Localisation(
                country=location_name,
                region=region if pd.notna(region) else None,
                iso_code=iso_code if pd.notna(iso_code) else None
            )
            db.add(location)
            try:
                db.commit()
                db.refresh(location)
            except Exception as e:
                db.rollback()
                logger.error(f"Error creating location {location_name}: {e}")
                raise

        return location.id
    except Exception as e:
        logger.error(f"Error in get_or_create_location for {location_data}: {e}")
        raise

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
                # Vérifier si l'enregistrement existe déjà
                existing_stat = db.query(DailyStats).filter(
                    DailyStats.id_epidemic == stats['id_epidemic'],
                    DailyStats.id_loc == stats['id_loc'],
                    DailyStats.date == stats['date']
                ).first()

                if existing_stat:
                    # Mettre à jour l'enregistrement existant
                    for field, value in stats.items():
                        setattr(existing_stat, field, value)
                else:
                    # Créer un nouvel enregistrement
                    new_stat = DailyStats(**stats)
                    db.add(new_stat)

                try:
                    db.commit()
                    processed += 1
                    break
                except Exception as e:
                    db.rollback()
                    logger.error(f"Erreur lors de la mise à jour/insertion: {e}")
                    retry_count += 1
                    if retry_count == max_retries:
                        logger.error(f"Échec après {max_retries} tentatives")
                        continue
                    sleep(2 ** retry_count)
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
def process_generic_data(db: Session, data: pd.DataFrame, source_id: int, epidemic_name: str, reset: bool = False) -> None:
    """
    Process generic data from a DataFrame and insert/update it in the database.
    """
    try:
        # Vérifier si l'épidémie existe déjà
        epidemic = db.query(Epidemic).filter(Epidemic.name == epidemic_name).first()
        
        if not epidemic:
            # Créer une nouvelle épidémie si elle n'existe pas
            epidemic = Epidemic(name=epidemic_name)
            db.add(epidemic)
            try:
                db.commit()
            except Exception as e:
                db.rollback()
                logger.error(f"Erreur lors de la création de l'épidémie: {e}")
                raise
        
        epidemic_id = epidemic.id
        
        # Si reset est True, supprimer les anciennes données pour cette épidémie
        if reset:
            try:
                db.query(DailyStats).filter(
                    DailyStats.id_epidemic == epidemic_id,
                    DailyStats.id_source == source_id
                ).delete()
                db.commit()
            except Exception as e:
                db.rollback()
                logger.error(f"Erreur lors de la suppression des anciennes données: {e}")
                raise

        # Préparer les données pour l'insertion
        daily_stats = []
        for _, row in data.iterrows():
            try:
                # Get location ID, passing either the location string or the full row depending on data structure
                location_id = get_or_create_location(db, row['location'] if isinstance(row['location'], str) else row)
                if not location_id:
                    logger.error(f"Location non trouvée/créée pour: {row['location']}")
                    continue

                stats = {
                    'id_epidemic': epidemic_id,
                    'id_source': source_id,
                    'id_loc': location_id,
                    'date': row['date'],
                    'cases': row.get('cases', 0) if hasattr(row, 'get') else 0,
                    'deaths': row.get('deaths', 0) if hasattr(row, 'get') else 0,
                    'recovered': row.get('recovered', 0) if hasattr(row, 'get') else 0,
                    'active': row.get('active', 0) if hasattr(row, 'get') else 0,
                    'new_cases': row.get('new_cases', 0) if hasattr(row, 'get') else 0,
                    'new_deaths': row.get('new_deaths', 0) if hasattr(row, 'get') else 0,
                    'new_recovered': row.get('new_recovered', 0) if hasattr(row, 'get') else 0
                }
                daily_stats.append(stats)

            except Exception as e:
                logger.error(f"Erreur lors du traitement de la ligne: {e}")
                continue

        # Insérer ou mettre à jour les statistiques par lots
        if daily_stats:
            processed = insert_or_update_stats(db, daily_stats)
            logger.info(f"Nombre d'enregistrements traités: {processed}")
        else:
            logger.warning("Aucune donnée à traiter")

    except Exception as e:
        logger.error(f"Erreur lors du traitement des données: {e}")
        raise

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
                            
                            process_generic_data(db, df, data_source.id, name, reset=False)
                            logger.info(f"Traitement terminé pour {file}: {len(df)} lignes traitées")
                            
                            results.append({
                                "dataset": name,
                                "file": os.path.basename(file),
                                "rows": len(df),
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
