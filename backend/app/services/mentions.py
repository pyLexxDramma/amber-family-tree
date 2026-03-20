import re
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.family_member import FamilyMember

MENTION_RE = re.compile(r"@([A-Za-z0-9_\-А-Яа-яЁё]{2,64})")


def _normalize_handle(value: str) -> str:
    return (value or "").strip().lower()


def extract_mention_handles(text: str) -> set[str]:
    return {_normalize_handle(match) for match in MENTION_RE.findall(text or "") if match}


def _candidate_handles(member: FamilyMember) -> set[str]:
    out: set[str] = set()
    first = (member.first_name or "").strip()
    last = (member.last_name or "").strip()
    nickname = (member.nickname or "").strip()
    if nickname:
        out.add(_normalize_handle(nickname))
    if first:
        out.add(_normalize_handle(first))
    if first and last:
        out.add(_normalize_handle(f"{first}_{last}"))
        out.add(_normalize_handle(f"{first}-{last}"))
        out.add(_normalize_handle(f"{first}{last}"))
    return out


async def resolve_mentioned_member_ids(
    *,
    db: AsyncSession,
    family_id: UUID,
    text: str,
) -> set[str]:
    handles = extract_mention_handles(text)
    if not handles:
        return set()
    result = await db.execute(select(FamilyMember).where(FamilyMember.family_id == family_id))
    members = result.scalars().all()
    mentioned: set[str] = set()
    for member in members:
        if _candidate_handles(member).intersection(handles):
            mentioned.add(str(member.id))
    return mentioned

