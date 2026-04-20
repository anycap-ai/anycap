CREATE INDEX IF NOT EXISTS idx_drive_nodes_space_parent_name_active
ON drive_nodes (space_id, parent_id, name)
WHERE deleted_at IS NULL;
