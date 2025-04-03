import asyncio

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncEngine

from app.core.db import Base, engine
from app.core.security import get_password_hash
from app.models.user import User


async def create_tables(engine: AsyncEngine) -> None:
    """
    Create database tables using SQLAlchemy models
    """
    logger.info("Creating database tables")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database tables created")


async def create_initial_superuser() -> None:
    """
    Create a superuser if it doesn't exist
    """
    from sqlalchemy import select
    from sqlalchemy.ext.asyncio import AsyncSession

    from app.core.db import async_session_maker

    async with async_session_maker() as session:
        # Check if there's at least one superuser
        result = await session.execute(
            select(User).where(User.is_superuser == True).limit(1)
        )
        superuser = result.scalar_one_or_none()

        if superuser:
            logger.info("Superuser already exists")
            return

        # Create superuser
        superuser = User(
            email="admin@example.com",
            username="admin",
            hashed_password=get_password_hash("Admin123!"),
            full_name="Admin User",
            is_active=True,
            is_superuser=True,
        )

        session.add(superuser)
        await session.commit()

        logger.info("Superuser created")


async def init_db() -> None:
    """
    Initialize database
    """
    try:
        # Create tables
        await create_tables(engine)

        # Create superuser
        await create_initial_superuser()

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        logger.exception(e)
        raise


def run_init_db() -> None:
    """
    Run database initialization as a script
    """
    asyncio.run(init_db())


if __name__ == "__main__":
    run_init_db()
