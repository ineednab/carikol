-- Flatten waitlist table: migrate from answers JSON blob to flat columns
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Step 1: add flat columns
ALTER TABLE waitlist
  ADD COLUMN IF NOT EXISTS pain         TEXT,
  ADD COLUMN IF NOT EXISTS workflow     TEXT,
  ADD COLUMN IF NOT EXISTS demographic  TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Step 2: backfill from existing JSON rows
UPDATE waitlist SET
  pain         = answers->>'pain',
  workflow     = answers->>'workflow',
  demographic  = answers->>'demographic',
  completed_at = CASE
    WHEN answers->>'demographic' IS NOT NULL THEN created_at
    ELSE NULL
  END
WHERE answers IS NOT NULL;

-- Step 3: drop the old JSON column
ALTER TABLE waitlist DROP COLUMN IF EXISTS answers;

-- Verify
SELECT
  COUNT(*)                                            AS total,
  COUNT(*) FILTER (WHERE completed_at IS NOT NULL)   AS completed,
  ROUND(
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::numeric
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                   AS completion_pct
FROM waitlist;
