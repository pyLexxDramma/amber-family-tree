from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    middle_name: str | None = None
    nickname: str | None = None
    birth_date: str | None = None
    death_date: str | None = None
    city: str | None = None
    about: str | None = None
    avatar: str | None = None
    role: str | None = None
    is_active: bool | None = None
    generation: int | None = None
    relations: list[dict] | None = None
