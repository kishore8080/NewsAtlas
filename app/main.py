from fastapi import FastAPI
import subprocess, json, os, sys
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI() 

FRONTEND_EXTERNAL = "http://35.192.3.34"  
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_EXTERNAL,      # External browser frontend
        "http://frontend-service"  # Kubernetes internal DNS],  
    ],           
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

@app.get("/quiz/daily")
def get_daily_quiz():
    quiz = getquiz()
    return {"quiz": quiz}
