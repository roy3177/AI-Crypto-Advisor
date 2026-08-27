# @author: Roy Meoded
# @date: 27.08.2026
# @description: SQLAlchemy declarative base shared by all ORM models.

"""
SQLAlchemy engine and declarative base.

`Base` is imported by every model class (defined later in
`/design-database-schema`) so that Alembic can discover the full schema
through `Base.metadata`.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)


class Base(DeclarativeBase):
    pass
