import uuid

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Family(Base):
    __tablename__ = "families"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    members: Mapped[list["FamilyMember"]] = relationship(
        "FamilyMember", back_populates="family"
    )
    users: Mapped[list["User"]] = relationship("User", back_populates="family")
    publications: Mapped[list["Publication"]] = relationship(
        "Publication", back_populates="family"
    )
    invitations: Mapped[list["Invitation"]] = relationship(
        "Invitation", back_populates="family"
    )
