from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from ..models.base import Epidemic
from ...api.schemas import schemas

def create_epidemic(db: Session, epidemic: schemas.EpidemicCreate) -> Epidemic:
    db_epidemic = Epidemic(**epidemic.model_dump())
    db.add(db_epidemic)
    db.commit()
    db.refresh(db_epidemic)
    return db_epidemic

def get_epidemic(db: Session, epidemic_id: int) -> Optional[Epidemic]:
    return db.query(Epidemic).filter(Epidemic.id == epidemic_id).first()

def get_epidemics(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    filters: Dict[str, Any] = None
) -> List[Epidemic]:
    query = db.query(Epidemic)
    
    if filters:
        if filters.get("type"):
            query = query.filter(Epidemic.type == filters["type"])
        if filters.get("start_date"):
            query = query.filter(Epidemic.start_date >= filters["start_date"])
        if filters.get("end_date"):
            query = query.filter(Epidemic.end_date <= filters["end_date"])
            
    return query.offset(skip).limit(limit).all()

def update_epidemic(
    db: Session, 
    epidemic_id: int, 
    epidemic: schemas.EpidemicUpdate
) -> Optional[Epidemic]:
    db_epidemic = db.query(Epidemic).filter(Epidemic.id == epidemic_id).first()
    if db_epidemic:
        for key, value in epidemic.model_dump(exclude_unset=True).items():
            setattr(db_epidemic, key, value)
        db.commit()
        db.refresh(db_epidemic)
    return db_epidemic

def delete_epidemic(db: Session, epidemic_id: int) -> bool:
    db_epidemic = db.query(Epidemic).filter(Epidemic.id == epidemic_id).first()
    if db_epidemic:
        db.delete(db_epidemic)
        db.commit()
        return True
    return False 