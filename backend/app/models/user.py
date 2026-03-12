import uuid

from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    identifier: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    family_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("families.id"), nullable=True
    )
    member_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    family: Mapped["Family | None"] = relationship("Family", back_populates="users")
    member: Mapped["FamilyMember | None"] = relationship(
        "FamilyMember", back_populates="user", foreign_keys="User.member_id"
    )
