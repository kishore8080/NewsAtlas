from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel
import json, os, sys

# Import services using relative imports for Vercel
from .services.news_service import NewsService
from .services.mindmap_service import MindMapService

# Create FastAPI app
app = FastAPI(
    title="EazyPrepAI API",
    description="Backend API for EazyPrepAI - AI-Powered UPSC Preparation Platform",
    version="1.0.0"
)

# CORS Configuration - Allow your Vercel frontend
ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "")

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Add custom origins from environment (for production Vercel domain)
if ALLOWED_ORIGINS_ENV:
    origins.extend([origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",")])

origins = list(set(filter(None, origins)))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
news_service = NewsService()
mindmap_service = MindMapService()

# Pydantic models
class MindMapRequest(BaseModel):
    text: str

# Routes
@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "EazyPrepAI API",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/news")
def get_news():
    """Fetch aggregated news from trusted sources"""
    return {"news": news_service.fetch_all_news()}

@app.post("/mindmap/generate")
async def generate_mindmap(request: MindMapRequest):
    """Generate a mind map from text"""
    result = await mindmap_service.generate_mindmap(request.text)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@app.get("/quiz/daily")
def get_daily_quiz():
    """Get daily quiz questions - placeholder for now"""
    # TODO: Implement quiz logic or read from static file
    return {
        "quiz": [],
        "message": "Quiz endpoint - to be implemented"
    }

# Vercel serverless handler
handler = Mangum(app, lifespan="off")
