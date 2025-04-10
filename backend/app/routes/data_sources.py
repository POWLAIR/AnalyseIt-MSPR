from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models.base import DataSource
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
def get_data_sources(db: Session = Depends(get_db)):
    """Get all data sources."""
    try:
        sources = db.query(DataSource).all()
        if not sources:
            # Retourner au moins une source par défaut si aucune n'existe
            return [{
                "id": 1,
                "source_type": "Manuel",
                "reference": "Données initiales",
                "url": "N/A"
            }]
        return sources
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des sources de données: {str(e)}")
        return [{
            "id": 1,
            "source_type": "Manuel",
            "reference": "Données initiales",
            "url": "N/A"
        }] 