import sys
from pathlib import Path

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
