from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database import get_db
from app.models.family_member import FamilyMember
from app.models.message import Message
from app.models.user import User
from app.schemas.messages import MessageCreate, MessageResponse

router = APIRouter(prefix="/messages", tags=["messages"])


def _message_to_response(m: Message) -> dict:
    return MessageResponse(
        id=str(m.id),
        sender_id=str(m.sender_id),
        recipient_id=str(m.recipient_id),
        text=m.text,
        created_at=m.created_at.isoformat() if m.created_at else "",
    ).model_dump(by_alias=False)


async def _ensure_recipient_in_family(
    *,
    db: AsyncSession,
    recipient_id: UUID,
    family_id: UUID,
) -> None:
    result = await db.execute(
        select(FamilyMember)
        .where(FamilyMember.id == recipient_id)
        .where(FamilyMember.family_id == family_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found",
        )


@router.get("/with/{member_id}")
async def list_messages_with(
    member_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id or not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no family or member profile",
        )
    await _ensure_recipient_in_family(
        db=db, recipient_id=member_id, family_id=current_user.family_id
    )

    me = current_user.member_id
    other = member_id
    result = await db.execute(
        select(Message)
        .where(Message.family_id == current_user.family_id)
        .where(
            or_(
                and_(Message.sender_id == me, Message.recipient_id == other),
                and_(Message.sender_id == other, Message.recipient_id == me),
            )
        )
        .order_by(Message.created_at.asc())
    )
    return [_message_to_response(m) for m in result.scalars().all()]


@router.post("/with/{member_id}")
async def send_message_to(
    member_id: UUID,
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id or not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no family or member profile",
        )
    await _ensure_recipient_in_family(
        db=db, recipient_id=member_id, family_id=current_user.family_id
    )

    text = (body.text or "").strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text is required",
        )

    msg = Message(
        id=uuid4(),
        family_id=current_user.family_id,
        sender_id=current_user.member_id,
        recipient_id=member_id,
        text=text,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return _message_to_response(msg)

