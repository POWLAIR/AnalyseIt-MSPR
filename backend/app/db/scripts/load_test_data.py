from sqlalchemy.orm import Session
from ..models.base import Epidemic, DataSource, Localisation
from datetime import date, timedelta
import logging

# Configurer le logger
logger = logging.getLogger(__name__)

def load_data(db: Session):
    """
    Charge les données de test dans la base de données
    """
    try:
        # Suppression des données existantes
        logger.info("Suppression des données existantes...")
        db.query(Epidemic).delete()
        db.query(DataSource).delete()
        db.query(Localisation).delete()
        db.commit()
        
        # Création des sources de données
        logger.info("Création des sources de données...")
        who_source = DataSource(
            source_type="Organisation",
            reference="World Health Organization",
            url="https://www.who.int/data"
        )
        
        db.add(who_source)
        db.commit()
        db.refresh(who_source)
        
        # Création des localisations
        logger.info("Création des localisations...")
        localisations = {
            "Chine": Localisation(country="Chine", region="Asie", iso_code="CN"),
            "Mexique": Localisation(country="Mexique", region="Amérique du Nord", iso_code="MX"),
            "Guinée": Localisation(country="Guinée", region="Afrique", iso_code="GN")
        }
        
        for loc in localisations.values():
            db.add(loc)
        
        db.commit()
        
        # Rafraîchir les objets localisations pour obtenir leurs IDs
        for loc_name, loc_obj in localisations.items():
            db.refresh(loc_obj)
        
        # Création des épidémies
        logger.info("Création des données d'épidémies...")
        epidemics = [
            Epidemic(
                name="COVID-19",
                description="Pandémie mondiale de COVID-19 causée par le virus SARS-CoV-2",
                type="Coronavirus",
                country="Chine",
                start_date=date(2019, 12, 1),
                end_date=None,
                transmission_rate=5.7,
                mortality_rate=2.3,
                total_cases=760000000,
                total_deaths=6900000,
            ),
            Epidemic(
                name="Grippe H1N1",
                description="Pandémie mondiale de grippe H1N1 apparue en 2009",
                type="Influenza",
                country="Mexique",
                start_date=date(2009, 1, 15),
                end_date=date(2010, 8, 10),
                transmission_rate=1.7,
                mortality_rate=0.02,
                total_cases=60000000,
                total_deaths=284000,
            ),
            Epidemic(
                name="Ebola",
                description="Épidémie d'Ebola en Afrique de l'Ouest",
                type="Filovirus",
                country="Guinée",
                start_date=date(2013, 12, 26),
                end_date=date(2016, 6, 1),
                transmission_rate=1.8,
                mortality_rate=40.0,
                total_cases=28646,
                total_deaths=11323,
            ),
        ]
        
        # Ajout des épidémies à la base de données
        for epidemic in epidemics:
            db.add(epidemic)
        
        db.commit()
        logger.info("Données chargées avec succès!")
        return True
    except Exception as e:
        logger.error(f"Erreur lors du chargement des données: {str(e)}")
        db.rollback()
        raise 