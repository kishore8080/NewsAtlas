import os
import sys
from dotenv import load_dotenv

# Add backend to path so we can import services
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

# Load env vars from .env.local if present
load_dotenv(".env.local")

from services.news_service import NewsService

def test_news():
    print("Initializing NewsService...")
    service = NewsService()
    
    # Test Path Generation
    print(f"GCS Path for today: {service.get_gcs_path()}")
    print(f"GCS Path for 01-01-2025: {service.get_gcs_path('01-01-2025')}")

    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not found in environment.")
        return

    print("\nTesting refresh_daily_news()...")
    try:
        service.refresh_daily_news()
        print("\nRefresh cycle completed (check logs for GCS errors/success).")
    except Exception as e:
        print(f"\nError during refresh: {e}")

if __name__ == "__main__":
    test_news()
