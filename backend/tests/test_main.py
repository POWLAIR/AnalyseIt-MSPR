import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.db.models.base import Base
from app.db.session import get_db

# Configuration de la base de données de test en mémoire
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Créer les tables dans la base de données de test
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture
def test_client():
    """Fixture pour créer un client de test avec une base de données en mémoire."""
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture
def mock_data_extraction():
    with patch('app.api.endpoints.admin.extract_and_load_datasets') as mock:
        mock.return_value = [
            {
                "dataset": "mpox",
                "file": "mpox.csv",
                "rows": 1000,
                "status": "success"
            },
            {
                "dataset": "covid19",
                "file": "covid19.csv",
                "rows": 2000,
                "status": "success"
            }
        ]
        yield mock

def test_healthcheck(test_client):
    """Test de l'endpoint de vérification de l'API."""
    response = test_client.get("/test-endpoint")
    assert response.status_code == 200
    assert response.json() == {"message": "Le backend fonctionne correctement !"}

def test_db_connection(test_client):
    """Test de connexion à la base de données."""
    response = test_client.get("/test-db")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "success"
    assert response.json()["result"] == 1

def test_etl_data_integrity(test_client):
    """Test de l'intégrité des données ETL."""
    with patch('app.services.etl.run_etl') as mock_run_etl:
        mock_run_etl.return_value = {
            "status": "success",
            "stats": {
                "processed_epidemics": 10,
                "processed_daily_stats": 100,
                "processed_locations": 5,
                "processed_sources": 3
            }
        }
        
        from app.services.etl import run_etl
        from app.db.session import get_db
        
        # Obtenir une session de base de données
        db = next(get_db())
        try:
            result = run_etl(db)
            assert result["status"] == "success"
            assert "stats" in result
            assert isinstance(result["stats"], dict)
        finally:
            db.close()

def test_extract_data(test_client, mock_data_extraction):
    """Test de l'endpoint pour extraire les données."""
    response = test_client.get("/api/v1/admin/extract-data")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "success"
    assert data["message"] == "Data extraction completed"
    assert "details" in data
    assert isinstance(data["details"], list)
    assert len(data["details"]) == 2
    assert all(item["status"] == "success" for item in data["details"])
