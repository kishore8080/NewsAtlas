from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
from services.news_service import NewsService

router = APIRouter()
news_service = NewsService()

# Pydantic models
class NewsItem(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    source: Optional[str] = None
    relevance: Optional[List[str]] = None
    key_points: Optional[List[str]] = None
    importance: Optional[str] = None

class NewsResponse(BaseModel):
    news: List[NewsItem]
    total: int

@router.get("/news", response_model=NewsResponse)
async def get_all_news(
    category: Optional[str] = None,
    date: Optional[str] = None,
    limit: Optional[int] = 10
):
    """
    Get all current affairs news.
    """
    news_data = news_service.load_news(date=date)
    
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
    news_data = news_service.load_news()
    
    for item in news_data:
        if item.get("id") == news_id:
            return item
    
    raise HTTPException(status_code=404, detail="News item not found")

@router.post("/news/refresh")
async def refresh_news(background_tasks: BackgroundTasks):
    """
    Trigger a background task to fetch new news from RSS feeds,
    process them with AI, and update the cache.
    """
    def _refresh_task():
        try:
            print("Background task started: refresh_daily_news")
            news_service.refresh_daily_news()
            print("Background task completed successfully")
        except Exception as e:
            import traceback
            print(f"CRITICAL ERROR during news refresh: {e}")
            traceback.print_exc()

    background_tasks.add_task(_refresh_task)
    return {"message": "News refresh started in background"}
