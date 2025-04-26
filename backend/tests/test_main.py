import sys
from pathlib import Path
from unittest.mock import patch

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402

from fastapi.testclient import TestClient
import pytest

@pytest.fixture
def test_client():
    """Fixture pour créer un client de test."""
    return TestClient(app)

@pytest.fixture
def mock_extract_and_load_datasets():
    with patch('app.services.data_extraction.extract_and_load_datasets') as mock:
        mock.return_value = {
            "processed_files": 3,
            "total_records": 1000,
            "success": True
        }
        yield mock

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
