-- Migration 01: Add geocoding columns to public.table_news
ALTER TABLE public.table_news
ADD COLUMN IF NOT EXISTS latitude double precision NULL,
ADD COLUMN IF NOT EXISTS longitude double precision NULL,
ADD COLUMN IF NOT EXISTS location_name text NULL,
ADD COLUMN IF NOT EXISTS country_code text NULL;

-- Btree index on coordinates for fast geographic queries
CREATE INDEX IF NOT EXISTS idx_table_news_lat_lng 
ON public.table_news (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
