import uuid

from sqlalchemy import ForeignKey, SmallInteger, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class MediaLike(Base):
    __tablename__ = "media_likes"
    __table_args__ = (
        UniqueConstraint("media_id", "member_id", name="uq_media_like_media_member"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    media_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("media_items.id"), nullable=False
    )
    member_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=False
    )
    strength: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1, server_default="1")

    media: Mapped["MediaItem"] = relationship("MediaItem", back_populates="media_likes")
