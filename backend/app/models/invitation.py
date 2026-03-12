import uuid
from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Invitation(Base):
    __tablename__ = "invitations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    family_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("families.id"), nullable=False
    )
    from_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=False
    )
    to_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    to_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    link: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(50), default="sent")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    family: Mapped["Family"] = relationship("Family", back_populates="invitations")
    from_member: Mapped["FamilyMember"] = relationship(
        "FamilyMember", back_populates="invitations_sent"
    )
