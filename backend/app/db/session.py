"""
Database session management.

`get_db` is a FastAPI dependency: each request gets its own SQLAlchemy
session, which is always closed afterwards (even if the request raised an
exception). Routes and services must never open a session on their own --
they should receive one through dependency injection instead.
"""
from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from app.db.base import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
