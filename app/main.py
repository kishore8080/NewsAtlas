from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess, json, os, sys

app = FastAPI(
    title="EazyPrepAI API",
    description="Backend API for EazyPrepAI - AI-Powered UPSC Preparation Platform",
    version="1.0.0"
)

# CORS Configuration - supports localhost, Vercel, and custom origins
# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "")

# Build origins list
origins = [
    "http://localhost:3000",
    "http://localhost:3001"
]

# Add custom origins from environment variable (comma-separated)
if ALLOWED_ORIGINS_ENV:
    origins.extend([origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",")])

# Remove duplicates and filter empty strings
origins = list(set(filter(None, origins)))

# For production, you may want to add your Vercel domain explicitly:
# origins.append("https://your-app.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # /QUIZAI/app
ROOT_DIR = os.path.dirname(BASE_DIR)                  # /QUIZAI
OUTPUT_DIR = os.path.join(ROOT_DIR, "json-output-files")

def getquiz():
    """Run the full pipeline inside venv Python"""
    python_exec = sys.executable   # points to venv/bin/python or venv/Scripts/python.exe
    
    #subprocess.run([python_exec, os.path.join(BASE_DIR, "FetchAPI.py")], check=True)
    #subprocess.run([python_exec, os.path.join(BASE_DIR, "MCQGen.py")], check=True)
    #subprocess.run([python_exec, os.path.join(BASE_DIR, "UPSCMCQGen.py")], check=True)

    # Load final JSON
    json_path = os.path.join(OUTPUT_DIR, "upsc_mcqs.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "Quiz JSON not found"}

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

@app.get("/quiz/daily")
def get_daily_quiz():
    """Get daily quiz questions"""
    quiz = getquiz()
    if "error" in quiz:
        raise HTTPException(status_code=404, detail=quiz["error"])
    return {"quiz": quiz}
