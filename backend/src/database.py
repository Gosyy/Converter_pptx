from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from fastapi import HTTPException
from src.config import settings

DATABASE_ENABLED = bool(settings.USE_DATABASE)
DATABASE_URL = None
engine = None
SessionLocal = None

if DATABASE_ENABLED:
    required = [
        settings.POSTGRES_USER,
        settings.POSTGRES_PASSWORD,
        settings.POSTGRES_HOST,
        settings.POSTGRES_DB,
    ]
    if not all(required):
        raise RuntimeError(
            "USE_DATABASE=true, but POSTGRES_* variables are not fully configured."
        )
    DATABASE_URL = (
        f"postgresql://{settings.POSTGRES_USER}:"
        f"{settings.POSTGRES_PASSWORD}@"
        f"{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/"
        f"{settings.POSTGRES_DB}"
    )
    engine = create_engine(DATABASE_URL, echo=True)  # echo=True для логов SQL
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    if not DATABASE_ENABLED or SessionLocal is None:
        raise HTTPException(
            status_code=503,
            detail="Database is disabled. Set USE_DATABASE=true and configure POSTGRES_*.",
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
