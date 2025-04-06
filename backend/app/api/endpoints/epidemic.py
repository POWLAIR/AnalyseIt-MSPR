from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ...db.repositories import epidemic_repository
from ..schemas import (
    Epidemic,
    EpidemicCreate,
    EpidemicUpdate,
    Response
)
from ..dependencies import get_db_session

router = APIRouter()

@router.post("/", response_model=Epidemic)
def create_epidemic(
    epidemic: EpidemicCreate,
    db: Session = Depends(get_db_session)
):
    """
    Create a new epidemic with the following information:
    - name: Name of the epidemic (required)
    - description: Description of the epidemic
    - start_date: Start date of the epidemic
    - end_date: End date of the epidemic
    - type: Type of the epidemic
    """
    return epidemic_repository.create_epidemic(db=db, epidemic=epidemic)

@router.get("/", response_model=List[Epidemic])
def read_epidemics(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db_session)
):
    """
    Get all epidemics with optional filters:
    - type: Filter by epidemic type
    - start_date: Filter by start date
    - end_date: Filter by end date
    """
    filters = {
        "type": type,
        "start_date": start_date,
        "end_date": end_date
    }
    return epidemic_repository.get_epidemics(db, skip=skip, limit=limit, filters=filters)

@router.get("/{epidemic_id}", response_model=Epidemic)
def read_epidemic(epidemic_id: int, db: Session = Depends(get_db_session)):
    """
    Get a specific epidemic by ID
    """
    db_epidemic = epidemic_repository.get_epidemic(db, epidemic_id=epidemic_id)
    if db_epidemic is None:
        raise HTTPException(status_code=404, detail="Epidemic not found")
    return db_epidemic

@router.put("/{epidemic_id}", response_model=Epidemic)
def update_epidemic(
    epidemic_id: int,
    epidemic: EpidemicUpdate,
    db: Session = Depends(get_db_session)
):
    """
    Update an epidemic by ID
    """
    db_epidemic = epidemic_repository.update_epidemic(db, epidemic_id=epidemic_id, epidemic=epidemic)
    if db_epidemic is None:
        raise HTTPException(status_code=404, detail="Epidemic not found")
    return db_epidemic

@router.delete("/{epidemic_id}", response_model=Response)
def delete_epidemic(epidemic_id: int, db: Session = Depends(get_db_session)):
    """
    Delete an epidemic by ID
    """
    success = epidemic_repository.delete_epidemic(db, epidemic_id=epidemic_id)
    if not success:
        raise HTTPException(status_code=404, detail="Epidemic not found")
    return {"status": "success", "message": "Epidemic deleted successfully"} 