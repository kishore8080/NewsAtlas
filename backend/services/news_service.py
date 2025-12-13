import json
import os
import tomllib
import requests
import pytz
from datetime import datetime
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

    def get_gcs_path(self, date_str: Optional[str] = None) -> str:
        """
        Generates GCS path: news-data/Month-Year/dd-mm-yyyy.json
        date_str format: dd-mm-yyyy
        """
        if not date_str:
            now = datetime.now(IST)
            date_str = now.strftime("%d-%m-%Y")
        
        try:
            dt = datetime.strptime(date_str, "%d-%m-%Y")
            month_year = dt.strftime("%B-%Y") # e.g., January-2025
            return f"news-data/{month_year}/{date_str}.json"
        except ValueError:
            # Fallback for invalid date format
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
            if isinstance(parsed, dict):
                if "news" in parsed:
                    return parsed["news"]
                elif "items" in parsed:
                    return parsed["items"]
                else:
                    return [parsed]
            elif isinstance(parsed, list):
                return parsed
            else:
                return []
        except Exception as e:
            print(f"Error processing with AI: {e}")
            return []

    def refresh_daily_news(self):
        """
        Fetches new news, deduplicates against today's existing news,
        processes new items with AI, merges, sorts, and saves.
        """
        print("Starting daily news refresh...")
        
        # 1. Fetch RSS
        raw_news = self.fetch_rss_feeds()
        print(f"Fetched {len(raw_news)} raw items.")
        
        # 2. Load today's existing news
        today_str = datetime.now(IST).strftime("%d-%m-%Y")
        existing_news = self.load_news(date=today_str)
        existing_titles = {item.get('title') for item in existing_news if item.get('title')}
        print(f"Loaded {len(existing_news)} existing items for {today_str}.")
        
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
            
        # 5. Merge
        full_list = existing_news + processed_news
        
        # 6. Sort by Importance (High > Medium > Low)
        importance_map = {"High": 3, "Medium": 2, "Low": 1}
        full_list.sort(key=lambda x: importance_map.get(x.get("importance", "Low"), 0), reverse=True)
        
        # 7. Save
        self.save_news(full_list, date=today_str)
        print(f"Saved {len(full_list)} items to {today_str}.")

    def save_news(self, news_data: List[Dict[str, Any]], date: Optional[str] = None):
        gcs_path = self.get_gcs_path(date)
        
        # 1. Save to GCS
        if self.bucket:
            try:
                blob = self.bucket.blob(gcs_path)
                blob.upload_from_string(json.dumps(news_data), content_type="application/json")
                print(f"Uploaded news to GCS: {gcs_path}")
            except Exception as e:
                print(f"Error uploading to GCS: {e}")

    def load_news(self, date: Optional[str] = None) -> List[Dict[str, Any]]:
        gcs_path = self.get_gcs_path(date)
        
        # 1. Try GCS
        if self.bucket:
            try:
                blob = self.bucket.blob(gcs_path)
                data = blob.download_as_text()
                parsed = json.loads(data)
                if isinstance(parsed, dict):
                    return parsed.get("news", [parsed])
                return parsed if isinstance(parsed, list) else []
            except NotFound:
                print(f"News file not found in GCS: {gcs_path}")
            except Exception as e:
                print(f"Error reading from GCS: {e}")
        
        return []
