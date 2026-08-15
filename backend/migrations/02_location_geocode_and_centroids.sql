-- Migration 02: Geocode Cache Table & Country Centroid Fallback Table

-- 1. Cache Table for Geocoding (Cache-first to avoid duplicate API calls)
CREATE TABLE IF NOT EXISTS public.location_geocode (
  location_key text PRIMARY KEY, -- Format: "city|country_code" (lowercased)
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  resolved_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index on location_key
CREATE INDEX IF NOT EXISTS idx_location_geocode_key ON public.location_geocode (location_key);

-- 2. Country Centroids Table (Fallback when city geocoding fails)
CREATE TABLE IF NOT EXISTS public.country_centroids (
  country_code text PRIMARY KEY, -- ISO 3166-1 alpha-2
  country_name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL
);

-- Seed Data: ISO 3166-1 Country Centroids
INSERT INTO public.country_centroids (country_code, country_name, latitude, longitude) VALUES
  ('IN', 'India', 20.5937, 78.9629),
  ('US', 'United States', 37.0902, -95.7129),
  ('CN', 'China', 35.8617, 104.1954),
  ('RU', 'Russia', 61.5240, 105.3188),
  ('GB', 'United Kingdom', 55.3781, -3.4360),
  ('DE', 'Germany', 51.1657, 10.4515),
  ('FR', 'France', 46.2276, 2.2137),
  ('JP', 'Japan', 36.2048, 138.2529),
  ('BR', 'Brazil', -14.2350, -51.9253),
  ('CA', 'Canada', 56.1304, -106.3468),
  ('AU', 'Australia', -25.2744, 133.7751),
  ('ZA', 'South Africa', -30.5595, 22.9375),
  ('IT', 'Italy', 41.8719, 12.5674),
  ('ES', 'Spain', 40.4637, -3.7492),
  ('SA', 'Saudi Arabia', 23.8859, 45.0792),
  ('AE', 'United Arab Emirates', 23.4241, 53.8478),
  ('SG', 'Singapore', 1.3521, 103.8198),
  ('PK', 'Pakistan', 30.3753, 69.3451),
  ('BD', 'Bangladesh', 23.6850, 90.3563),
  ('EG', 'Egypt', 26.8206, 30.8025),
  ('UA', 'Ukraine', 48.3794, 31.1656),
  ('IL', 'Israel', 31.0461, 34.8516),
  ('IR', 'Iran', 32.4279, 53.6880),
  ('TR', 'Turkey', 38.9637, 35.2433),
  ('KR', 'South Korea', 35.9078, 127.7669),
  ('ID', 'Indonesia', -0.7893, 113.9213),
  ('MX', 'Mexico', 23.6345, -102.5528),
  ('AR', 'Argentina', -38.4161, -63.6167),
  ('CH', 'Switzerland', 46.8182, 8.2275),
  ('NL', 'Netherlands', 52.1326, 5.2913),
  ('BE', 'Belgium', 50.5039, 4.4699),
  ('SE', 'Sweden', 60.1282, 18.6435),
  ('NO', 'Norway', 60.4720, 8.4689),
  ('FI', 'Finland', 61.9241, 25.7482),
  ('PL', 'Poland', 51.9194, 19.1451),
  ('GR', 'Greece', 39.0742, 21.8243),
  ('AF', 'Afghanistan', 33.9391, 67.7100),
  ('LK', 'Sri Lanka', 7.8731, 80.7718),
  ('NP', 'Nepal', 28.3949, 84.1240),
  ('MM', 'Myanmar', 21.9162, 95.9560),
  ('VN', 'Vietnam', 14.0583, 108.2772),
  ('TH', 'Thailand', 15.8700, 100.9925),
  ('MY', 'Malaysia', 4.2105, 101.9758),
  ('PH', 'Philippines', 12.8797, 121.7740),
  ('NZ', 'New Zealand', -40.9006, 174.8860),
  ('KE', 'Kenya', -0.0236, 37.9062),
  ('NG', 'Nigeria', 9.0820, 8.6753),
  ('ET', 'Ethiopia', 9.1450, 40.4897)
ON CONFLICT (country_code) DO UPDATE SET
  country_name = EXCLUDED.country_name,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;
