from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import auth, family, feed, media, profile
from app.config import get_settings
from app.database import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Family Media API",
    description="Minimal backend for family media sharing",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(auth.router, prefix="/api")
app.include_router(auth.router)
app.include_router(family.router, prefix="/api")
app.include_router(feed.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(profile.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
