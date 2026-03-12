from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import get_current_user
from app.database import get_db
from app.models.media_item import MediaItem
from app.models.publication import Publication
from app.models.user import User
from app.schemas.family import FamilyMemberResponse
from app.schemas.feed import MediaItemResponse
from app.schemas.profile import ProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])

def _to_public_media_url(raw: str) -> str:
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw
    settings = get_settings()
    base = (settings.s3_public_endpoint_url or settings.s3_endpoint_url).rstrip("/")
    return f"{base}/{settings.s3_bucket}/{raw}"


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    member = current_user.member
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found",
        )
    return FamilyMemberResponse(
        id=str(member.id),
        first_name=member.first_name,
        last_name=member.last_name,
        middle_name=member.middle_name,
        nickname=member.nickname,
        birth_date=member.birth_date,
        death_date=member.death_date,
        city=member.city,
        about=member.about,
        avatar=member.avatar,
        role=member.role,
        is_active=member.is_active,
        generation=member.generation,
        relations=member.relations or [],
    ).model_dump(by_alias=True)


@router.patch("/me")
async def update_my_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    member = current_user.member
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found",
        )
    update = body.model_dump(exclude_unset=True)
    for k, v in update.items():
        setattr(member, k, v)
    await db.commit()
    await db.refresh(member)
    return FamilyMemberResponse(
        id=str(member.id),
        first_name=member.first_name,
        last_name=member.last_name,
        middle_name=member.middle_name,
        nickname=member.nickname,
        birth_date=member.birth_date,
        death_date=member.death_date,
        city=member.city,
        about=member.about,
        avatar=member.avatar,
        role=member.role,
        is_active=member.is_active,
        generation=member.generation,
        relations=member.relations or [],
    ).model_dump(by_alias=True)


@router.get("/me/media")
async def list_my_media(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        return []
    # Media items that belong to publications authored by current user
    result = await db.execute(
        select(MediaItem)
        .join(Publication, MediaItem.publication_id == Publication.id)
        .where(Publication.author_id == current_user.member_id)
    )
    items = result.scalars().all()
    return [
        MediaItemResponse(
            id=str(m.id),
            type=m.type,
            url=_to_public_media_url(m.url),
            thumbnail=m.thumbnail,
            name=m.name,
            size=m.size,
            duration=m.duration,
            width=m.width,
            height=m.height,
            event_date=m.event_date,
            year=m.year,
            category=m.category,
            publication_id=str(m.publication_id) if m.publication_id else None,
        ).model_dump(by_alias=True)
        for m in items
    ]
