-- 0023: Add storage tracking columns to spaces table for quota enforcement.

-- Add storage tracking columns
ALTER TABLE spaces
  ADD COLUMN IF NOT EXISTS storage_used_bytes  BIGINT NOT NULL DEFAULT 0;
ALTER TABLE spaces
  ADD COLUMN IF NOT EXISTS drive_node_count    INT    NOT NULL DEFAULT 0;
ALTER TABLE spaces
  ADD COLUMN IF NOT EXISTS page_site_count     INT    NOT NULL DEFAULT 0;

-- CHECK constraints to prevent negative counters
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spaces_storage_used_bytes_non_negative') THEN
    ALTER TABLE spaces ADD CONSTRAINT spaces_storage_used_bytes_non_negative CHECK (storage_used_bytes >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spaces_drive_node_count_non_negative') THEN
    ALTER TABLE spaces ADD CONSTRAINT spaces_drive_node_count_non_negative CHECK (drive_node_count >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spaces_page_site_count_non_negative') THEN
    ALTER TABLE spaces ADD CONSTRAINT spaces_page_site_count_non_negative CHECK (page_site_count >= 0);
  END IF;
END $$;

-- Backfill existing spaces with current usage.
-- Safe to re-run: resets then rebuilds from source tables.

-- Step 1: Reset all counters to 0 (idempotent baseline)
UPDATE spaces SET storage_used_bytes = 0, drive_node_count = 0, page_site_count = 0;

-- Step 2: Backfill Drive storage bytes (only completed files with storage objects)
UPDATE spaces s SET storage_used_bytes = storage_used_bytes + sub.total
FROM (
  SELECT space_id, SUM(COALESCE(size, 0)) AS total
  FROM drive_nodes
  WHERE deleted_at IS NULL AND storage_object_id IS NOT NULL
  GROUP BY space_id
) sub WHERE s.id = sub.space_id;

-- Step 3: Backfill Drive node count (folders + completed files)
UPDATE spaces s SET drive_node_count = sub.cnt
FROM (
  SELECT space_id, COUNT(*) AS cnt
  FROM drive_nodes
  WHERE deleted_at IS NULL
    AND (kind = 'folder' OR storage_object_id IS NOT NULL)
  GROUP BY space_id
) sub WHERE s.id = sub.space_id;

-- Step 4: Backfill Page storage bytes
UPDATE spaces s SET storage_used_bytes = storage_used_bytes + sub.total
FROM (
  SELECT us.space_id, SUM(so.size) AS total
  FROM storage_objects so
  JOIN upload_sessions us ON us.object_key = so.object_key AND us.space_id = so.space_id
  WHERE us.target_type = 'page' AND us.status = 'completed'
  GROUP BY us.space_id
) sub WHERE s.id = sub.space_id;

-- Step 5: Backfill Page site count
UPDATE spaces s SET page_site_count = sub.cnt
FROM (
  SELECT space_id, COUNT(*) AS cnt
  FROM page_sites
  WHERE deleted_at IS NULL
  GROUP BY space_id
) sub WHERE s.id = sub.space_id;
