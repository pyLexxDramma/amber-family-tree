from app.config import get_settings


def public_s3_object_url(raw: str) -> str:
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw
    if raw.startswith("/"):
        return raw
    settings = get_settings()
    base = (settings.s3_public_endpoint_url or settings.s3_endpoint_url).rstrip("/")
    return f"{base}/{settings.s3_bucket}/{raw}"


def resolve_public_media_url(raw: str | None) -> str | None:
    if raw is None:
        return None
    s = raw.strip()
    if not s:
        return None
    return public_s3_object_url(s)
