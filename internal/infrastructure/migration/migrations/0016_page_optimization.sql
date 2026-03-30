-- 0016_page_optimization.sql
-- Page feature optimizations: badge opt-out + site name index for pagination.

-- F3: Badge opt-out column
ALTER TABLE page_sites ADD COLUMN IF NOT EXISTS show_badge BOOLEAN NOT NULL DEFAULT TRUE;

-- S1/S3: Index for site name filtering with pagination
CREATE INDEX IF NOT EXISTS idx_page_sites_space_name
    ON page_sites (space_id, name)
    WHERE deleted_at IS NULL;
