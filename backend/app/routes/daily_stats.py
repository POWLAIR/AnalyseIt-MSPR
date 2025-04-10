from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models.base import DailyStats
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
def get_daily_stats(db: Session = Depends(get_db)):
    """Get all daily statistics."""
    try:
        daily_stats = db.query(DailyStats).all()
        if not daily_stats:
            return []
        return daily_stats
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques quotidiennes: {str(e)}")
        return [] 