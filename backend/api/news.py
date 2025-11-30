from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json
import os

router = APIRouter()

# Pydantic models
class NewsItem(BaseModel):
    id: str
    title: str
    description: str
    content: str
    category: str
    date: str
    source: str
    relevance: List[str]  # UPSC topics like "Polity", "Economy", etc.

class NewsResponse(BaseModel):
    news: List[NewsItem]
    total: int

# Load news data
def load_news_data():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "news.json")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@router.get("/news", response_model=NewsResponse)
async def get_all_news(
    category: Optional[str] = None,
    limit: Optional[int] = 10
):
    """
    Get all current affairs news.
    
    - **category**: Filter by category (optional)
    - **limit**: Number of items to return (default: 10)
    """
    news_data = load_news_data()
    
    # Filter by category if provided
    if category:
        news_data = [item for item in news_data if item.get("category") == category]
    
    # Limit results
    news_data = news_data[:limit]
    
    return {
        "news": news_data,
        "total": len(news_data)
    }

@router.get("/news/{news_id}", response_model=NewsItem)
async def get_news_by_id(news_id: str):
    """
    Get a specific news item by ID.
    """
    news_data = load_news_data()
    
    for item in news_data:
        if item.get("id") == news_id:
            return item
    
    raise HTTPException(status_code=404, detail="News item not found")
