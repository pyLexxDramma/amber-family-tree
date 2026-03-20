from collections.abc import AsyncGenerator

import asyncio
import time

from sqlalchemy import text
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
    MediaLike,
    Invitation,
    Message,
    ContactRequest,
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
                await conn.execute(text("ALTER TABLE publications ADD COLUMN IF NOT EXISTS content_blocks JSONB"))
                await conn.execute(text("ALTER TABLE family_members ADD COLUMN IF NOT EXISTS managed_by_id UUID REFERENCES users(id)"))
                await conn.execute(text("""
                    WITH ranked AS (
                        SELECT
                            id,
                            publication_id,
                            member_id,
                            COALESCE(strength, 1) AS strength,
                            ROW_NUMBER() OVER (
                                PARTITION BY publication_id, member_id
                                ORDER BY id
                            ) AS rn,
                            SUM(COALESCE(strength, 1)) OVER (
                                PARTITION BY publication_id, member_id
                            ) AS total_strength
                        FROM likes
                    ),
                    updated AS (
                        UPDATE likes l
                        SET strength = LEAST(3, GREATEST(1, ranked.total_strength))
                        FROM ranked
                        WHERE ranked.rn = 1
                          AND l.id = ranked.id
                        RETURNING l.id
                    )
                    DELETE FROM likes l
                    USING ranked
                    WHERE ranked.rn > 1
                      AND l.id = ranked.id
                """))
                await conn.execute(text("""
                    WITH ranked AS (
                        SELECT
                            id,
                            media_id,
                            member_id,
                            COALESCE(strength, 1) AS strength,
                            ROW_NUMBER() OVER (
                                PARTITION BY media_id, member_id
                                ORDER BY id
                            ) AS rn,
                            SUM(COALESCE(strength, 1)) OVER (
                                PARTITION BY media_id, member_id
                            ) AS total_strength
                        FROM media_likes
                    ),
                    updated AS (
                        UPDATE media_likes ml
                        SET strength = LEAST(3, GREATEST(1, ranked.total_strength))
                        FROM ranked
                        WHERE ranked.rn = 1
                          AND ml.id = ranked.id
                        RETURNING ml.id
                    )
                    DELETE FROM media_likes ml
                    USING ranked
                    WHERE ranked.rn > 1
                      AND ml.id = ranked.id
                """))
                await conn.execute(text("""
                    CREATE UNIQUE INDEX IF NOT EXISTS uq_like_publication_member_idx
                    ON likes (publication_id, member_id)
                """))
                await conn.execute(text("""
                    CREATE UNIQUE INDEX IF NOT EXISTS uq_media_like_media_member_idx
                    ON media_likes (media_id, member_id)
                """))
            return
        except Exception as exc:
            last_exc = exc
            await asyncio.sleep(1)
    if last_exc:
        raise last_exc
