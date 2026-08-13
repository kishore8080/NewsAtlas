from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from services.news_service import NewsService

router = APIRouter()
news_service = NewsService()

# Pydantic models
class NewsItem(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    date: Optional[str] = None
    datetime: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    relevance: Optional[List[str]] = None
    key_points: Optional[List[str]] = None
    importance: Optional[str] = None
    priority: Optional[int] = None

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
    if limit and limit > 0:
        news_data = news_data[:limit]
    
    return {
        "news": news_data,
        "total": len(news_data)
    }

@router.post("/news/refresh")
@router.get("/news/refresh")
async def refresh_news(
    background_tasks: BackgroundTasks,
    sync: bool = Query(False, description="Set to true for synchronous execution (recommended for Cloud Scheduler)")
) -> Dict[str, Any]:
    """
    Trigger news refresh from RSS feeds, process with AI, and load data to Supabase.
    Can be triggered synchronously (sync=true) by Cloud Scheduler or asynchronously in background.
    """
    if sync:
        try:
            print("Synchronous news refresh started via API endpoint")
            result = news_service.refresh_daily_news()
            return result
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Failed to refresh news: {str(e)}")
    else:
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
        return {
            "status": "pending",
            "message": "News refresh started in background"
        }

@router.get("/news/{news_id}", response_model=NewsItem)
async def get_news_by_id(news_id: str):
    """
    Get a specific news item by ID.
    """
    news_data = news_service.load_news()
    
    for item in news_data:
        if str(item.get("id")) == str(news_id):
            return item
    
    raise HTTPException(status_code=404, detail="News item not found")

