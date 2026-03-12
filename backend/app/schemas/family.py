from pydantic import BaseModel, Field


class FamilyMemberResponse(BaseModel):
    id: str
    firstName: str = Field(..., alias="first_name")
    lastName: str = Field(..., alias="last_name")
    middleName: str | None = Field(None, alias="middle_name")
    nickname: str | None = None
    birthDate: str = Field(..., alias="birth_date")
    deathDate: str | None = Field(None, alias="death_date")
    city: str | None = None
    about: str | None = None
    avatar: str | None = None
    role: str = "member"
    isActive: bool = Field(True, alias="is_active")
    generation: int = 0
    relations: list[dict] = Field(default_factory=list)

    model_config = {"populate_by_name": True}
