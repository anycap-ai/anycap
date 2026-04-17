ALTER TABLE agent_runners
    ADD COLUMN IF NOT EXISTS agent TEXT NOT NULL DEFAULT 'codex';

UPDATE agent_runners
SET agent = 'codex'
WHERE agent = '';
