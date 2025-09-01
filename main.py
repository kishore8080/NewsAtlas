# main.py
from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from openai import OpenAI
from typing import List, Dict
import json

app = FastAPI()
templates = Jinja2Templates(directory="templates")

client = OpenAI(api_key="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") # Replace with your OpenAI key

def generate_mcqs(articles: str, num_questions: int = 15) -> List[Dict]:
    """
    Generate MCQs using GPT model based on provided news articles.
    """
    prompt = f"""
    Read the following news articles and generate {num_questions} multiple-choice questions.
    Each question must include:
    - question: The question text
    - options: Four options (A, B, C, D)
    - correct_answer: Only the correct option letter (A/B/C/D)

    Articles:
    {articles}

    Return the result strictly as a JSON array.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",  # Use "gpt-4o" for better accuracy
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )

    # Parse JSON output safely
    try:
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        return [{"error": "Failed to parse model output."}]

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/generate", response_class=HTMLResponse)
async def generate_quiz(request: Request, articles: str = Form(...)):
    mcqs = generate_mcqs(articles)
    return templates.TemplateResponse("quiz.html", {"request": request, "mcqs": mcqs})
