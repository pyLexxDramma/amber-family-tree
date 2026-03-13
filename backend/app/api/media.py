from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.media import PresignRequest, PresignResponse

router = APIRouter(prefix="/media", tags=["media"])


def _max_bytes_for_content_type(settings) -> dict:
    return {
        "image": settings.max_photo_mb * 1_000_000,
        "video": settings.max_video_mb * 1_000_000,
        "audio": settings.max_audio_mb * 1_000_000,
    }


@router.post("/presign", response_model=PresignResponse)
async def presign(
    body: PresignRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PresignResponse:
    settings = get_settings()
    if body.file_size_bytes is not None:
        limits = _max_bytes_for_content_type(settings)
        ct = (body.content_type or "").lower()
        max_bytes = limits.get(ct.split("/")[0], settings.max_document_mb * 1_000_000)
        if body.file_size_bytes > max_bytes:
            raise HTTPException(400, f"File too large (max {max_bytes // 1_000_000} MB for this type)")
    import uuid
    key = f"uploads/{current_user.id}/{uuid.uuid4()}_{body.filename}"
    try:
        import boto3
        from botocore.config import Config

        internal_client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            region_name=settings.s3_region,
            config=Config(signature_version="s3v4"),
        )

        try:
            internal_client.head_bucket(Bucket=settings.s3_bucket)
        except Exception:
            internal_client.create_bucket(Bucket=settings.s3_bucket)

        public_endpoint_url = (settings.s3_public_endpoint_url or settings.s3_endpoint_url).rstrip("/")
        public_client = boto3.client(
            "s3",
            endpoint_url=public_endpoint_url,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            region_name=settings.s3_region,
            config=Config(signature_version="s3v4"),
        )

        upload_url = public_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.s3_bucket,
                "Key": key,
                "ContentType": body.content_type,
            },
            ExpiresIn=3600,
        )
        url = f"{public_endpoint_url}/{settings.s3_bucket}/{key}"
    except Exception:
        upload_url = f"https://example.com/upload?key={key}"
        url = f"https://example.com/media/{key}"
    return PresignResponse(upload_url=upload_url, key=key, url=url)
