from collections.abc import AsyncGenerator

import asyncio
import time

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.models.base import Base

# Import all models so they are registered with Base.metadata
from app.models import (  # noqa: F401
    Family,
    User,
    FamilyMember,
    Publication,
    MediaItem,
    Comment,
    CommentLike,
    Like,
    Invitation,
    Message,
)

settings = get_settings()
engine = create_async_engine(
    settings.database_url,
    echo=settings.app_debug,
)
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    deadline = time.monotonic() + 30
    last_exc: Exception | None = None
    while time.monotonic() < deadline:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            return
        except Exception as exc:
            last_exc = exc
            await asyncio.sleep(1)
    if last_exc:
        raise last_exc
