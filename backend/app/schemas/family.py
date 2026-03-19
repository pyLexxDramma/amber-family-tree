from pydantic import BaseModel, Field


class FamilyMemberCreate(BaseModel):
    first_name: str
    last_name: str
    middle_name: str | None = None
    birth_date: str
    death_date: str | None = None
    city: str | None = None
    about: str | None = None


class FamilyMemberUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    middle_name: str | None = None
    birth_date: str | None = None
    death_date: str | None = None
    city: str | None = None
    about: str | None = None
    avatar: str | None = None


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
    managedById: str | None = Field(None, alias="managed_by_id")

    model_config = {"populate_by_name": True}
