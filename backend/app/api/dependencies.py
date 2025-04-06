from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Generator
from ..db.session import get_db

# Dépendance pour obtenir la session de base de données
def get_db_session() -> Generator[Session, None, None]:
    return get_db()

# Autres dépendances à ajouter ici (authentification, autorisation, etc.) 