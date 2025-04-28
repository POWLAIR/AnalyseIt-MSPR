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
    DB_USER: str = os.getenv("DB_USER", "user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")
    DB_HOST: str = os.getenv("DB_HOST", "mysql_db")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_NAME: str = os.getenv("DB_NAME", "pandemics_db")
    
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
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        case_sensitive = True


settings = Settings() 
