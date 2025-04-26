from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.main import app

client = TestClient(app)

def test_full_epidemic_flow():
    epidemic = {
        "name": "Test Flow Epidemic",
        "description": "Full test flow",
        "start_date": "2023-01-01",
        "end_date": None,
        "type": "Bacteria"
    }

    # Création
    create_resp = client.post("/api/v1/epidemics/", json=epidemic)
    assert create_resp.status_code == 200
    created = create_resp.json()
    assert "id" in created

    # Lecture
    read_resp = client.get(f"/api/v1/epidemics/{created['id']}")
    assert read_resp.status_code == 200
    assert read_resp.json()["name"] == epidemic["name"]

    # Mise à jour
    update_resp = client.put(f"/api/v1/epidemics/{created['id']}", json={"name": "Updated"})
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Updated"

    # Suppression
    delete_resp = client.delete(f"/api/v1/epidemics/{created['id']}")
    assert delete_resp.status_code == 200

    # Vérification suppression
    verify_resp = client.get(f"/api/v1/epidemics/{created['id']}")
    assert verify_resp.status_code == 404
