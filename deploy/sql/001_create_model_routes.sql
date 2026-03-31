-- Create anycap_model_routes table for local development.
-- This table is owned by an external service; we create it here
-- so anycap-server can work locally without that service running.

CREATE TABLE IF NOT EXISTS anycap_model_routes (
    id                BIGSERIAL PRIMARY KEY,
    model_id          VARCHAR(128) NOT NULL,
    capability        VARCHAR(32) NOT NULL,
    operation         VARCHAR(64) NOT NULL,
    ability_key       VARCHAR(255) NOT NULL,
    algo_type         VARCHAR(64) NOT NULL DEFAULT '',
    mode              VARCHAR(64) NOT NULL DEFAULT '',
    display_name      VARCHAR(255) NOT NULL DEFAULT '',
    mode_description  TEXT NOT NULL DEFAULT '',
    model_description TEXT NOT NULL DEFAULT '',
    status            VARCHAR(32) NOT NULL DEFAULT 'active',
    extra             JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    external_id       TEXT NOT NULL DEFAULT '',
    UNIQUE (model_id, operation, mode)
);

CREATE INDEX IF NOT EXISTS idx_anycap_model_routes_lookup
    ON anycap_model_routes (model_id, operation, status);

CREATE INDEX IF NOT EXISTS idx_anycap_model_routes_ability_key
    ON anycap_model_routes (ability_key);

CREATE INDEX IF NOT EXISTS idx_anycap_model_routes_catalog
    ON anycap_model_routes (capability, status, model_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_anycap_model_routes_external_id_unique
    ON anycap_model_routes (external_id) WHERE external_id <> '';
