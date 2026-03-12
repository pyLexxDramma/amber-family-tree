from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database import get_db
from app.models.family_member import FamilyMember
from app.models.user import User
from app.schemas.family import FamilyMemberResponse

router = APIRouter(prefix="/family", tags=["family"])


def _member_to_response(m: FamilyMember) -> dict:
    return FamilyMemberResponse(
        id=str(m.id),
        first_name=m.first_name,
        last_name=m.last_name,
        middle_name=m.middle_name,
        nickname=m.nickname,
        birth_date=m.birth_date,
        death_date=m.death_date,
        city=m.city,
        about=m.about,
        avatar=m.avatar,
        role=m.role,
        is_active=m.is_active,
        generation=m.generation,
        relations=m.relations or [],
    ).model_dump(by_alias=True)


@router.get("/members")
async def list_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id:
        return []
    result = await db.execute(
        select(FamilyMember).where(
            FamilyMember.family_id == current_user.family_id
        )
    )
    members = result.scalars().all()
    return [_member_to_response(m) for m in members]


@router.get("/members/{member_id}")
async def get_member(
    member_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FamilyMember).where(
            FamilyMember.id == member_id,
            FamilyMember.family_id == current_user.family_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )
    return _member_to_response(member)
