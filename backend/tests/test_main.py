import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
import pandas as pd
from sqlalchemy import create_engine

# Ajouter le chemin parent au sys.path pour que Python trouve `main.py`
sys.path.append(str(Path(__file__).resolve().parent.parent))

from main import app  # noqa: E402

from fastapi.testclient import TestClient
import pytest

client = TestClient(app)


@pytest.fixture
def test_client():
    """Fixture pour créer un client de test."""
    return TestClient(app)


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

    if response.json()["status"] == "success":
        assert response.json()["result"] == 1
    else:
        assert "message" in response.json()


def test_extract_data(test_client):
    """Test de l'endpoint pour extraire les données."""
    # Création d'un DataFrame de test
    test_df = pd.DataFrame({
        'col1': [1, 2, 3],
        'col2': ['a', 'b', 'c']
    })
    
    # Création d'un mock pour l'engine SQLAlchemy
    mock_engine = MagicMock(spec=create_engine("sqlite://"))
    
    # Mock de la méthode to_sql de pandas
    def mock_to_sql(*args, **kwargs):
        return None
    test_df.to_sql = mock_to_sql
    
    # Application des mocks
    with patch('main.read_csv', return_value=test_df), \
         patch('main.engine', mock_engine):
        
        response = test_client.get("/extract-data")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Traitement des fichiers terminé"
        assert "results" in data
        
        # Vérification des résultats pour chaque fichier
        for result in data["results"]:
            assert result["status"] == "success"
            assert result["rows"] == 3
            assert "columns" in result
            assert len(result["columns"]) == 2
