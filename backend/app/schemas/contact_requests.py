from pydantic import BaseModel, Field


class ContactRequestState(BaseModel):
    status: str
    requestId: str | None = Field(default=None, alias="request_id")
    direction: str

    model_config = {"populate_by_name": True}


class ContactRequestItem(BaseModel):
    id: str
    fromMemberId: str = Field(..., alias="from_member_id")
    toMemberId: str = Field(..., alias="to_member_id")
    status: str
    createdAt: str = Field(..., alias="created_at")

    model_config = {"populate_by_name": True}

