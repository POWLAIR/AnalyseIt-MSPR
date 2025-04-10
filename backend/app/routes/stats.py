from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from ..db.session import get_db
from ..db.models.base import Epidemic, DailyStats
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/overview")
def get_overview_stats(db: Session = Depends(get_db)):
    """
    Récupère les statistiques générales et les dernières données pour le tableau de bord.
    """
    try:
        # Statistiques des épidémies
        total_pandemics = db.query(Epidemic).count()
        active_pandemics = db.query(Epidemic).filter(Epidemic.end_date == None).count()

        # Récupération des dernières statistiques
        latest_data = db.query(DailyStats).order_by(DailyStats.date.desc()).first()
        
        # Calcul du taux de transmission (nouveaux cas / cas totaux sur les 7 derniers jours)
        seven_days_ago = datetime.now() - timedelta(days=7)
        weekly_stats = db.query(
            func.sum(DailyStats.new_cases).label('total_new_cases'),
            func.sum(DailyStats.cases).label('total_cases')
        ).filter(
            DailyStats.date >= seven_days_ago
        ).first()

        transmission_rate = 0
        if weekly_stats and weekly_stats.total_cases:
            transmission_rate = (weekly_stats.total_new_cases / weekly_stats.total_cases) * 100

        # Calcul du taux de mortalité (décès totaux / cas totaux)
        if latest_data and latest_data.cases > 0:
            mortality_rate = (latest_data.deaths / latest_data.cases) * 100
        else:
            mortality_rate = 0

        return {
            "totalPandemics": total_pandemics,
            "activePandemics": active_pandemics,
            "averageTransmissionRate": float(transmission_rate),
            "averageMortalityRate": float(mortality_rate),
            "latestStats": {
                "cases": latest_data.cases if latest_data else 0,
                "deaths": latest_data.deaths if latest_data else 0,
                "recovered": latest_data.recovered if latest_data else 0,
                "date": latest_data.date.isoformat() if latest_data else datetime.now().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la récupération des statistiques"
        ) 