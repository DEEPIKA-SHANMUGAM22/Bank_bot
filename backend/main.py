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
    
    # Pre-initialize fast singletons
    from vectorstore.chroma_store import ChromaStore
    from llm.gemini_provider import GeminiProvider
    
    ChromaStore.get_instance()
    GeminiProvider.get_instance()
    
    # Pre-initialize heavy sentence-transformers model in a background thread
    # so we don't block Render's port binding check.
    import threading
    def load_embeddings_bg():
        try:
            from embeddings.embedding_service import EmbeddingService
            logger.info("Pre-loading Embedding Service in background...")
            EmbeddingService.get_instance()
            logger.info("Embedding Service loaded successfully in background.")
        except Exception as err:
            logger.error(f"Error loading Embedding Service in background: {err}")
            
    threading.Thread(target=load_embeddings_bg, daemon=True).start()
    
    logger.info(f"{APP_NAME} startup sequence completed.")
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
