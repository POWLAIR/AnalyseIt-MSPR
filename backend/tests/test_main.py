import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
import pandas as pd
from kagglehub import KaggleDatasetAdapter

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
    # Création des DataFrames de test pour chaque dataset
    mpox_df = pd.DataFrame({
        'location': ['World'], 'iso_code': ['OWID_WRL'], 'date': ['2022-05-01'],
        'total_cases': [0], 'total_deaths': [0], 'new_cases': [0], 'new_deaths': [0],
        'new_cases_smoothed': [0], 'new_deaths_smoothed': [0], 'new_cases_per_million': [0],
        'total_cases_per_million': [0], 'new_cases_smoothed_per_million': [0],
        'new_deaths_per_million': [0], 'total_deaths_per_million': [0],
        'new_deaths_smoothed_per_million': [0]
    })

    covid19_df = pd.DataFrame({
        'date': ['2020-01-01'], 'country': ['World'],
        'cumulative_total_cases': [0], 'daily_new_cases': [0],
        'active_cases': [0], 'cumulative_total_deaths': [0],
        'daily_new_deaths': [0]
    })

    corona_df = pd.DataFrame({
        'Province/State': [None], 'Country/Region': ['World'],
        'Lat': [0], 'Long': [0], 'Date': ['2020-01-01'],
        'Confirmed': [0], 'Deaths': [0], 'Recovered': [0],
        'Active': [0], 'WHO Region': ['GLOBAL']
    })

    # Mock de to_sql pour tous les DataFrames
    for df in [mpox_df, covid19_df, corona_df]:
        df.to_sql = MagicMock(return_value=None)

    datasets = {
        'mpox': mpox_df,
        'covid19': covid19_df,
        'corona': corona_df
    }

    # Mock de kagglehub.load_dataset
    def mock_load_dataset(adapter, path, file):
        assert adapter == KaggleDatasetAdapter.PANDAS
        assert isinstance(path, str)
        assert isinstance(file, str)
        assert file.endswith('.csv')
        
        # Retourne le DataFrame correspondant au dataset
        if 'mpox' in path:
            return datasets['mpox']
        elif 'covid19' in path:
            return datasets['covid19']
        else:
            return datasets['corona']

    # Application des mocks
    with patch('kagglehub.load_dataset', mock_load_dataset):
        response = test_client.get("/extract-data")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Traitement des fichiers terminé"
        assert "results" in data

        # Vérification des résultats pour chaque dataset
        expected_columns = {
            'mpox': 15,
            'covid19': 7,
            'corona': 10
        }

        for result in data["results"]:
            assert result["status"] == "success"
            assert len(result["columns"]) == expected_columns[result["file"]]
