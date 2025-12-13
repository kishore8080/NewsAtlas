import json
import os
import tomllib
import requests
import pytz
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from openai import OpenAI
from google.cloud import storage
from google.cloud.exceptions import NotFound

# Load configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config.toml")
with open(CONFIG_PATH, "rb") as f:
    config = tomllib.load(f)

BUCKET_NAME = config.get("storage", {}).get("bucket_name", "eazyprep-data")
RSS_FEEDS = [
    "https://www.thehindu.com/news/national/feeder/default.rss",
    "https://www.thehindu.com/news/international/feeder/default.rss",
    "https://indianexpress.com/section/india/feed/",
]
IST = pytz.timezone('Asia/Kolkata')

class NewsService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self.client = OpenAI(api_key=api_key)
        else:
            print("Warning: OPENAI_API_KEY not found. AI features will be disabled.")
            self.client = None

        try:
            self.storage_client = storage.Client()
            self.bucket = self.storage_client.bucket(BUCKET_NAME)
        except Exception as e:
            print(f"Warning: GCS initialization failed: {e}")
            self.bucket = None

    def get_current_slot(self) -> int:
        """
        Calculates the current 3-hour slot (1-8) based on IST time.
        Starts at 02:00 AM.
        Slot 1: 02:00 - 04:59
        Slot 2: 05:00 - 07:59
        ...
        """
        now = datetime.now(IST)
        hour = now.hour
        
        # If before 2 AM, it technically belongs to the previous day's last slot cycle,
        # but for simplicity in this "daily" context, we can treat 00:00-01:59 as late night updates 
        # or map them to Slot 8 of the *previous* day. 
        # However, the user requirement says "from 2AM". 
        # Let's map 00:00-01:59 to Slot 8 of the *current* day (effectively late night coverage) 
        # OR strictly follow the 2AM start.
        # Formula: (Hour - 2) // 3 + 1
        
        if hour < 2:
            # 00:00 to 01:59 -> treat as part of previous day's cycle or just Slot 1?
            # Let's assume it's Slot 1 of the new day for simplicity if we want to capture it,
            # OR better, if the scheduler runs at 2AM, that's Slot 1.
            return 1
            
        slot = ((hour - 2) // 3) + 1
        return max(1, min(8, slot))

    def get_gcs_path(self, date_str: Optional[str] = None, slot: Optional[int] = None) -> str:
        """
        Generates GCS path: news-data/Month-Year/dd-mm-yyyy-data-{slot}.json
        If slot is None, it returns the base path prefix (without slot).
        """
        if not date_str:
            now = datetime.now(IST)
            date_str = now.strftime("%d-%m-%Y")
        
        try:
            dt = datetime.strptime(date_str, "%d-%m-%Y")
            month_year = dt.strftime("%B-%Y") # e.g., January-2025
            
            if slot is not None:
                return f"news-data/{month_year}/{date_str}-data-{slot:02d}.json"
            else:
                # Used for listing/searching
                return f"news-data/{month_year}/{date_str}-data-"
        except ValueError:
            return f"news-data/misc/{date_str}.json"

    def fetch_rss_feeds(self) -> List[Dict[str, Any]]:
        raw_news = []
        for feed_url in RSS_FEEDS:
            try:
                response = requests.get(feed_url, timeout=10)
                soup = BeautifulSoup(response.content, "html.parser")
                items = soup.find_all("item")
                
                for item in items[:5]:  # Limit to 5 per feed
                    title = item.title.text if item.title else ""
                    link = item.link.text if item.link else ""
                    description = item.description.text if item.description else ""
                    pub_date = item.pubDate.text if item.pubDate else str(datetime.now(IST))
                    
                    raw_news.append({
                        "title": title,
                        "link": link,
                        "description": self._clean_html(description),
                        "published": pub_date
                    })
            except Exception as e:
                print(f"Error fetching feed {feed_url}: {e}")
        return raw_news

    def _clean_html(self, html_content: str) -> str:
        soup = BeautifulSoup(html_content, "html.parser")
        return soup.get_text()

    def process_news_with_ai(self, raw_news: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not raw_news:
            return []

        if not self.client:
            print("Error: OpenAI client not initialized.")
            return []

        prompt = f"""
        You are an expert UPSC exam content curator.
        Process the following raw news items and select the most relevant ones for UPSC Civil Services preparation.
        
        Raw News:
        {json.dumps(raw_news)}

        Output Format:
        Return a JSON array of objects with this exact schema:
        [
            {{
                "id": "unique-id-string",
                "title": "Concise Title",
                "description": "One line summary",
                "content": "Detailed paragraph explaining the news and its UPSC relevance (approx 50-80 words).",
                "category": "One of: Polity, Economy, Environment, Science & Technology, International Relations, History, Geography, Social Issues",
                "date": "YYYY-MM-DD",
                "source": "Source Name",
                "relevance": ["Tag1", "Tag2", "Tag3"],
                "key_points": ["Point 1", "Point 2", "Point 3"],
                "importance": "High" | "Medium" | "Low"
            }}
        ]
        
        Guidelines:
        - "key_points": Extract 3-4 bullet points suitable for notes.
        - "importance": Assign based on UPSC relevance. High = Critical for exam.
        - Ensure content is educational and neutral.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": "You are a helpful assistant that outputs JSON."},
                          {"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            parsed = json.loads(content)
            
            # Handle various AI response structures
            if isinstance(parsed, dict):
                for key in ["news", "items", "news_articles", "result", "articles", "response"]:
                    if key in parsed and isinstance(parsed[key], list):
                        return parsed[key]
                if "title" in parsed:
                    return [parsed]
                return []
            elif isinstance(parsed, list):
                return parsed
            else:
                return []
        except Exception as e:
            print(f"Error processing with AI: {e}")
            return []

    def _validate_and_clean_news(self, news_list: List[Any]) -> List[Dict[str, Any]]:
        cleaned = []
        for item in news_list:
            if isinstance(item, dict):
                found_nested = False
                for key in ["news", "items", "news_articles", "result", "articles"]:
                    if key in item and isinstance(item[key], list):
                        cleaned.extend(self._validate_and_clean_news(item[key]))
                        found_nested = True
                        break
                
                if not found_nested:
                    if item.get("title") and item.get("description"):
                        cleaned.append(item)
            elif isinstance(item, list):
                cleaned.extend(self._validate_and_clean_news(item))
        return cleaned

    def refresh_daily_news(self):
        """
        Fetches new news, deduplicates against ALL previous slots of today,
        processes new items, assigns sequential IDs, and saves to CURRENT slot.
        """
        print("Starting slotted news refresh...")
        
        today_str = datetime.now(IST).strftime("%d-%m-%Y")
        current_slot = self.get_current_slot()
        print(f"Current Slot: {current_slot} for {today_str}")

        # 1. Load ALL news from previous slots (1 to current_slot-1)
        #    Also load current slot if it exists (to overwrite/update it)
        all_existing_news = []
        for slot in range(1, 9): # Check all possible slots
            slot_news = self.load_news_from_slot(today_str, slot)
            all_existing_news.extend(slot_news)
        
        # Clean existing news
        all_existing_news = self._validate_and_clean_news(all_existing_news)
        existing_titles = {item.get('title') for item in all_existing_news if item.get('title')}
        
        # Calculate next ID start
        # Assuming IDs are purely numeric or we just count items.
        # User requested range: Slot 1 (1-5), Slot 2 (6-10).
        # So we just need the total count of items *before* this batch.
        # BUT, we are overwriting the current slot. So we should count items from slots 1 to current_slot-1.
        
        previous_slots_count = 0
        for slot in range(1, current_slot):
            slot_news = self.load_news_from_slot(today_str, slot)
            previous_slots_count += len(self._validate_and_clean_news(slot_news))
            
        print(f"Items in previous slots: {previous_slots_count}")

        # 2. Fetch RSS
        raw_news = self.fetch_rss_feeds()
        print(f"Fetched {len(raw_news)} raw items.")
        
        # 3. Filter duplicates
        new_raw_items = [item for item in raw_news if item['title'] not in existing_titles]
        print(f"Found {len(new_raw_items)} new items to process.")
        
        if not new_raw_items:
            print("No new news to process.")
            return

        # 4. Process with AI
        processed_news = self.process_news_with_ai(new_raw_items)
        if not processed_news:
            print("AI processing returned no data.")
            return
            
        processed_news = self._validate_and_clean_news(processed_news)

        # 5. Assign Sequential IDs
        # Start ID = previous_slots_count + 1
        for i, item in enumerate(processed_news):
            item['id'] = str(previous_slots_count + i + 1)

        # 6. Sort by Importance (High > Medium > Low)
        importance_map = {"High": 3, "Medium": 2, "Low": 1}
        processed_news.sort(key=lambda x: importance_map.get(x.get("importance", "Low"), 0), reverse=True)
        
        # 7. Save to CURRENT slot (Overwriting if exists)
        self.save_news_to_slot(processed_news, today_str, current_slot)
        print(f"Saved {len(processed_news)} items to {today_str} Slot {current_slot}.")

    def save_news_to_slot(self, news_data: List[Dict[str, Any]], date_str: str, slot: int):
        gcs_path = self.get_gcs_path(date_str, slot)
        
        if self.bucket:
            try:
                blob = self.bucket.blob(gcs_path)
                blob.upload_from_string(json.dumps(news_data), content_type="application/json")
                print(f"Uploaded news to GCS: {gcs_path}")
            except Exception as e:
                print(f"Error uploading to GCS: {e}")

    def load_news_from_slot(self, date_str: str, slot: int) -> List[Dict[str, Any]]:
        gcs_path = self.get_gcs_path(date_str, slot)
        if self.bucket:
            try:
                blob = self.bucket.blob(gcs_path)
                data = blob.download_as_text()
                parsed = json.loads(data)
                if isinstance(parsed, dict):
                    return parsed.get("news", [parsed])
                return parsed if isinstance(parsed, list) else []
            except NotFound:
                return []
            except Exception as e:
                print(f"Error reading slot {slot}: {e}")
                return []
        return []

    def load_news(self, date: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Aggregates news from ALL slots for the given date.
        """
        if not date:
            now = datetime.now(IST)
            date = now.strftime("%d-%m-%Y")
            
        all_news = []
        # Try loading slots 1 to 8
        for slot in range(1, 9):
            slot_news = self.load_news_from_slot(date, slot)
            all_news.extend(self._validate_and_clean_news(slot_news))
            
        return all_news
