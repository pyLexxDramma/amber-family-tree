from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, family, feed, media, messages, profile
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(auth.router)
app.include_router(family.router, prefix="/api")
app.include_router(family.router)
app.include_router(feed.router, prefix="/api")
app.include_router(feed.router)
app.include_router(media.router, prefix="/api")
app.include_router(media.router)
app.include_router(profile.router, prefix="/api")
app.include_router(profile.router)
app.include_router(messages.router, prefix="/api")
app.include_router(messages.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
