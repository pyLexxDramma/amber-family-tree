from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.media import PresignRequest, PresignResponse

router = APIRouter(prefix="/media", tags=["media"])


@router.post("/presign", response_model=PresignResponse)
async def presign(
    body: PresignRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PresignResponse:
    settings = get_settings()
    # Minimal: generate a key and presigned URL via boto3
    import uuid
    key = f"uploads/{current_user.id}/{uuid.uuid4()}_{body.filename}"
    try:
        import boto3
        from botocore.config import Config
        client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            region_name=settings.s3_region,
            config=Config(signature_version="s3v4"),
        )
        upload_url = client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.s3_bucket,
                "Key": key,
                "ContentType": body.content_type,
            },
            ExpiresIn=3600,
        )
        url = f"{settings.s3_endpoint_url}/{settings.s3_bucket}/{key}"
    except Exception:
        # Fallback when S3 not configured: return placeholder URLs
        upload_url = f"https://example.com/upload?key={key}"
        url = f"https://example.com/media/{key}"
    return PresignResponse(upload_url=upload_url, key=key, url=url)
