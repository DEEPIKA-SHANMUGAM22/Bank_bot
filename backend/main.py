from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import health
from config import APP_NAME, DEBUG
from utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    logger.info(f"Starting {APP_NAME}...")
    # Pre-initialize singletons
    from embeddings.embedding_service import EmbeddingService
    from vectorstore.chroma_store import ChromaStore
    from llm.gemini_provider import GeminiProvider

    EmbeddingService.get_instance()
    ChromaStore.get_instance()
    GeminiProvider.get_instance()
    logger.info(f"{APP_NAME} ready!")
    yield
    logger.info(f"{APP_NAME} shutting down.")


app = FastAPI(
    title=APP_NAME,
    description="RAG-powered Banking FAQ Assistant",
    version="1.0.0",
    debug=DEBUG,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from routers import admin, chat as chat_router
from api.routes import health

app.include_router(admin.router)
app.include_router(chat_router.router)
app.include_router(health.router, tags=["Health"])



@app.get("/")
async def root():
    return {"message": f"Welcome to {APP_NAME} API", "docs": "/docs"}
