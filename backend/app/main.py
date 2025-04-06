from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from sqlalchemy import inspect, text

from .core.config.settings import settings
from .api.endpoints import epidemic, admin
from .db.session import engine
from .db.models.base import Base

# Configurer le logger
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
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

# Inclusion des routes
app.include_router(
    epidemic.router,
    prefix=f"{settings.API_V1_STR}/epidemics",
    tags=["Epidemics"]
)

# Routes d'administration
app.include_router(
    admin.router,
    prefix=f"{settings.API_V1_STR}/admin",
    tags=["Administration"]
)

# Route de santé
@app.get("/health")
def health_check():
    return {"status": "healthy"} 