import asyncio
import os
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.db import Base, get_db
from app.main import create_application
from app.models.item import Item

# Import all models to ensure they're registered with Base.metadata
from app.models.user import User

# Test database file path
TEST_DB_FILE = "./test.db"
# Use file-based SQLite for persistent testing to avoid in-memory issues
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE}"

# Create test engine at module level to reuse between fixtures
test_engine = None
TestingSessionLocal = None


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """
    Create an instance of the default event loop for each test case.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    """
    Setup the test database and create all tables.
    This fixture runs automatically before any tests.
    """
    global test_engine, TestingSessionLocal

    # Remove the test database file if it exists
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

    # Create the engine
    test_engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=NullPool,
        future=True,
        connect_args={"check_same_thread": False},
    )

    # Create session factory
    TestingSessionLocal = sessionmaker(
        bind=test_engine, class_=AsyncSession, expire_on_commit=False
    )

    # Create all tables
    async with test_engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

        # Debug - print tables that were created
        await conn.run_sync(
            lambda sync_conn: print(
                f"Created tables: {sync_conn.engine.dialect.get_table_names(sync_conn)}"
            )
        )

    yield

    # Clean up after tests
    await test_engine.dispose()

    # Remove the test database file
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)


@pytest_asyncio.fixture
async def test_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database session for a test.
    """
    if TestingSessionLocal is None:
        pytest.fail("Test database has not been properly initialized")

    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def test_app(test_db_session) -> FastAPI:
    """
    Create a test app with overridden dependencies.
    """
    app = create_application()

    async def get_test_db():
        yield test_db_session

    # Override the get_db dependency
    app.dependency_overrides[get_db] = get_test_db

    return app


@pytest.fixture
def client(test_app) -> TestClient:
    """
    Create a synchronous test client for the test app.
    """
    return TestClient(test_app)
