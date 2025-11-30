from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json
import os

router = APIRouter()

# Pydantic models
class QuizOption(BaseModel):
    id: str
    text: str

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[QuizOption]
    correct_answer: str
    explanation: str
    category: str
    difficulty: str  # "easy", "medium", "hard"

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    total: int
    date: str

class SubmitAnswerRequest(BaseModel):
    question_id: str
    selected_answer: str

class SubmitAnswerResponse(BaseModel):
    correct: bool
    correct_answer: str
    explanation: str

# Load quiz data
def load_quiz_data():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "quiz.json")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@router.get("/quiz/daily", response_model=QuizResponse)
async def get_daily_quiz(limit: Optional[int] = 5):
    """
    Get daily quiz questions.
    
    - **limit**: Number of questions to return (default: 5)
    """
    quiz_data = load_quiz_data()
    
    # Limit results
    questions = quiz_data[:limit]
    
    return {
        "questions": questions,
        "total": len(questions),
        "date": datetime.now().strftime("%Y-%m-%d")
    }

@router.post("/quiz/submit", response_model=SubmitAnswerResponse)
async def submit_answer(request: SubmitAnswerRequest):
    """
    Submit an answer for a quiz question and get feedback.
    """
    quiz_data = load_quiz_data()
    
    # Find the question
    for question in quiz_data:
        if question.get("id") == request.question_id:
            correct_answer = question.get("correct_answer")
            is_correct = request.selected_answer == correct_answer
            
            return {
                "correct": is_correct,
                "correct_answer": correct_answer,
                "explanation": question.get("explanation", "")
            }
    
    raise HTTPException(status_code=404, detail="Question not found")
