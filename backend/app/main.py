from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from sqlalchemy import inspect

from .core.config.settings import settings
from .db.session import engine
from .db.models.base import Base
from .routes import stats, epidemics, dashboard, daily_stats, locations, data_sources
from .api.endpoints import admin

# Configurer le logger
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Événement de démarrage de l'application
@app.on_event("startup")
async def startup_db_client():
    try:
        # Vérification des tables existantes
        inspector = inspect(engine)
        existing_tables = set(inspector.get_table_names())
        required_tables = {"epidemic", "data_source", "localisation", "daily_stats", "overall_stats"}
        
        if not required_tables.issubset(existing_tables):
            # Récupération des tables manquantes
            missing_tables = required_tables - existing_tables
            logger.info(f"Tables manquantes: {missing_tables}")
            
            # Création des tables manquantes
            logger.info("Initialisation des tables de la base de données...")
            Base.metadata.create_all(bind=engine)
            logger.info("Tables initialisées avec succès")
        else:
            logger.info("Toutes les tables requises existent déjà dans la base de données")
    except Exception as e:
        logger.error(f"Erreur lors de l'initialisation des tables: {str(e)}")
        # Ne pas lever d'exception pour permettre à l'application de démarrer

# Routes des épidémies
app.include_router(
    epidemics.router,
    prefix=f"{settings.API_V1_STR}/epidemics",
    tags=["Épidémies"]
)

# Routes du tableau de bord
app.include_router(
    dashboard.router,
    prefix=f"{settings.API_V1_STR}/dashboard",
    tags=["Analyse détaillée"]
)

# Routes de statistiques
app.include_router(
    stats.router,
    prefix=f"{settings.API_V1_STR}/stats",
    tags=["Statistiques"]
)

# Routes d'administration
app.include_router(
    admin.router,
    prefix=f"{settings.API_V1_STR}/admin",
    tags=["Administration"]
)

# Routes des statistiques quotidiennes
app.include_router(
    daily_stats.router,
    prefix=f"{settings.API_V1_STR}/daily-stats",
    tags=["Statistiques quotidiennes"]
)

# Routes des localisations
app.include_router(
    locations.router,
    prefix=f"{settings.API_V1_STR}/locations",
    tags=["Localisations"]
)

# Routes des sources de données
app.include_router(
    data_sources.router,
    prefix=f"{settings.API_V1_STR}/data-sources",
    tags=["Sources de données"]
)

# Route de santé
@app.get("/health")
def health_check():
    return {"status": "ok"} 