import uuid

from sqlalchemy import String, Boolean, Integer, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class FamilyMember(Base):
    __tablename__ = "family_members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    family_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("families.id"), nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(255))
    last_name: Mapped[str] = mapped_column(String(255))
    middle_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    nickname: Mapped[str | None] = mapped_column(String(255), nullable=True)
    birth_date: Mapped[str] = mapped_column(String(50))
    death_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    city: Mapped[str | None] = mapped_column(String(255), nullable=True)
    about: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="member")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    generation: Mapped[int] = mapped_column(Integer, default=0)
    relations: Mapped[list[dict]] = mapped_column(JSONB, default=list)

    family: Mapped["Family"] = relationship("Family", back_populates="members")
    user: Mapped["User | None"] = relationship(
        "User", back_populates="member", foreign_keys="User.member_id", uselist=False
    )
    authored_publications: Mapped[list["Publication"]] = relationship(
        "Publication", back_populates="author", foreign_keys="Publication.author_id"
    )
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", back_populates="author_member"
    )
    likes: Mapped[list["Like"]] = relationship("Like", back_populates="member")
    invitations_sent: Mapped[list["Invitation"]] = relationship(
        "Invitation", back_populates="from_member"
    )
