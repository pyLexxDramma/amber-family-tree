from pydantic import BaseModel, Field


class PresignRequest(BaseModel):
    filename: str
    content_type: str
    publication_id: str | None = None
    file_size_bytes: int | None = None


class PresignResponse(BaseModel):
    upload_url: str
    key: str
    url: str
