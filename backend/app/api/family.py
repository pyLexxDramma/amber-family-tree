from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database import get_db
from app.models.family_member import FamilyMember
from app.models.user import User
from app.schemas.family import FamilyMemberCreate, FamilyMemberResponse, FamilyMemberUpdate

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
        managed_by_id=str(m.managed_by_id) if m.managed_by_id else None,
    ).model_dump(by_alias=False)


def _require_admin(current_user: User) -> FamilyMember:
    if not current_user.member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No member profile")
    if (current_user.member.role or "member") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user.member


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


@router.post("/members")
async def create_member(
    body: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No family")
    _require_admin(current_user)
    first = (body.first_name or "").strip()
    last = (body.last_name or "").strip()
    birth = (body.birth_date or "").strip()
    if not first or not last or not birth:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="first_name, last_name, birth_date required")
    member = FamilyMember(
        id=uuid4(),
        family_id=current_user.family_id,
        first_name=first,
        last_name=last,
        middle_name=(body.middle_name or "").strip() or None,
        birth_date=birth,
        death_date=(body.death_date or "").strip() or None,
        city=(body.city or "").strip() or None,
        about=(body.about or "").strip() or None,
        role="member",
        is_active=True,
        generation=0,
        relations=[],
        managed_by_id=current_user.id,
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return _member_to_response(member)


@router.patch("/members/{member_id}")
async def update_member(
    member_id: UUID,
    body: FamilyMemberUpdate,
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    is_admin = current_user.member and (current_user.member.role or "member") == "admin"
    is_manager = member.managed_by_id == current_user.id
    if not is_admin and not is_manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No permission to edit")
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        if v is not None and isinstance(v, str) and k not in ("avatar",):
            v = v.strip() or None
        setattr(member, k, v)
    await db.commit()
    await db.refresh(member)
    return _member_to_response(member)
