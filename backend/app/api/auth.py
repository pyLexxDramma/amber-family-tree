from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_current_user
from app.database import get_db
from app.models.family import Family
from app.models.family_member import FamilyMember
from app.models.user import User
from app.schemas.auth import (
    AppUser,
    FamilyMemberInUser,
    SendCodeRequest,
    SendCodeResponse,
    SubscriptionResponse,
    VerifyRequest,
   # VerifyResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-code", response_model=SendCodeResponse)
async def send_code(
    body: SendCodeRequest,
    db: AsyncSession = Depends(get_db),
) -> SendCodeResponse:
    # Minimal: no OTP sent yet, just acknowledge
    return SendCodeResponse(sent=True)


@router.post("/verify")
async def verify(
    body: VerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    # Minimal: accept any code, create or get user and return token + AppUser
    result = await db.execute(
        select(User).where(User.identifier == body.identifier)
    )
    user = result.scalar_one_or_none()
    if not user:
        family = Family(id=uuid4(), name=None)
        db.add(family)
        await db.flush()
        member = FamilyMember(
            id=uuid4(),
            family_id=family.id,
            first_name="User",
            last_name=body.identifier[:20],
            birth_date="",
            role="member",
            is_active=True,
            generation=0,
            relations=[],
        )
        db.add(member)
        await db.flush()
        user = User(
            id=uuid4(),
            identifier=body.identifier,
            family_id=family.id,
            member_id=member.id,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        await db.commit()
        await db.refresh(user)

    member = user.member
    if not member:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Member not found",
        )

    token = create_access_token(user.id)
    subscription = SubscriptionResponse(
        plan_id="free",
        used_places=0,
        expires_at="2026-12-31",
    )
    member_schema = FamilyMemberInUser(
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
    )
    app_user = AppUser(
        id=str(user.id),
        member=member_schema,
        subscription=subscription,
    )
    return {"access_token": token, "token_type": "bearer", "user": app_user.to_camel()}


@router.get("/me")
async def me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Return current user as AppUser (camelCase for frontend)
    if not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found",
        )
    member = await db.get(FamilyMember, current_user.member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found",
        )
    subscription = SubscriptionResponse(
        plan_id="free",
        used_places=0,
        expires_at="2026-12-31",
    )
    member_schema = FamilyMemberInUser(
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
    )
    app_user = AppUser(
        id=str(current_user.id),
        member=member_schema,
        subscription=subscription,
    )
    return app_user.to_camel()
