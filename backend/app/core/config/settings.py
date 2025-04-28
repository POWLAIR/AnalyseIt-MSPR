from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Pandemic Data API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "API for tracking and analyzing pandemic data"
    
    # Database Configuration
    DB_DATABASE: str = os.getenv("DB_DATABASE")
 
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: list = ["*"]  # À configurer en production
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        """Construit l'URL de connexion à la base de données."""
        # Si une URL complète est fournie, l'utiliser
        if os.getenv("SQLALCHEMY_DATABASE_URL"):
            return os.getenv("SQLALCHEMY_DATABASE_URL")
        
        # Sinon, construire l'URL à partir des composants
        return self.DB_DATABASE
    
    class Config:
        case_sensitive = True


settings = Settings() 
