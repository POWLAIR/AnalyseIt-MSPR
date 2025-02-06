"""Application FastAPI principale."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.db import engine  # Assurez-vous que ce module existe et est importable

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/test-endpoint")
def test_endpoint():
    """Endpoint de test du backend."""
    return {"message": "Le backend fonctionne correctement !"}


@app.get("/test-db")
def test_db():
    """Test de connexion à la base de données."""
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1").fetchone()
            return {"status": "success", "result": result[0]}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
