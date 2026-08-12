import json
import os
import tomllib
import requests
import pytz
from datetime import datetime
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Ensure .env is loaded
ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(ENV_PATH)
load_dotenv()

try:
    import feedparser
except (ImportError, ModuleNotFoundError):
    feedparser = None
from bs4 import BeautifulSoup
from google.cloud import storage
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

class NewsService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")

        if supabase_url and supabase_key:
            try:
                self.supabase: Client = create_client(supabase_url, supabase_key)
            except Exception as e:
                print(f"Warning: Supabase initialization failed: {e}")
                self.supabase = None
        else:
            print("Warning: SUPABASE_URL or SUPABASE_KEY environment variables missing.")
            self.supabase = None

        self.bucket_name = config.get("storage", {}).get("bucket_name")
        self.storage_client = None
        if self.bucket_name:
            try:
                self.storage_client = storage.Client()
            except Exception as e:
                print(f"Warning: GCS client initialization failed: {e}")
                self.storage_client = None

    def fetch_rss_feeds(self) -> List[Dict[str, Any]]:
        raw_news = []
        for feed_url in RSS_FEEDS:
            fetched = False
            if feedparser is not None:
                try:
                    parsed_feed = feedparser.parse(feed_url)
                    if parsed_feed.entries:
                        for entry in parsed_feed.entries[:5]:  # Limit to 5 per feed
                            title = getattr(entry, "title", "")
                            link = getattr(entry, "link", "")
                            description = getattr(entry, "summary", getattr(entry, "description", ""))
                            published = getattr(entry, "published", getattr(entry, "updated", str(datetime.now(IST))))
                            
                            raw_news.append({
                                "title": title.strip(),
                                "link": link.strip(),
                                "description": self._clean_html(description),
                                "published": published
                            })
                        fetched = True
                except Exception as e:
                    print(f"feedparser failed for {feed_url} ({e}), falling back...")

            if not fetched:
                try:
                    response = requests.get(feed_url, timeout=10)
                    soup = BeautifulSoup(response.content, "xml")
                    items = soup.find_all("item")
                    if not items:
                        soup = BeautifulSoup(response.content, "html.parser")
                        items = soup.find_all("item")

                    for item in items[:5]:
                        title = item.title.text if item.title else ""
                        link = item.link.text if item.link else ""
                        description = item.description.text if item.description else ""
                        pub_date = item.pubDate.text if item.pubDate else str(datetime.now(IST))
                        raw_news.append({
                            "title": title.strip(),
                            "link": link.strip(),
                            "description": self._clean_html(description),
                            "published": pub_date
                        })
                except Exception as ex:
                    print(f"Error fetching feed {feed_url}: {ex}")
        return raw_news

    def _clean_html(self, html_content: str) -> str:
        soup = BeautifulSoup(html_content, "html.parser")
        return soup.get_text()

    def process_news_with_ai(self, raw_news: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not raw_news:
            return []

        prompt = f"""
        You are an expert UPSC exam content curator.
        Process the following raw news items and select the most relevant ones for UPSC Civil Services preparation.
        
        Raw News:
        {json.dumps(raw_news)}

        Output Format:
        Return a JSON object with a "news" property containing an array of objects matching this exact schema:
        {{
            "news": [
                {{
                    "title": "Concise Title",
                    "summary": "Comprehensive summary paragraph explaining the news event, background, and specific UPSC civil services exam relevance (50-80 words).",
                    "category": "One of: Polity, Economy, Environment, Science & Technology, International Relations, History, Geography, Social Issues",
                    "region": "National",
                    "source": "Source Name",
                    "source_url": "Direct link URL from raw news item",
                    "image_url": null,
                    "priority": 8
                }}
            ]
        }}
        
        Guidelines:
        - "priority": Integer between 1 and 10 based on UPSC exam importance (10 = Critical core topic, 1 = Low relevance).
        - "category": Map accurately to UPSC GS syllabus topics.
        - "region": Assign National, International, or State.
        - "source_url": Must be preserved accurately from the input raw news link.
        - Ensure content is educational, facts-driven, and neutral.
        """

        providers = [
            ("Gemini", self._call_gemini_api),
            ("OpenAI", self._call_openai_api),
            ("Groq", self._call_groq_api)
        ]

        for provider_name, provider_fn in providers:
            try:
                print(f"Attempting AI news processing using {provider_name}...")
                results = provider_fn(prompt)
                if results:
                    print(f"Successfully processed {len(results)} items using {provider_name}.")
                    return results
            except Exception as e:
                print(f"Provider {provider_name} failed: {e}. Trying next fallback...")

        print("CRITICAL: All AI providers (Gemini, OpenAI, Groq) failed or hit quota/key limits. Falling back to RSS direct formatting.")
        return self._fallback_raw_to_news(raw_news)

    def _fallback_raw_to_news(self, raw_news: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Fallback when AI processing is unavailable: format raw RSS news items directly for Supabase."""
        formatted = []
        for item in raw_news:
            title = item.get("title", "").strip()
            link = item.get("link", "").strip()
            desc = item.get("description", "").strip()
            if not title or not link:
                continue

            category = "Polity"
            combined = (title + " " + desc).lower()
            if any(k in combined for k in ["economy", "bank", "tax", "gdp", "rbi", "finance", "trade"]):
                category = "Economy"
            elif any(k in combined for k in ["environment", "climate", "forest", "pollution", "wildlife", "cop"]):
                category = "Environment"
            elif any(k in combined for k in ["tech", "space", "isro", "ai", "cyber", "science", "nasa"]):
                category = "Science & Technology"
            elif any(k in combined for k in ["china", "us", "russia", "un", "diplomacy", "bilateral", "global", "foreign"]):
                category = "International Relations"
            elif any(k in combined for k in ["court", "supreme court", "bill", "act", "parliament", "constitution", "election"]):
                category = "Polity"

            source = "The Hindu" if "thehindu" in link else ("Indian Express" if "indianexpress" in link else "News")

            formatted.append({
                "title": title,
                "summary": desc[:300] if desc else title,
                "category": category,
                "region": "National",
                "source": source,
                "source_url": link,
                "image_url": None,
                "priority": 6
            })
        return formatted

    def _call_gemini_api(self, prompt: str) -> List[Dict[str, Any]]:
        key = os.getenv("GEMINI_API_KEY")
        if not key:
            raise ValueError("GEMINI_API_KEY environment variable missing.")

        for model_name in ["gemini-2.0-flash", "gemini-2.5-flash"]:
            try:
                client = OpenAI(
                    api_key=key,
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
                )
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return self._parse_ai_json(content)
            except Exception as ex:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
                    body = {
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"response_mime_type": "application/json"}
                    }
                    r = requests.post(url, json=body, timeout=25)
                    if r.status_code == 200:
                        data = r.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return self._parse_ai_json(text)
                except Exception:
                    pass
                raise ex

    def _call_openai_api(self, prompt: str) -> List[Dict[str, Any]]:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            raise ValueError("OPENAI_API_KEY environment variable missing.")

        client = OpenAI(api_key=key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return self._parse_ai_json(content)

    def _call_groq_api(self, prompt: str) -> List[Dict[str, Any]]:
        key = os.getenv("GROQ_API_KEY")
        if not key:
            raise ValueError("GROQ_API_KEY environment variable missing.")

        client = OpenAI(
            api_key=key,
            base_url="https://api.groq.com/openai/v1"
        )
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return self._parse_ai_json(content)

    def _parse_ai_json(self, content: str) -> List[Dict[str, Any]]:
        try:
            parsed = json.loads(content)
            if isinstance(parsed, dict):
                for key in ["news", "items", "news_articles", "result", "articles", "response", "data", "news_items"]:
                    if key in parsed and isinstance(parsed[key], list):
                        return parsed[key]
                for val in parsed.values():
                    if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
                        return val
                if "title" in parsed:
                    return [parsed]
                return []
            elif isinstance(parsed, list):
                return parsed
            else:
                return []
        except Exception as e:
            print(f"Failed to parse AI JSON output: {e}")
            return []

    def refresh_daily_news(self) -> Dict[str, Any]:
        """
        Fetches new news, processes with AI, and UPSERTS into Supabase TABLE_NEWS table.
        Deduplication is handled by unique source_url constraint.
        Returns execution metrics dict.
        """
        print("Starting Supabase news refresh for TABLE_NEWS...")
        today_str = datetime.now(IST).strftime("%Y-%m-%d")
        
        # 1. Fetch RSS
        raw_news = self.fetch_rss_feeds()
        print(f"Fetched {len(raw_news)} raw items from RSS.")
        
        if not raw_news:
            return {
                "status": "warning",
                "fetched_raw_count": 0,
                "processed_count": 0,
                "upserted_count": 0,
                "message": "No raw news found from RSS feeds."
            }

        # 2. Deduplication check: Get existing source_urls from TABLE_NEWS
        existing_urls = set()
        if self.supabase:
            try:
                res = self.supabase.table("TABLE_NEWS").select("source_url").execute()
                if res.data:
                    existing_urls = {item['source_url'] for item in res.data if item.get('source_url')}
            except Exception as e:
                print(f"Error fetching existing source_urls: {e}")

        new_raw_items = [item for item in raw_news if item.get('link') not in existing_urls]
        print(f"Found {len(new_raw_items)} new items to process (after URL deduplication).")

        if not new_raw_items:
            return {
                "status": "success",
                "fetched_raw_count": len(raw_news),
                "new_items_count": 0,
                "processed_count": 0,
                "upserted_count": 0,
                "message": "No new news items to process."
            }

        # 3. Process with AI
        print(f"Sending {len(new_raw_items)} items to OpenAI...")
        processed_news = self.process_news_with_ai(new_raw_items)
        
        if not processed_news:
            return {
                "status": "warning",
                "fetched_raw_count": len(raw_news),
                "new_items_count": len(new_raw_items),
                "processed_count": 0,
                "upserted_count": 0,
                "message": "AI processing returned no items."
            }

        print(f"AI returned {len(processed_news)} items.")

        # 4. Save to Supabase TABLE_NEWS
        upserted_count = 0
        if self.supabase:
            for item in processed_news:
                source_url = item.get("source_url") or item.get("link") or item.get("url")
                if not source_url:
                    continue

                raw_priority = item.get("priority", 5)
                try:
                    priority = min(max(int(raw_priority), 1), 10)
                except (ValueError, TypeError):
                    priority = 5

                db_item = {
                    "datetime": datetime.now(IST).isoformat(),
                    "title": item.get("title", "UPSC News Update"),
                    "summary": item.get("summary") or item.get("description") or item.get("content", ""),
                    "category": item.get("category", "Polity"),
                    "region": item.get("region", "National"),
                    "source": item.get("source", "The Hindu"),
                    "source_url": source_url,
                    "image_url": item.get("image_url"),
                    "priority": priority
                }
                
                try:
                    self.supabase.table("TABLE_NEWS").upsert(db_item, on_conflict="source_url").execute()
                    upserted_count += 1
                    print(f"Upserted to TABLE_NEWS: {item.get('title')}")
                except Exception as e:
                    print(f"Error saving item to TABLE_NEWS ({item.get('title')}): {e}")
        else:
            print("CRITICAL: Supabase client not initialized.")

        # 5. Write news file to GCS (if configured)
        if self.storage_client and self.bucket_name:
            self._write_gcs_news(processed_news, today_str)
        else:
            print("GCS not configured or unavailable. Skipping file upload.")

        return {
            "status": "success",
            "fetched_raw_count": len(raw_news),
            "new_items_count": len(new_raw_items),
            "processed_count": len(processed_news),
            "upserted_count": upserted_count,
            "timestamp": datetime.now(IST).isoformat(),
            "message": f"Successfully processed {len(processed_news)} articles and upserted {upserted_count} into TABLE_NEWS."
        }

    def load_news(self, date: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Loads news from Supabase TABLE_NEWS table.
        date format input: dd-mm-yyyy (from frontend) -> query by datetime range.
        If date is None, loads latest news ordered by priority desc / datetime desc.
        """
        if not self.supabase:
            print("Supabase client not initialized. Falling back to local news data.")
            return self._load_local_news()

        try:
            query = self.supabase.table("TABLE_NEWS").select("*")
            if date:
                try:
                    dt = datetime.strptime(date, "%d-%m-%Y")
                    db_date_start = dt.replace(hour=0, minute=0, second=0).isoformat()
                    db_date_end = dt.replace(hour=23, minute=59, second=59).isoformat()
                    query = query.gte("datetime", db_date_start).lte("datetime", db_date_end).order("priority", desc=True)
                except ValueError:
                    print(f"Invalid date format passed: {date}")
                    return []
            else:
                # Fetch latest news sorted by priority desc and datetime desc
                query = query.order("priority", desc=True).order("datetime", desc=True).limit(50)

            response = query.execute()
            news_data = response.data

            if not news_data and date:
                # Fallback: if no news for requested specific date, fetch latest overall
                print(f"No TABLE_NEWS records for specified date {date}. Attempting latest fetch.")
                fallback_res = self.supabase.table("TABLE_NEWS").select("*").order("priority", desc=True).order("datetime", desc=True).limit(50).execute()
                news_data = fallback_res.data

            if not news_data:
                print("No TABLE_NEWS records available in Supabase. Falling back to local news data.")
                return self._load_local_news()

            # Map retrieved TABLE_NEWS rows back to frontend expected properties
            mapped_news = []
            for item in news_data:
                priority_val = item.get("priority", 5)
                importance = "High" if priority_val >= 7 else ("Medium" if priority_val >= 4 else "Low")
                
                raw_dt = item.get("datetime", "")
                date_str = ""
                if raw_dt:
                    try:
                        parsed_dt = datetime.fromisoformat(raw_dt.replace("Z", "+00:00"))
                        date_str = parsed_dt.strftime("%d-%m-%Y")
                    except Exception:
                        date_str = str(raw_dt)[:10]

                mapped_item = {
                    "id": str(item.get("id", "")),
                    "title": item.get("title", ""),
                    "summary": item.get("summary", ""),
                    "description": item.get("summary", ""),
                    "content": item.get("summary", ""),
                    "category": item.get("category", "Polity"),
                    "region": item.get("region", "National"),
                    "source": item.get("source", ""),
                    "source_url": item.get("source_url", ""),
                    "link": item.get("source_url", ""),
                    "image_url": item.get("image_url"),
                    "priority": priority_val,
                    "importance": importance,
                    "datetime": raw_dt,
                    "date": date_str,
                    "relevance": [item.get("category", "UPSC"), item.get("region", "National")],
                    "key_points": [item.get("summary", "")] if item.get("summary") else []
                }
                mapped_news.append(mapped_item)

            mapped_news.sort(key=lambda x: x.get("priority", 5), reverse=True)
            return mapped_news

        except Exception as e:
            print(f"Error loading news from Supabase TABLE_NEWS: {e}")
            return self._load_local_news()

    def _load_local_news(self) -> List[Dict[str, Any]]:
        """Load local sample news data when Supabase data is unavailable."""
        try:
            local_path = os.path.join(os.path.dirname(__file__), "..", "data", "news.json")
            with open(local_path, "r", encoding="utf-8") as f:
                news_data = json.load(f)

            mapped_news = []
            for item in news_data:
                item['relevance'] = item.get('relevance', [])
                item['date'] = item.get('date', item.get('published_date', ''))
                mapped_news.append(item)

            importance_map = {"High": 3, "Medium": 2, "Low": 1}
            mapped_news.sort(key=lambda x: importance_map.get(x.get("importance", "Low"), 0), reverse=True)
            return mapped_news
        except Exception as e:
            print(f"Error loading local news data: {e}")
            return []

    def _write_gcs_news(self, news_items: List[Dict[str, Any]], today_str: str):
        """Write a timestamped news file to GCS in a year/month folder."""
        if not self.storage_client or not self.bucket_name:
            return

        try:
            dt = datetime.strptime(today_str, "%Y-%m-%d")
            year = dt.strftime("%Y")
            month = dt.strftime("%B")
            day = dt.strftime("%d-%m-%Y")
            prefix = f"news-data/{year}/{month}/"

            bucket = self.storage_client.bucket(self.bucket_name)
            blobs = list(self.storage_client.list_blobs(self.bucket_name, prefix=prefix))
            existing_files = [blob.name for blob in blobs if blob.name.startswith(prefix) and blob.name.endswith('.json') and day in blob.name]
            next_index = len(existing_files) + 1
            filename = f"{day}-data-{next_index:02d}.json"
            object_name = prefix + filename

            blob = bucket.blob(object_name)
            blob.upload_from_string(
                json.dumps(news_items, ensure_ascii=False, indent=2),
                content_type="application/json"
            )
            print(f"Uploaded news file to GCS: {object_name}")
        except Exception as e:
            print(f"Error writing news file to GCS: {e}")

    def _load_gcs_news(self, db_date: str) -> List[Dict[str, Any]]:
        """Load news data from GCS bucket if available."""
        if not self.storage_client or not self.bucket_name:
            return []

        try:
            dt = datetime.strptime(db_date, "%Y-%m-%d")
            year = dt.strftime("%Y")
            month = dt.strftime("%B")
            day = dt.strftime("%d-%m-%Y")
            prefix = f"news-data/{year}/{month}/"
            blobs = list(self.storage_client.list_blobs(self.bucket_name, prefix=prefix))
            matched_news = []

            for blob in blobs:
                if not blob.name.startswith(prefix):
                    continue
                if dt.strftime("%d-%m-%Y") not in blob.name:
                    continue

                content = blob.download_as_text(encoding="utf-8")
                try:
                    data = json.loads(content)
                except json.JSONDecodeError:
                    print(f"Invalid JSON in GCS object: {blob.name}")
                    continue

                if isinstance(data, list):
                    matched_news.extend(data)
                elif isinstance(data, dict):
                    matched_news.append(data)

            if not matched_news:
                return []

            for item in matched_news:
                item['relevance'] = item.get('relevance', [])
                item['date'] = item.get('date', item.get('published_date', dt.strftime('%Y-%m-%d')))

            importance_map = {"High": 3, "Medium": 2, "Low": 1}
            matched_news.sort(key=lambda x: importance_map.get(x.get("importance", "Low"), 0), reverse=True)
            return matched_news
        except Exception as e:
            print(f"Error loading news from GCS: {e}")
            return []
