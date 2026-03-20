from datetime import datetime
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user
from app.database import get_db
from app.models.comment import Comment
from app.models.comment_like import CommentLike
from app.models.like import Like
from app.models.media_like import MediaLike
from app.models.media_item import MediaItem
from app.models.publication import Publication
from app.models.user import User
from app.services.email_notifications import notify_participants_about_publication
from app.config import get_settings
from app.schemas.feed import (
    CommentCreate,
    CommentResponse,
    MediaItemResponse,
    PublicationCreate,
    PublicationUpdate,
    PublicationResponse,
)

router = APIRouter(prefix="/feed", tags=["feed"])

def _infer_media_type_from_key(key: str) -> str | None:
    try:
        parts = key.split("/")
        if len(parts) >= 3 and parts[0] == "uploads":
            folder = parts[2]
            if folder in ("photo", "video", "audio", "document"):
                return folder
    except Exception:
        return None
    return None

def _to_public_media_url(raw: str) -> str:
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw
    if raw.startswith("/"):
        return raw
    settings = get_settings()
    base = (settings.s3_public_endpoint_url or settings.s3_endpoint_url).rstrip("/")
    return f"{base}/{settings.s3_bucket}/{raw}"


def _expand_strength(member_id: str, strength: int) -> list[str]:
    s = int(strength or 1)
    if s < 1:
        s = 1
    if s > 3:
        s = 3
    return [member_id] * s


def _media_to_response(m: MediaItem) -> dict:
    url = _to_public_media_url(m.url)
    thumb = m.thumbnail if (m.thumbnail and (m.thumbnail.startswith("http://") or m.thumbnail.startswith("https://"))) else url
    media_likes = getattr(m, "__dict__", {}).get("media_likes") or []
    like_ids: list[str] = []
    for like in media_likes:
        like_ids.extend(_expand_strength(str(like.member_id), int(getattr(like, "strength", 1) or 1)))
    return MediaItemResponse(
        id=str(m.id),
        type=m.type,
        url=url,
        thumbnail=thumb,
        name=m.name,
        size=m.size,
        duration=m.duration,
        width=m.width,
        height=m.height,
        event_date=m.event_date,
        year=m.year,
        category=m.category,
        publication_id=str(m.publication_id) if m.publication_id else None,
        likes=like_ids,
    ).model_dump(by_alias=False)


def _comment_to_response(c: Comment) -> dict:
    likes_rel = getattr(c, "__dict__", {}).get("likes") or []
    like_ids = [str(l.member_id) for l in likes_rel]
    return CommentResponse(
        id=str(c.id),
        author_id=str(c.author_id),
        text=c.text,
        created_at=c.created_at.isoformat() if c.created_at else "",
        likes=like_ids,
    ).model_dump(by_alias=False)


def _expand_like_ids_from_rel(likes: list[Like]) -> list[str]:
    expanded: list[str] = []
    for like in likes:
        member_id = str(like.member_id)
        strength = int(getattr(like, "strength", 1) or 1)
        if strength < 1:
            strength = 1
        if strength > 3:
            strength = 3
        expanded.extend([member_id] * strength)
    return expanded


def _publication_to_response(
    p: Publication,
    like_ids: list[str],
) -> dict:
    return PublicationResponse(
        id=str(p.id),
        author_id=str(p.author_id),
        type=p.type,
        co_author_ids=p.co_author_ids or [],
        title=p.title,
        text=p.text,
        event_date=p.event_date,
        event_date_approximate=p.event_date_approximate,
        place=p.place,
        publish_date=p.publish_date,
        media=[_media_to_response(m) for m in p.media],
        participant_ids=p.participant_ids or [],
        topic_tag=p.topic_tag,
        likes=like_ids,
        comments=[_comment_to_response(c) for c in p.comments],
        is_read=p.is_read,
        visible_for=p.visible_for,
        exclude_for=p.exclude_for,
        content_blocks=getattr(p, "content_blocks", None),
    ).model_dump(by_alias=False)

async def _load_publication_for_response(
    *,
    db: AsyncSession,
    publication_id: UUID,
    family_id: UUID | None,
) -> Publication | None:
    q = (
        select(Publication)
        .execution_options(populate_existing=True)
        .options(
            selectinload(Publication.media).selectinload(MediaItem.media_likes),
            selectinload(Publication.comments).selectinload(Comment.likes),
            selectinload(Publication.likes),
        )
        .where(Publication.id == publication_id)
    )
    if family_id is not None:
        q = q.where(Publication.family_id == family_id)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def _get_like_ids(*, db: AsyncSession, publication_id: UUID) -> list[str]:
    result = await db.execute(
        select(Like.member_id, Like.strength).where(Like.publication_id == publication_id)
    )
    expanded: list[str] = []
    for member_id, strength in result.all():
        expanded.extend(_expand_strength(str(member_id), int(strength or 1)))
    return expanded


@router.get("")
async def list_feed(
    limit: int | None = None,
    offset: int | None = None,
    author_id: str | None = None,
    topic_tag: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id:
        return []
    q = select(Publication).where(
        Publication.family_id == current_user.family_id
    )
    if author_id:
        q = q.where(Publication.author_id == UUID(author_id))
    if topic_tag:
        q = q.where(Publication.topic_tag == topic_tag)
    q = q.order_by(Publication.publish_date.desc())
    if offset is not None:
        q = q.offset(offset)
    if limit is not None:
        q = q.limit(limit)
    q = q.options(
        selectinload(Publication.media).selectinload(MediaItem.media_likes),
        selectinload(Publication.comments).selectinload(Comment.likes),
        selectinload(Publication.likes),
    )
    result = await db.execute(q)
    publications = result.scalars().all()
    out = []
    for p in publications:
        like_ids = _expand_like_ids_from_rel(p.likes)
        out.append(_publication_to_response(p, like_ids))
    return out


@router.get("/{publication_id}")
async def get_publication(
    publication_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pub = await _load_publication_for_response(
        db=db, publication_id=publication_id, family_id=current_user.family_id
    )
    if not pub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    like_ids = _expand_like_ids_from_rel(pub.likes)
    return _publication_to_response(pub, like_ids)


@router.post("")
async def create_publication(
    body: PublicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id or not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no family or member profile",
        )
    pub = Publication(
        id=uuid4(),
        family_id=current_user.family_id,
        author_id=current_user.member_id,
        type=body.type,
        title=body.title,
        text=body.text,
        event_date=body.event_date,
        event_date_approximate=body.event_date_approximate,
        place=body.place,
        publish_date=datetime.utcnow().strftime("%Y-%m-%d"),
        topic_tag=body.topic_tag,
        co_author_ids=body.co_author_ids,
        participant_ids=body.participant_ids,
        visible_for=body.visible_for,
        exclude_for=body.exclude_for,
        is_read=False,
        content_blocks=body.content_blocks,
    )
    db.add(pub)
    await db.flush()
    for key in body.media_keys:
        inferred = _infer_media_type_from_key(key)
        media_item = MediaItem(
            id=uuid4(),
            publication_id=pub.id,
            type=inferred or (body.type if body.type in ("photo", "video", "audio", "document") else "photo"),
            url=key,
            name=key.split("/")[-1],
            size=0,
        )
        db.add(media_item)
    await db.commit()
    await notify_participants_about_publication(
        db=db,
        participant_ids=body.participant_ids,
        family_id=current_user.family_id,
        author_id=current_user.member_id,
        publication_id=pub.id,
        publication_title=body.title,
    )
    result = await db.execute(
        select(Publication)
        .options(
            selectinload(Publication.media).selectinload(MediaItem.media_likes),
            selectinload(Publication.comments).selectinload(Comment.likes),
            selectinload(Publication.likes),
        )
        .where(Publication.id == pub.id)
    )
    pub_loaded = result.scalar_one()
    like_ids = _expand_like_ids_from_rel(pub_loaded.likes)
    return _publication_to_response(pub_loaded, like_ids)


@router.post("/{publication_id}/comments")
async def add_comment(
    publication_id: UUID,
    body: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no member profile",
        )
    result = await db.execute(
        select(Publication)
        .where(Publication.id == publication_id)
        .where(Publication.family_id == current_user.family_id)
    )
    pub = result.scalar_one_or_none()
    if not pub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    comment = Comment(
        id=uuid4(),
        publication_id=publication_id,
        author_id=current_user.member_id,
        text=body.text,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return _comment_to_response(comment)


@router.patch("/{publication_id}")
async def update_publication(
    publication_id: UUID,
    body: PublicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no member profile",
        )
    pub = await _load_publication_for_response(
        db=db, publication_id=publication_id, family_id=current_user.family_id
    )
    if pub is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    if pub.author_id != current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only author can edit publication",
        )
    previous_participant_ids = set(pub.participant_ids or [])
    data = body.model_dump(exclude_unset=True)
    add_media_keys = data.pop("add_media_keys", None) or []
    remove_media_ids = set(data.pop("remove_media_ids", None) or [])
    incoming_participant_ids = data.get("participant_ids")
    for k, v in data.items():
        setattr(pub, k, v)
    if remove_media_ids:
        for m in list(pub.media):
            if str(m.id) in remove_media_ids:
                await db.delete(m)
    if add_media_keys:
        for key in add_media_keys:
            inferred = _infer_media_type_from_key(key)
            media_item = MediaItem(
                id=uuid4(),
                publication_id=pub.id,
                type=inferred or (pub.type if pub.type in ("photo", "video", "audio", "document") else "photo"),
                url=key,
                thumbnail=None,
                name=key.split("/")[-1],
                size=0,
            )
            db.add(media_item)
    await db.commit()
    if incoming_participant_ids is not None:
        new_participant_ids = set(incoming_participant_ids) - previous_participant_ids
        await notify_participants_about_publication(
            db=db,
            participant_ids=new_participant_ids,
            family_id=current_user.family_id,
            author_id=current_user.member_id,
            publication_id=pub.id,
            publication_title=pub.title,
        )
    pub = await _load_publication_for_response(
        db=db, publication_id=publication_id, family_id=current_user.family_id
    )
    if pub is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    like_ids = _expand_like_ids_from_rel(pub.likes)
    return _publication_to_response(pub, like_ids)


@router.delete("/{publication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_publication(
    publication_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no member profile",
        )
    result = await db.execute(
        select(Publication)
        .where(Publication.id == publication_id)
        .where(Publication.family_id == current_user.family_id)
    )
    pub = result.scalar_one_or_none()
    if pub is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    if pub.author_id != current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only author can delete publication",
        )
    await db.delete(pub)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{publication_id}/like")
async def add_like(
    publication_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no member profile",
        )
    pub = await _load_publication_for_response(
        db=db, publication_id=publication_id, family_id=current_user.family_id
    )
    if pub is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    existing = await db.execute(
        select(Like).where(
            Like.publication_id == publication_id,
            Like.member_id == current_user.member_id,
        )
    )
    existing_like = existing.scalar_one_or_none()
    if existing_like:
        current_strength = int(getattr(existing_like, "strength", 1) or 1)
        if current_strength < 3:
            existing_like.strength = current_strength + 1
            await db.commit()
            pub = await _load_publication_for_response(
                db=db, publication_id=publication_id, family_id=current_user.family_id
            )
            if pub is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Publication not found",
                )
        like_ids = await _get_like_ids(db=db, publication_id=publication_id)
        return _publication_to_response(pub, like_ids)
    like = Like(
        id=uuid4(),
        publication_id=publication_id,
        member_id=current_user.member_id,
    )
    db.add(like)
    await db.commit()
    pub = await _load_publication_for_response(
        db=db, publication_id=publication_id, family_id=current_user.family_id
    )
    if pub is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    like_ids = await _get_like_ids(db=db, publication_id=publication_id)
    return _publication_to_response(pub, like_ids)


@router.post("/{publication_id}/comments/{comment_id}/like")
async def add_comment_like(
    publication_id: UUID,
    comment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no member profile",
        )
    result = await db.execute(
        select(Comment)
        .join(Publication, Publication.id == Comment.publication_id)
        .where(Comment.id == comment_id)
        .where(Comment.publication_id == publication_id)
        .where(Publication.family_id == current_user.family_id)
        .options(selectinload(Comment.likes))
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )
    existing = await db.execute(
        select(CommentLike).where(
            and_(
                CommentLike.comment_id == comment_id,
                CommentLike.member_id == current_user.member_id,
            )
        )
    )
    if existing.scalar_one_or_none():
        return _comment_to_response(comment)
    like = CommentLike(
        id=uuid4(),
        comment_id=comment_id,
        member_id=current_user.member_id,
    )
    db.add(like)
    await db.commit()
    await db.refresh(comment)
    result = await db.execute(
        select(Comment)
        .where(Comment.id == comment_id)
        .options(selectinload(Comment.likes))
    )
    comment = result.scalar_one()
    return _comment_to_response(comment)


@router.delete("/{publication_id}/comments/{comment_id}/like")
async def remove_comment_like(
    publication_id: UUID,
    comment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no member profile",
        )
    result = await db.execute(
        select(Comment)
        .join(Publication, Publication.id == Comment.publication_id)
        .where(Comment.id == comment_id)
        .where(Comment.publication_id == publication_id)
        .where(Publication.family_id == current_user.family_id)
        .options(selectinload(Comment.likes))
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )
    existing = await db.execute(
        select(CommentLike).where(
            and_(
                CommentLike.comment_id == comment_id,
                CommentLike.member_id == current_user.member_id,
            )
        )
    )
    like = existing.scalar_one_or_none()
    if like:
        await db.delete(like)
        await db.commit()
    result = await db.execute(
        select(Comment)
        .where(Comment.id == comment_id)
        .options(selectinload(Comment.likes))
    )
    comment = result.scalar_one()
    return _comment_to_response(comment)


@router.delete("/{publication_id}/like")
async def remove_like(
    publication_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no member profile",
        )
    result = await db.execute(
        select(Like).where(
            Like.publication_id == publication_id,
            Like.member_id == current_user.member_id,
        )
    )
    like = result.scalar_one_or_none()
    if like:
        current_strength = int(getattr(like, "strength", 1) or 1)
        if current_strength > 1:
            like.strength = current_strength - 1
        else:
            await db.delete(like)
    await db.commit()
    result = await db.execute(
        select(Publication)
        .options(
            selectinload(Publication.media).selectinload(MediaItem.media_likes),
            selectinload(Publication.comments),
            selectinload(Publication.likes),
        )
        .where(Publication.id == publication_id)
        .where(Publication.family_id == current_user.family_id)
    )
    pub = result.scalar_one_or_none()
    if not pub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    like_ids = await _get_like_ids(db=db, publication_id=publication_id)
    return _publication_to_response(pub, like_ids)


@router.post("/{publication_id}/media/{media_id}/like")
async def add_media_like(
    publication_id: UUID,
    media_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User has no member profile")
    pub = await _load_publication_for_response(db=db, publication_id=publication_id, family_id=current_user.family_id)
    if pub is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
    media = next((m for m in pub.media if m.id == media_id and m.type in ("photo", "video")), None)
    if media is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    existing = await db.execute(select(MediaLike).where(MediaLike.media_id == media_id, MediaLike.member_id == current_user.member_id))
    media_like = existing.scalar_one_or_none()
    if media_like:
        current_strength = int(getattr(media_like, "strength", 1) or 1)
        if current_strength < 3:
            media_like.strength = current_strength + 1
            await db.commit()
    else:
        db.add(MediaLike(id=uuid4(), media_id=media_id, member_id=current_user.member_id))
        await db.commit()
    pub = await _load_publication_for_response(db=db, publication_id=publication_id, family_id=current_user.family_id)
    if pub is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
    like_ids = await _get_like_ids(db=db, publication_id=publication_id)
    return _publication_to_response(pub, like_ids)


@router.delete("/{publication_id}/media/{media_id}/like")
async def remove_media_like(
    publication_id: UUID,
    media_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User has no member profile")
    pub = await _load_publication_for_response(db=db, publication_id=publication_id, family_id=current_user.family_id)
    if pub is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
    media = next((m for m in pub.media if m.id == media_id and m.type in ("photo", "video")), None)
    if media is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    existing = await db.execute(select(MediaLike).where(MediaLike.media_id == media_id, MediaLike.member_id == current_user.member_id))
    media_like = existing.scalar_one_or_none()
    if media_like:
        current_strength = int(getattr(media_like, "strength", 1) or 1)
        if current_strength > 1:
            media_like.strength = current_strength - 1
        else:
            await db.delete(media_like)
        await db.commit()
    pub = await _load_publication_for_response(db=db, publication_id=publication_id, family_id=current_user.family_id)
    if pub is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
    like_ids = await _get_like_ids(db=db, publication_id=publication_id)
    return _publication_to_response(pub, like_ids)
