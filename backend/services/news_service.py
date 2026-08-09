import json
import os
import tomllib
import requests
import pytz
from datetime import datetime
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from openai import OpenAI
from supabase import create_client, Client

# Load configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config.toml")
with open(CONFIG_PATH, "rb") as f:
    config = tomllib.load(f)

RSS_FEEDS = [
    "https://www.thehindu.com/news/national/feeder/default.rss",
    "https://www.thehindu.com/news/international/feeder/default.rss",
    "https://indianexpress.com/section/india/feed/",
]
IST = pytz.timezone('Asia/Kolkata')

# Supabase Credentials (TODO: Move to env vars in production)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://lucounujcuwuncxopbmq.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Y291bnVqY3V3dW5jeG9wYm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTgyNzMsImV4cCI6MjA3OTYzNDI3M30.YBua8SlBbX-9RshV4HGpGC2XWsDP6yoddOmBwU886ow")

class NewsService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self.client = OpenAI(api_key=api_key)
        else:
            print("Warning: OPENAI_API_KEY not found. AI features will be disabled.")
            self.client = None

        try:
            self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            print(f"Warning: Supabase initialization failed: {e}")
            self.supabase = None

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

    def refresh_daily_news(self):
        """
        Fetches new news, processes with AI, and UPSERTS into Supabase.
        Deduplication is handled by the database UNIQUE constraint (title, published_date).
        """
        print("Starting Supabase news refresh...")
        
        # 1. Fetch RSS
        raw_news = self.fetch_rss_feeds()
        print(f"Fetched {len(raw_news)} raw items from RSS.")
        
        if not raw_news:
            print("No raw news found.")
            return

        # 2. Process with AI
        # Note: We process ALL raw news because we don't know what's in DB yet.
        # Ideally, we'd check DB first, but for now let's rely on upsert.
        # To save tokens, we could fetch titles from DB for today and filter.
        
        today_str = datetime.now(IST).strftime("%Y-%m-%d") # Supabase uses YYYY-MM-DD
        
        # Optimization: Get existing titles for today to avoid re-processing
        existing_titles = set()
        if self.supabase:
            try:
                res = self.supabase.table("news_items").select("title").eq("published_date", today_str).execute()
                existing_titles = {item['title'] for item in res.data}
            except Exception as e:
                print(f"Error fetching existing titles: {e}")

        new_raw_items = [item for item in raw_news if item['title'] not in existing_titles]
        print(f"Found {len(new_raw_items)} new items to process (after local deduplication).")

        if not new_raw_items:
            print("No new news to process.")
            return

        print(f"Sending {len(new_raw_items)} items to OpenAI...")
        processed_news = self.process_news_with_ai(new_raw_items)
        
        if not processed_news:
            print("AI processing returned no data.")
            return

        print(f"AI returned {len(processed_news)} items.")

        # 3. Save to Supabase
        if self.supabase:
            for item in processed_news:
                # Map fields to DB schema
                db_item = {
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "content": item.get("content"),
                    "category": item.get("category"),
                    "source": item.get("source"),
                    "published_date": item.get("date", today_str), # Ensure YYYY-MM-DD
                    "key_points": item.get("key_points", []),
                    "importance": item.get("importance", "Low"),
                    "relevance_tags": item.get("relevance", [])
                }
                
                try:
                    # Upsert based on UNIQUE(title, published_date)
                    self.supabase.table("news_items").upsert(db_item, on_conflict="title, published_date").execute()
                    print(f"Upserted: {item.get('title')}")
                except Exception as e:
                    print(f"Error saving item {item.get('title')}: {e}")
        else:
            print("CRITICAL: Supabase client not initialized.")

    def load_news(self, date: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Loads news from Supabase.
        date format input: dd-mm-yyyy (from frontend) -> convert to YYYY-MM-DD for DB
        """
        if not self.supabase:
            print("Supabase client not initialized.")
            return []

        if not date:
            date = datetime.now(IST).strftime("%d-%m-%Y")
            
        # Convert dd-mm-yyyy to YYYY-MM-DD
        try:
            dt = datetime.strptime(date, "%d-%m-%Y")
            db_date = dt.strftime("%Y-%m-%d")
        except ValueError:
            print(f"Invalid date format: {date}")
            return []

        try:
            # Fetch news for the date, sorted by importance
            # We can't easily sort by custom enum order in simple query, 
            # so we'll fetch and sort in Python or use a case statement if using raw SQL.
            # For now, fetch all and sort in Python.
            response = self.supabase.table("news_items").select("*").eq("published_date", db_date).execute()
            news_data = response.data
            
            # Map back to frontend expected format if needed (mostly same)
            # Frontend expects 'relevance' but DB has 'relevance_tags'
            mapped_news = []
            for item in news_data:
                item['relevance'] = item.pop('relevance_tags', [])
                item['date'] = datetime.strptime(item['published_date'], "%Y-%m-%d").strftime("%d-%m-%Y") # Back to dd-mm-yyyy
                mapped_news.append(item)
                
            # Sort by Importance
            importance_map = {"High": 3, "Medium": 2, "Low": 1}
            mapped_news.sort(key=lambda x: importance_map.get(x.get("importance", "Low"), 0), reverse=True)
            
            return mapped_news

        except Exception as e:
            print(f"Error loading news from Supabase: {e}")
            return []
