from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config.settings import settings
from .api.endpoints import epidemic

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(
    epidemic.router,
    prefix=f"{settings.API_V1_STR}/epidemics",
    tags=["Epidemics"]
)

# Route de santé
@app.get("/health")
def health_check():
    return {"status": "healthy"} 