from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user
from app.database import get_db
from app.models.publication import Publication
from app.models.user import User
from app.schemas.history import EventFromPublicationCreate, EventListResponse, EventResponse
from app.storage_urls import public_s3_object_url, resolve_public_media_url

router = APIRouter(prefix="/history", tags=["history"])


def _event_from_publication(p: Publication) -> dict:
    media = []
    for m in p.media:
        url = public_s3_object_url(m.url)
        media.append(
            {
                "id": str(m.id),
                "type": m.type,
                "url": url,
                "thumbnail": resolve_public_media_url(m.thumbnail) or url,
                "name": m.name,
            }
        )
    title = (p.title or "").strip() or f"Событие {p.event_date}"
    return EventResponse(
        id=str(p.id),
        title=title,
        event_date=p.event_date,
        event_date_approximate=bool(p.event_date_approximate),
        family_id=str(p.family_id),
        source_publication_id=str(p.id),
        participant_ids=p.participant_ids or [],
        media=media,
        text=p.text or "",
    ).model_dump(by_alias=False)


@router.get("/events", response_model=EventListResponse)
async def list_events(
    from_date: str | None = Query(default=None, alias="from"),
    to_date: str | None = Query(default=None, alias="to"),
    member_id: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id:
        return EventListResponse(items=[])
    q = (
        select(Publication)
        .options(selectinload(Publication.media))
        .where(Publication.family_id == current_user.family_id)
        .order_by(Publication.event_date.desc(), Publication.publish_date.desc())
    )
    result = await db.execute(q)
    pubs = result.scalars().all()

    items: list[dict] = []
    for p in pubs:
        if from_date and p.event_date < from_date:
            continue
        if to_date and p.event_date > to_date:
            continue
        if member_id:
            participants = set(p.participant_ids or [])
            participants.add(str(p.author_id))
            if member_id not in participants:
                continue
        items.append(_event_from_publication(p))
    return EventListResponse(items=items)


@router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id:
        raise HTTPException(status_code=404, detail="Event not found")
    result = await db.execute(
        select(Publication)
        .options(selectinload(Publication.media))
        .where(Publication.id == event_id, Publication.family_id == current_user.family_id)
    )
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Event not found")
    return _event_from_publication(p)


@router.post("/events/from-publication", response_model=EventResponse)
async def create_event_from_publication(
    body: EventFromPublicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id:
        raise HTTPException(status_code=404, detail="Publication not found")
    try:
        publication_id = UUID(body.publicationId)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid publication_id") from exc
    result = await db.execute(
        select(Publication)
        .options(selectinload(Publication.media))
        .where(Publication.id == publication_id, Publication.family_id == current_user.family_id)
    )
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Publication not found")
    return _event_from_publication(p)
