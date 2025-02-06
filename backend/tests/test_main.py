import sys
from fastapi.testclient import TestClient
from pathlib import Path
from main import app

# Ajout du backend au chemin Python
sys.path.append(str(Path(__file__).parent.parent))

# Création du client de test
client = TestClient(app)

# Test de l'endpoint de vérification de l'API
def test_healthcheck():
    response = client.get("/healthcheck")
    assert response.status_code == 200
    assert response.json() == {"status": "API is running"}
