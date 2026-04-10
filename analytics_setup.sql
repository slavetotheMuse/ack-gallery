-- ═══════════════════════════════════════════════════════════════
-- ACK GALLERY ANALYTICS — Supabase Schema
-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- Events table — one row per tracked event
CREATE TABLE IF NOT EXISTS ack_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),

  -- Session
  session_id  text NOT NULL,           -- random ID per browser session
  visitor_id  text,                    -- persistent across sessions (localStorage)

  -- Event
  event       text NOT NULL,           -- e.g. 'page_load', 'collection_open', 'artwork_focus'

  -- Context
  collection  text,                    -- collection name (if applicable)
  artwork     text,                    -- artwork title (if applicable)
  detail      text,                    -- extra info (easter egg name, wallet addr, etc.)
  value       numeric,                 -- numeric value (duration in seconds, scroll depth %, etc.)

  -- Visitor info (captured on page_load)
  referrer    text,
  utm_source  text,
  utm_medium  text,
  utm_campaign text,
  path        text,                    -- URL path
  screen_w    int,
  screen_h    int,
  viewport_w  int,
  viewport_h  int,
  device      text,                    -- 'desktop', 'mobile', 'tablet'
  browser     text,                    -- 'chrome', 'safari', 'firefox', etc.
  os          text,                    -- 'mac', 'windows', 'ios', 'android', etc.
  language    text,
  country     text                     -- from Accept-Language header (rough)
);

-- Index for fast queries
CREATE INDEX idx_ack_events_created ON ack_events (created_at DESC);
CREATE INDEX idx_ack_events_event ON ack_events (event);
CREATE INDEX idx_ack_events_session ON ack_events (session_id);
CREATE INDEX idx_ack_events_visitor ON ack_events (visitor_id);
CREATE INDEX idx_ack_events_collection ON ack_events (collection);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security — allow anonymous inserts, block reads
-- (only you can read via the Supabase dashboard or service key)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE ack_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (the anon key in your JS)
CREATE POLICY "Allow anonymous inserts" ON ack_events
  FOR INSERT
  WITH CHECK (true);

-- Block all reads from anon key (only service_role can read)
-- This means no one can scrape your analytics data from the browser
CREATE POLICY "Block anonymous reads" ON ack_events
  FOR SELECT
  USING (false);

-- ═══════════════════════════════════════════════════════════════
-- Handy views for your dashboard
-- ═══════════════════════════════════════════════════════════════

-- Daily visitors (unique sessions)
CREATE OR REPLACE VIEW daily_visitors AS
SELECT
  date_trunc('day', created_at)::date AS day,
  COUNT(DISTINCT session_id) AS sessions,
  COUNT(DISTINCT visitor_id) AS unique_visitors,
  COUNT(*) FILTER (WHERE event = 'page_load') AS page_loads
FROM ack_events
GROUP BY 1
ORDER BY 1 DESC;

-- Collection popularity — which collections get opened most
CREATE OR REPLACE VIEW collection_popularity AS
SELECT
  collection,
  COUNT(*) AS opens,
  COUNT(DISTINCT session_id) AS unique_sessions,
  ROUND(AVG(value)::numeric, 1) AS avg_duration_sec
FROM ack_events
WHERE event = 'collection_open' AND collection IS NOT NULL
GROUP BY 1
ORDER BY opens DESC;

-- Artwork engagement — which pieces get focused most and longest
CREATE OR REPLACE VIEW artwork_engagement AS
SELECT
  collection,
  artwork,
  COUNT(*) AS focus_count,
  COUNT(DISTINCT session_id) AS unique_viewers,
  ROUND(AVG(value)::numeric, 1) AS avg_focus_sec,
  ROUND(MAX(value)::numeric, 1) AS max_focus_sec
FROM ack_events
WHERE event = 'artwork_focus' AND artwork IS NOT NULL
GROUP BY 1, 2
ORDER BY focus_count DESC;

-- Session duration — how long people stay
CREATE OR REPLACE VIEW session_durations AS
SELECT
  session_id,
  visitor_id,
  MIN(created_at) AS arrived,
  MAX(created_at) AS last_event,
  EXTRACT(EPOCH FROM MAX(created_at) - MIN(created_at))::int AS duration_sec,
  COUNT(*) AS event_count,
  COUNT(*) FILTER (WHERE event = 'collection_open') AS collections_opened,
  COUNT(*) FILTER (WHERE event = 'artwork_focus') AS artworks_focused
FROM ack_events
GROUP BY 1, 2
ORDER BY arrived DESC;

-- Referrer breakdown
CREATE OR REPLACE VIEW referrer_breakdown AS
SELECT
  COALESCE(referrer, 'direct') AS source,
  COUNT(DISTINCT session_id) AS sessions,
  COUNT(DISTINCT visitor_id) AS unique_visitors
FROM ack_events
WHERE event = 'page_load'
GROUP BY 1
ORDER BY sessions DESC;

-- Device breakdown
CREATE OR REPLACE VIEW device_breakdown AS
SELECT
  COALESCE(device, 'unknown') AS device,
  COALESCE(browser, 'unknown') AS browser,
  COALESCE(os, 'unknown') AS os,
  COUNT(DISTINCT session_id) AS sessions
FROM ack_events
WHERE event = 'page_load'
GROUP BY 1, 2, 3
ORDER BY sessions DESC;

-- Easter egg discoveries
CREATE OR REPLACE VIEW easter_egg_discoveries AS
SELECT
  detail AS easter_egg,
  COUNT(*) AS discoveries,
  COUNT(DISTINCT session_id) AS unique_finders,
  MIN(created_at) AS first_found,
  MAX(created_at) AS last_found
FROM ack_events
WHERE event = 'easter_egg'
GROUP BY 1
ORDER BY discoveries DESC;

-- Hourly traffic pattern
CREATE OR REPLACE VIEW hourly_traffic AS
SELECT
  EXTRACT(HOUR FROM created_at) AS hour_utc,
  COUNT(DISTINCT session_id) AS sessions,
  COUNT(*) AS events
FROM ack_events
WHERE event = 'page_load'
  AND created_at > now() - interval '30 days'
GROUP BY 1
ORDER BY 1;
