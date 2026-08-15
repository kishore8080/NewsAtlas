import requests
import json
import os
import time
from typing import Optional, Dict, Any, Tuple
from supabase import Client

# Static country centroid fallback map for zero-dependency instant resolution
STATIC_COUNTRY_CENTROIDS: Dict[str, Tuple[str, float, float]] = {
    "IN": ("India", 20.5937, 78.9629),
    "US": ("United States", 37.0902, -95.7129),
    "CN": ("China", 35.8617, 104.1954),
    "RU": ("Russia", 61.5240, 105.3188),
    "GB": ("United Kingdom", 55.3781, -3.4360),
    "DE": ("Germany", 51.1657, 10.4515),
    "FR": ("France", 46.2276, 2.2137),
    "JP": ("Japan", 36.2048, 138.2529),
    "BR": ("Brazil", -14.2350, -51.9253),
    "CA": ("Canada", 56.1304, -106.3468),
    "AU": ("Australia", -25.2744, 133.7751),
    "ZA": ("South Africa", -30.5595, 22.9375),
    "IT": ("Italy", 41.8719, 12.5674),
    "ES": ("Spain", 40.4637, -3.7492),
    "SA": ("Saudi Arabia", 23.8859, 45.0792),
    "AE": ("United Arab Emirates", 23.4241, 53.8478),
    "SG": ("Singapore", 1.3521, 103.8198),
    "PK": ("Pakistan", 30.3753, 69.3451),
    "BD": ("Bangladesh", 23.6850, 90.3563),
    "EG": ("Egypt", 26.8206, 30.8025),
    "UA": ("Ukraine", 48.3794, 31.1656),
    "IL": ("Israel", 31.0461, 34.8516),
    "IR": ("Iran", 32.4279, 53.6880),
    "TR": ("Turkey", 38.9637, 35.2433),
    "KR": ("South Korea", 35.9078, 127.7669),
    "ID": ("Indonesia", -0.7893, 113.9213),
    "MX": ("Mexico", 23.6345, -102.5528),
    "AR": ("Argentina", -38.4161, -63.6167),
    "CH": ("Switzerland", 46.8182, 8.2275),
    "NL": ("Netherlands", 52.1326, 5.2913),
    "BE": ("Belgium", 50.5039, 4.4699),
    "SE": ("Sweden", 60.1282, 18.6435),
    "NO": ("Norway", 60.4720, 8.4689),
    "FI": ("Finland", 61.9241, 25.7482),
    "PL": ("Poland", 51.9194, 19.1451),
    "GR": ("Greece", 39.0742, 21.8243),
    "AF": ("Afghanistan", 33.9391, 67.7100),
    "LK": ("Sri Lanka", 7.8731, 80.7718),
    "NP": ("Nepal", 28.3949, 84.1240),
    "MM": ("Myanmar", 21.9162, 95.9560),
    "VN": ("Vietnam", 14.0583, 108.2772),
    "TH": ("Thailand", 15.8700, 100.9925),
    "MY": ("Malaysia", 4.2105, 101.9758),
    "PH": ("Philippines", 12.8797, 121.7740),
    "NZ": ("New Zealand", -40.9006, 174.8860),
    "KE": ("Kenya", -0.0236, 37.9062),
    "NG": ("Nigeria", 9.0820, 8.6753),
    "ET": ("Ethiopia", 9.1450, 40.4897)
}

class GeocodingResolver:
    def __init__(self, supabase_client: Optional[Client] = None):
        self.supabase = supabase_client
        self.user_agent = os.getenv("USER_AGENT", "EazyPrepAI-UPSC-Geocoder/1.0 (contact@eazyprep.ai)")
        self.google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    def _build_location_key(self, city: str, country_code: str) -> str:
        clean_city = (city or "").strip().lower()
        clean_cc = (country_code or "").strip().lower()
        return f"{clean_city}|{clean_cc}"

    def resolve_location(
        self,
        city: Optional[str],
        admin_area: Optional[str],
        country_code: Optional[str]
    ) -> Dict[str, Any]:
        """
        Resolves city/admin_area/country_code to (latitude, longitude, location_name, country_code).
        Pipeline Tier:
        1. Cache-first lookup in `location_geocode` table
        2. API lookup (Google Geocoding or Nominatim fallback) -> Cache result
        3. Country centroid fallback lookup if city resolution fails
        4. Return null coordinates if all tiers fail (to prevent mis-plotting)
        """
        clean_city = (city or "").strip()
        clean_admin = (admin_area or "").strip()
        clean_cc = (country_code or "").strip().upper()

        if not clean_city and not clean_cc:
            return {
                "latitude": None,
                "longitude": None,
                "location_name": None,
                "country_code": None,
                "source": "none"
            }

        location_key = self._build_location_key(clean_city, clean_cc)

        # 1. CACHE LOOKUP
        if self.supabase and location_key:
            try:
                res = self.supabase.table("location_geocode").select("*").eq("location_key", location_key).execute()
                if res.data and len(res.data) > 0:
                    cached = res.data[0]
                    return {
                        "latitude": float(cached["latitude"]),
                        "longitude": float(cached["longitude"]),
                        "location_name": cached["resolved_name"],
                        "country_code": clean_cc,
                        "source": "cache"
                    }
            except Exception as e:
                print(f"[GeocodingResolver] Cache lookup failed: {e}")

        # 2. API LOOKUP (Google Geocoding or Nominatim)
        api_result = self._call_geocoding_api(clean_city, clean_admin, clean_cc)
        if api_result:
            lat, lng, resolved_name = api_result

            # Cache successful result in `location_geocode` table
            if self.supabase and location_key:
                try:
                    self.supabase.table("location_geocode").upsert({
                        "location_key": location_key,
                        "latitude": lat,
                        "longitude": lng,
                        "resolved_name": resolved_name,
                    }, on_conflict="location_key").execute()
                except Exception as e:
                    print(f"[GeocodingResolver] Cache write failed: {e}")

            return {
                "latitude": lat,
                "longitude": lng,
                "location_name": resolved_name,
                "country_code": clean_cc,
                "source": "api"
            }

        # 3. COUNTRY CENTROID FALLBACK LOOKUP
        if clean_cc in STATIC_COUNTRY_CENTROIDS:
            c_name, c_lat, c_lng = STATIC_COUNTRY_CENTROIDS[clean_cc]
            formatted_name = f"{clean_city}, {c_name}" if clean_city else c_name
            return {
                "latitude": c_lat,
                "longitude": c_lng,
                "location_name": formatted_name,
                "country_code": clean_cc,
                "source": "country_centroid"
            }

        # Also attempt database country_centroids table lookup
        if self.supabase and clean_cc:
            try:
                res = self.supabase.table("country_centroids").select("*").eq("country_code", clean_cc).execute()
                if res.data and len(res.data) > 0:
                    c_row = res.data[0]
                    formatted_name = f"{clean_city}, {c_row['country_name']}" if clean_city else c_row['country_name']
                    return {
                        "latitude": float(c_row["latitude"]),
                        "longitude": float(c_row["longitude"]),
                        "location_name": formatted_name,
                        "country_code": clean_cc,
                        "source": "country_centroid_db"
                    }
            except Exception as e:
                print(f"[GeocodingResolver] DB centroid lookup failed: {e}")

        # 4. FINAL NULL FALLBACK (prevent mis-plotting)
        return {
            "latitude": None,
            "longitude": None,
            "location_name": f"{clean_city}, {clean_cc}".strip(", "),
            "country_code": clean_cc,
            "source": "failed"
        }

    def _call_geocoding_api(
        self,
        city: str,
        admin_area: str,
        country_code: str
    ) -> Optional[Tuple[float, float, str]]:
        """Invokes Google Maps Geocoding API if key is set, or OpenStreetMap Nominatim API."""
        query_parts = [p for p in [city, admin_area, country_code] if p]
        if not query_parts:
            return None

        query_str = ", ".join(query_parts)

        # Option A: Google Maps Geocoding API
        if self.google_api_key:
            try:
                url = f"https://maps.googleapis.com/maps/api/geocode/json?address={requests.utils.quote(query_str)}&key={self.google_api_key}"
                if country_code:
                    url += f"&components=country:{country_code}"
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    if data.get("results"):
                        loc = data["results"][0]["geometry"]["location"]
                        formatted = data["results"][0].get("formatted_address", query_str)
                        return (float(loc["lat"]), float(loc["lng"]), formatted)
            except Exception as e:
                print(f"[GeocodingResolver] Google API failed: {e}")

        # Option B: OpenStreetMap Nominatim API (Free, rate limited to 1 req/sec)
        try:
            time.sleep(0.2)  # Respect rate limit
            url = f"https://nominatim.openstreetmap.org/search?format=json&q={requests.utils.quote(query_str)}&limit=1"
            headers = {"User-Agent": self.user_agent}
            r = requests.get(url, headers=headers, timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data and isinstance(data, list) and len(data) > 0:
                    first = data[0]
                    lat = float(first["lat"])
                    lng = float(first["lon"])
                    display_name = first.get("display_name", query_str)
                    # Shorten long display name to "City, Country"
                    parts = [p.strip() for p in display_name.split(",")]
                    short_name = f"{parts[0]}, {parts[-1]}" if len(parts) >= 2 else display_name
                    return (lat, lng, short_name)
        except Exception as e:
            print(f"[GeocodingResolver] Nominatim API failed: {e}")

        return None
