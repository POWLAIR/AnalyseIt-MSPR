from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from core.db import engine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 

)

@app.get("/test-endpoint")
def test_endpoint():
    return {"message": "Le backend fonctionne correctement !"}

@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1").fetchone()
            return {"status": "success", "result": result[0]}
    except Exception as e:
        return {"status": "error", "message": str(e)}
