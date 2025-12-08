import json
import os
import tomllib
import requests
from datetime import datetime
from typing import List, Dict, Any
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

class NewsService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        try:
            self.storage_client = storage.Client()
            self.bucket = self.storage_client.bucket(BUCKET_NAME)
        except Exception as e:
            print(f"Warning: GCS initialization failed: {e}")
            self.bucket = None

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
                    pub_date = item.pubDate.text if item.pubDate else str(datetime.now())
                    
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

        prompt = f"""
        You are an expert UPSC exam content curator.
        Process the following raw news items and select the top 5 most relevant for UPSC Civil Services preparation.
        
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
                "relevance": ["Tag1", "Tag2", "Tag3"]
            }}
        ]
        
        Ensure the content is high-quality and educational.
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
            return parsed.get("news", parsed) if isinstance(parsed, dict) else parsed
        except Exception as e:
            print(f"Error processing with AI: {e}")
            return []

    def save_news(self, news_data: List[Dict[str, Any]]):
        # 1. Save locally (backup/dev)
        local_path = os.path.join(os.path.dirname(__file__), "..", "data", "news.json")
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, "w", encoding="utf-8") as f:
            json.dump(news_data, f, indent=4)

        # 2. Save to GCS
        if self.bucket:
            try:
                blob = self.bucket.blob("news.json")
                blob.upload_from_string(json.dumps(news_data), content_type="application/json")
                print("Uploaded news.json to GCS")
            except Exception as e:
                print(f"Error uploading to GCS: {e}")

    def load_news(self) -> List[Dict[str, Any]]:
        # 1. Try GCS
        if self.bucket:
            try:
                blob = self.bucket.blob("news.json")
                data = blob.download_as_text()
                return json.loads(data)
            except NotFound:
                print("news.json not found in GCS")
            except Exception as e:
                print(f"Error reading from GCS: {e}")

        # 2. Fallback to local
        local_path = os.path.join(os.path.dirname(__file__), "..", "data", "news.json")
        if os.path.exists(local_path):
            with open(local_path, "r", encoding="utf-8") as f:
                return json.load(f)
        
        return []
