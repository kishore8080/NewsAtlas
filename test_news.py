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
    
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not found in environment.")
        return

    print("Fetching RSS feeds...")
    raw_news = service.fetch_rss_feeds()
    print(f"Fetched {len(raw_news)} raw items.")
    
    if not raw_news:
        print("No news fetched. Check internet connection or feed URLs.")
        return

    print("Processing with OpenAI (this may take a few seconds)...")
    processed_news = service.process_news_with_ai(raw_news[:3]) # Limit to 3 for test
    
    print("\nProcessed News:")
    import json
    print(json.dumps(processed_news, indent=2))

if __name__ == "__main__":
    test_news()
