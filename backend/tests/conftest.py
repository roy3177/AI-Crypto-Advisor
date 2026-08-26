"""
Shared pytest fixtures for database-backed tests.

`db_session` gives each test a fresh SQLAlchemy session, and wraps the test
in a transaction that is always rolled back at the end -- so tests never
leak data into each other, and never depend on run order.

`client` gives HTTP-level tests a FastAPI TestClient wired to that same
per-test transaction (via a `get_db` dependency override), so a request
made through the client and assertions made through `db_session` see the
same uncommitted data.

These tests require a real PostgreSQL database reachable at the
`DATABASE_URL` environment variable (CHECK constraints and JSONB columns
are Postgres-specific and cannot be faked with SQLite). They are skipped
automatically when no database is reachable, so the rest of the test suite
still runs without one.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture(scope="session")
def engine():
    from app.core.config import get_settings

    settings = get_settings()
    test_engine = create_engine(settings.database_url)
    try:
        with test_engine.connect():
            pass
    except Exception as exc:  # pragma: no cover - environment-dependent
        pytest.skip(f"No reachable test database at DATABASE_URL: {exc}")
    Base.metadata.create_all(test_engine)
    yield test_engine
    test_engine.dispose()


@pytest.fixture
def db_session(engine) -> Session:
    connection = engine.connect()
    transaction = connection.begin()
    session_factory = sessionmaker(bind=connection)
    session = session_factory()

    yield session

    session.close()
    if transaction.is_active:
        transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session) -> TestClient:
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
