import uuid

from sqlalchemy import String, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Publication(Base):
    __tablename__ = "publications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    family_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("families.id"), nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(50))
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    text: Mapped[str] = mapped_column(Text, default="")
    event_date: Mapped[str] = mapped_column(String(50))
    event_date_approximate: Mapped[bool] = mapped_column(Boolean, default=False)
    place: Mapped[str | None] = mapped_column(String(255), nullable=True)
    publish_date: Mapped[str] = mapped_column(String(50))
    topic_tag: Mapped[str] = mapped_column(String(255), default="")
    co_author_ids: Mapped[list[str]] = mapped_column(JSONB, default=list)
    participant_ids: Mapped[list[str]] = mapped_column(JSONB, default=list)
    visible_for: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    exclude_for: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    content_blocks: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    family: Mapped["Family"] = relationship("Family", back_populates="publications")
    author: Mapped["FamilyMember"] = relationship(
        "FamilyMember", back_populates="authored_publications", foreign_keys=[author_id]
    )
    media: Mapped[list["MediaItem"]] = relationship(
        "MediaItem", back_populates="publication", cascade="all, delete-orphan"
    )
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", back_populates="publication", cascade="all, delete-orphan"
    )
    likes: Mapped[list["Like"]] = relationship(
        "Like", back_populates="publication", cascade="all, delete-orphan"
    )
