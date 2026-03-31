from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database import get_db
from app.models.family_member import FamilyMember
from app.models.user import User
from app.seed.reference import REFERENCE_EMAIL, seed_reference_user

router = APIRouter(prefix="/debug", tags=["debug"])


@router.post("/seed-reference")
async def force_seed_reference(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.identifier.strip().lower() != REFERENCE_EMAIL:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only reference user can seed")
    if not current_user.member_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No member profile")
    member = await db.get(FamilyMember, current_user.member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    try:
        await seed_reference_user(db, current_user, member, force=True)
        return {"ok": True, "message": "Seed completed"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/seed-demo-content")
async def seed_demo_content_for_current_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.member_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No member profile")
    member = await db.get(FamilyMember, current_user.member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    try:
        await seed_reference_user(
            db,
            current_user,
            member,
            force=True,
            only_reference_user=False,
        )
        return {"ok": True, "message": "Demo content seeded for current user"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
