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
    
    # Test Slot Calculation
    current_slot = service.get_current_slot()
    print(f"Current Slot (IST): {current_slot}")
    
    # Test Path Generation
    print(f"GCS Path for Slot 1: {service.get_gcs_path(slot=1)}")
    print(f"GCS Path for Current Slot: {service.get_gcs_path(slot=current_slot)}")

    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not found in environment.")
        return

    print("\nTesting refresh_daily_news() with slotted storage...")
    try:
        service.refresh_daily_news()
        print("\nRefresh cycle completed. Check logs for 'Uploaded news to GCS: ...-data-XX.json'")
    except Exception as e:
        print(f"\nError during refresh: {e}")

if __name__ == "__main__":
    test_news()
