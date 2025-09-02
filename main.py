from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from article_fetch_api import fetch_news_articles
from mcq_generator import generate_mcqs
import json
from dotenv import load_dotenv
from openai import OpenAI
import re

load_dotenv()
client = OpenAI()
app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    news_text = fetch_news_articles()
    raw_mcqs = generate_mcqs(news_text)    
    
    # Clean the string to extract JSON only
    json_match = re.search(r"\[.*\]", raw_mcqs, re.DOTALL)
    if not json_match:
        raise ValueError("No valid JSON found in LLM output")
    
    mcqs = json.loads(json_match.group(0))
    
    return templates.TemplateResponse("index.html", {"request": request, "mcqs": mcqs})