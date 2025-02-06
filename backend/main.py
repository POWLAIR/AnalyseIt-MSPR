from fastapi import FastAPI
from core.db import engine

app = FastAPI()

@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1").fetchone()
            return {"status": "success", "result": result[0]}
    except Exception as e:
        return {"status": "error", "message": str(e)}
