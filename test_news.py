import os
import sys
from dotenv import load_dotenv

# Add backend to path so we can import services
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

# Load env vars from .env.local if present
load_dotenv(".env.local")

from services.news_service import NewsService

def test_news():
    print("Initializing NewsService (Supabase)...")
    service = NewsService()
    
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not found in environment.")
        return

    print("\nTesting refresh_daily_news() with Supabase...")
    try:
        service.refresh_daily_news()
        print("\nRefresh cycle completed. Check Supabase dashboard for new rows.")
    except Exception as e:
        print(f"\nError during refresh: {e}")
        import traceback
        traceback.print_exc()

    print("\nTesting load_news()...")
    try:
        news = service.load_news()
        print(f"Loaded {len(news)} items from Supabase.")
        if news:
            print(f"Sample: {news[0]['title']}")
    except Exception as e:
        print(f"Error loading news: {e}")

if __name__ == "__main__":
    test_news()
