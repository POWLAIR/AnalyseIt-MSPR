from fastapi.testclient import TestClient
import sys
from pathlib import Path


# Add backend directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from main import app  # noqa: E402


client = TestClient(app)


def test_healthcheck():
    response = client.get("/healthcheck")
    assert response.status_code == 200
    assert response.json() == {"status": "API is running"}
 