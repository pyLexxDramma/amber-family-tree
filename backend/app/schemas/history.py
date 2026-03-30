from pydantic import BaseModel, Field


class EventMediaResponse(BaseModel):
    id: str
    type: str
    url: str
    thumbnail: str | None = None
    name: str


class EventResponse(BaseModel):
    id: str
    title: str
    eventDate: str = Field(..., alias="event_date")
    eventDateApproximate: bool = Field(False, alias="event_date_approximate")
    familyId: str = Field(..., alias="family_id")
    sourcePublicationId: str = Field(..., alias="source_publication_id")
    participantIds: list[str] = Field(default_factory=list, alias="participant_ids")
    media: list[EventMediaResponse] = Field(default_factory=list)
    text: str = ""

    model_config = {"populate_by_name": True}


class EventListResponse(BaseModel):
    items: list[EventResponse] = Field(default_factory=list)


class EventFromPublicationCreate(BaseModel):
    publicationId: str = Field(..., alias="publication_id")

    model_config = {"populate_by_name": True}
