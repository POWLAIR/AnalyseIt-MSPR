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
        "type": "Bacteria",
        "country": "Test Country",
        "start_date": "2023-01-01",
        "end_date": None,
        "total_cases": 0,
        "total_deaths": 0,
        "transmission_rate": 0.0,
        "mortality_rate": 0.0
    }

    # Création
    create_resp = client.post("/api/v1/epidemics/", json=epidemic)
    assert create_resp.status_code == 200
    created_data = create_resp.json()
    assert created_data["name"] == epidemic["name"]

    # Lecture
    epidemic_id = created_data["id"]
    read_resp = client.get(f"/api/v1/epidemics/{epidemic_id}")
    assert read_resp.status_code == 200
    assert read_resp.json()["name"] == epidemic["name"]

    # Mise à jour
    update_data = {**epidemic, "name": "Updated Flow Epidemic"}
    update_resp = client.put(f"/api/v1/epidemics/{epidemic_id}", json=update_data)
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Updated Flow Epidemic"

    # Suppression
    delete_resp = client.delete(f"/api/v1/epidemics/{epidemic_id}")
    assert delete_resp.status_code == 200

    # Vérification de la suppression
    verify_resp = client.get(f"/api/v1/epidemics/{epidemic_id}")
    assert verify_resp.status_code == 404
