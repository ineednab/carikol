-- Add wish column for open-ended feature request
-- Run in Supabase SQL Editor

ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS wish TEXT;
