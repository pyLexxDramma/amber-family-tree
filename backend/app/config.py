from functools import lru_cache

from pydantic import AnyUrl, BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = Field("local", alias="APP_ENV")
    app_debug: bool = Field(True, alias="APP_DEBUG")
    app_host: str = Field("0.0.0.0", alias="APP_HOST")
    app_port: int = Field(8000, alias="APP_PORT")

    database_url: str = Field(..., alias="DATABASE_URL")

    jwt_secret: str = Field(..., alias="JWT_SECRET")
    jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(60 * 24 * 7, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")

    s3_endpoint_url: str = Field(..., alias="S3_ENDPOINT_URL")
    s3_public_endpoint_url: str | None = Field(None, alias="S3_PUBLIC_ENDPOINT_URL")
    s3_access_key: str = Field(..., alias="S3_ACCESS_KEY")
    s3_secret_key: str = Field(..., alias="S3_SECRET_KEY")
    s3_region: str = Field("us-east-1", alias="S3_REGION")
    s3_bucket: str = Field(..., alias="S3_BUCKET")

    max_photo_mb: int = Field(20, alias="MAX_PHOTO_MB")
    max_video_mb: int = Field(500, alias="MAX_VIDEO_MB")
    max_audio_mb: int = Field(100, alias="MAX_AUDIO_MB")
    max_document_mb: int = Field(100, alias="MAX_DOCUMENT_MB")

    otp_expiry_seconds: int = Field(600, alias="OTP_EXPIRY_SECONDS")
    otp_debug_log_code: bool = Field(False, alias="OTP_DEBUG_LOG_CODE")
    frontend_url: str = Field("https://angelo-test.ru", alias="FRONTEND_URL")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


class HealthResponse(BaseModel):
    status: str

