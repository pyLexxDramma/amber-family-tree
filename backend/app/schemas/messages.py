from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    text: str


class MessageResponse(BaseModel):
    id: str
    senderId: str = Field(..., alias="sender_id")
    recipientId: str = Field(..., alias="recipient_id")
    text: str
    createdAt: str = Field(..., alias="created_at")

    model_config = {"populate_by_name": True}

