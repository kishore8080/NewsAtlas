from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import news, quiz
import os
from dotenv import load_dotenv
import tomllib

load_dotenv()

app = FastAPI(
    title="EazyPrepAI Backend",
    description="Backend API for UPSC preparation platform",
    version="1.0.0"
)

# Load configuration
with open(os.path.join(os.path.dirname(__file__), "config.toml"), "rb") as f:
    config = tomllib.load(f)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
allow_origin_regex = config.get("cors", {}).get("allow_origin_regex")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(news.router, prefix="/api", tags=["news"])
app.include_router(quiz.router, prefix="/api", tags=["quiz"])

@app.get("/")
async def root():
    return {
        "message": "EazyPrepAI Backend API",
        "status": "running",
        "version": "1.0.6"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}