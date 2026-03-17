from pydantic import BaseModel, Field


class MediaItemResponse(BaseModel):
    id: str
    type: str
    url: str
    thumbnail: str | None = None
    name: str
    size: int = 0
    duration: int | None = None
    width: int | None = None
    height: int | None = None
    eventDate: str | None = Field(None, alias="event_date")
    year: str | None = None
    category: str | None = None
    publicationId: str | None = Field(None, alias="publication_id")

    model_config = {"populate_by_name": True}


class CommentResponse(BaseModel):
    id: str
    authorId: str = Field(..., alias="author_id")
    text: str
    createdAt: str = Field(..., alias="created_at")
    likes: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class PublicationResponse(BaseModel):
    id: str
    type: str
    authorId: str = Field(..., alias="author_id")
    coAuthorIds: list[str] = Field(default_factory=list, alias="co_author_ids")
    title: str | None = None
    text: str = ""
    eventDate: str = Field(..., alias="event_date")
    eventDateApproximate: bool = Field(False, alias="event_date_approximate")
    place: str | None = None
    publishDate: str = Field(..., alias="publish_date")
    media: list[MediaItemResponse] = Field(default_factory=list)
    participantIds: list[str] = Field(default_factory=list, alias="participant_ids")
    topicTag: str = Field("", alias="topic_tag")
    likes: list[str] = Field(default_factory=list)
    comments: list[CommentResponse] = Field(default_factory=list)
    isRead: bool = Field(False, alias="is_read")
    visibleFor: list[str] | None = Field(None, alias="visible_for")
    excludeFor: list[str] | None = Field(None, alias="exclude_for")
    contentBlocks: list[dict] | None = Field(None, alias="content_blocks")

    model_config = {"populate_by_name": True}


class FeedListParams(BaseModel):
    limit: int | None = None
    offset: int | None = None
    author_id: str | None = None
    topic_tag: str | None = None


class PublicationCreate(BaseModel):
    type: str
    title: str | None = None
    text: str = ""
    event_date: str
    event_date_approximate: bool = False
    place: str | None = None
    topic_tag: str = ""
    co_author_ids: list[str] = Field(default_factory=list)
    participant_ids: list[str] = Field(default_factory=list)
    visible_for: list[str] | None = None
    exclude_for: list[str] | None = None
    media_keys: list[str] = Field(default_factory=list, description="S3 keys from presign")
    content_blocks: list[dict] | None = None


class PublicationUpdate(BaseModel):
    title: str | None = None
    text: str | None = None
    event_date: str | None = None
    event_date_approximate: bool | None = None
    place: str | None = None
    topic_tag: str | None = None
    co_author_ids: list[str] | None = None
    participant_ids: list[str] | None = None
    visible_for: list[str] | None = None
    exclude_for: list[str] | None = None
    add_media_keys: list[str] | None = Field(None, description="S3 keys from presign to attach")
    remove_media_ids: list[str] | None = Field(None, description="Media item ids to detach/delete from publication")


class CommentCreate(BaseModel):
    text: str
