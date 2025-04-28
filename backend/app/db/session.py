from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..core.config.settings import settings

# Construction de l'URL de la base de données
DATABASE_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# Création du moteur SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Vérifie la connexion avant chaque requête
    pool_recycle=3600,   # Recycle les connexions après 1 heure
    echo=False          # Désactive les logs SQL
)

# Création de la session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Fonction pour obtenir une session de base de données
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 