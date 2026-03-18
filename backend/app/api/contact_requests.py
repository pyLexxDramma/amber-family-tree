from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database import get_db
from app.models.contact_request import ContactRequest
from app.models.family_member import FamilyMember
from app.models.user import User
from app.schemas.contact_requests import ContactRequestItem, ContactRequestState

router = APIRouter(prefix="/contact-requests", tags=["contact-requests"])


async def _ensure_member_in_family(
    *, db: AsyncSession, member_id: UUID, family_id: UUID
) -> None:
    result = await db.execute(
        select(FamilyMember).where(
            and_(FamilyMember.id == member_id, FamilyMember.family_id == family_id)
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Member not in family"
        )


@router.get("/with/{member_id}")
async def get_state_with(
    member_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id or not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no family or member profile",
        )

    await _ensure_member_in_family(
        db=db, member_id=member_id, family_id=current_user.family_id
    )

    me = current_user.member_id

    result = await db.execute(
        select(ContactRequest).where(
            and_(
                ContactRequest.family_id == current_user.family_id,
                or_(
                    and_(
                        ContactRequest.from_member_id == me,
                        ContactRequest.to_member_id == member_id,
                    ),
                    and_(
                        ContactRequest.from_member_id == member_id,
                        ContactRequest.to_member_id == me,
                    ),
                ),
            )
        )
    )
    req = result.scalars().first()
    if not req:
        return ContactRequestState(status="none", request_id=None, direction="none")

    direction = "outgoing" if req.from_member_id == me else "incoming"
    return ContactRequestState(
        status=req.status,
        request_id=str(req.id),
        direction=direction,
    )


@router.post("/with/{member_id}")
async def create_request_with(
    member_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id or not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no family or member profile",
        )

    await _ensure_member_in_family(
        db=db, member_id=member_id, family_id=current_user.family_id
    )

    me = current_user.member_id
    if me == member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create contact request to self",
        )

    result = await db.execute(
        select(ContactRequest).where(
            and_(
                ContactRequest.family_id == current_user.family_id,
                or_(
                    and_(
                        ContactRequest.from_member_id == me,
                        ContactRequest.to_member_id == member_id,
                    ),
                    and_(
                        ContactRequest.from_member_id == member_id,
                        ContactRequest.to_member_id == me,
                    ),
                ),
            )
        )
    )
    existing = result.scalars().first()
    if existing:
        return ContactRequestState(
            status=existing.status,
            request_id=str(existing.id),
            direction="outgoing" if existing.from_member_id == me else "incoming",
        )

    req = ContactRequest(
        family_id=current_user.family_id,
        from_member_id=me,
        to_member_id=member_id,
        status="pending",
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return ContactRequestState(
        status=req.status,
        request_id=str(req.id),
        direction="outgoing",
    )


@router.get("/incoming")
async def list_incoming(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id or not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no family or member profile",
        )

    result = await db.execute(
        select(ContactRequest)
        .where(
            and_(
                ContactRequest.family_id == current_user.family_id,
                ContactRequest.to_member_id == current_user.member_id,
                ContactRequest.status == "pending",
            )
        )
        .order_by(ContactRequest.created_at.asc())
    )
    items = result.scalars().all()
    return [
        ContactRequestItem(
            id=str(r.id),
            from_member_id=str(r.from_member_id),
            to_member_id=str(r.to_member_id),
            status=r.status,
            created_at=r.created_at.isoformat() if r.created_at else "",
        ).model_dump(by_alias=False)
        for r in items
    ]


@router.post("/{request_id}/accept")
async def accept_request(
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id or not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no family or member profile",
        )

    result = await db.execute(
        select(ContactRequest).where(ContactRequest.id == request_id)
    )
    req = result.scalar_one_or_none()
    if not req or req.family_id != current_user.family_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    if req.to_member_id != current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your request"
        )

    req.status = "accepted"
    req.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(req)
    return ContactRequestState(
        status=req.status,
        request_id=str(req.id),
        direction="incoming",
    )


@router.post("/{request_id}/reject")
async def reject_request(
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id or not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no family or member profile",
        )

    result = await db.execute(
        select(ContactRequest).where(ContactRequest.id == request_id)
    )
    req = result.scalar_one_or_none()
    if not req or req.family_id != current_user.family_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    if req.to_member_id != current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your request"
        )

    req.status = "rejected"
    req.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(req)
    return ContactRequestState(
        status=req.status,
        request_id=str(req.id),
        direction="incoming",
    )

