from pydantic import BaseModel, Field


class SendCodeRequest(BaseModel):
    identifier: str = Field(..., description="Phone or email")


class SendCodeResponse(BaseModel):
    sent: bool = True


class VerifyRequest(BaseModel):
    identifier: str = Field(..., description="Phone or email")
    code: str = Field(..., description="OTP code")


class SubscriptionResponse(BaseModel):
    plan_id: str = "free"
    used_places: int = 0
    expires_at: str = ""

    def to_camel(self) -> dict:
        return {
            "planId": self.plan_id,
            "usedPlaces": self.used_places,
            "expiresAt": self.expires_at,
        }


class FamilyMemberInUser(BaseModel):
    id: str
    first_name: str
    last_name: str
    middle_name: str | None = None
    nickname: str | None = None
    birth_date: str
    death_date: str | None = None
    city: str | None = None
    about: str | None = None
    avatar: str | None = None
    role: str = "member"
    is_active: bool = True
    generation: int = 0
    relations: list[dict] = Field(default_factory=list)

    def to_camel(self) -> dict:
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "middleName": self.middle_name,
            "nickname": self.nickname,
            "birthDate": self.birth_date,
            "deathDate": self.death_date,
            "city": self.city,
            "about": self.about,
            "avatar": self.avatar,
            "role": self.role,
            "isActive": self.is_active,
            "generation": self.generation,
            "relations": self.relations,
        }


class AppUser(BaseModel):
    id: str
    member: FamilyMemberInUser
    subscription: SubscriptionResponse

    def to_camel(self) -> dict:
        return {
            "id": self.id,
            "member": self.member.to_camel(),
            "subscription": self.subscription.to_camel(),
        }
