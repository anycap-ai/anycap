CREATE TABLE IF NOT EXISTS anycap_model_routes (
    id            BIGSERIAL PRIMARY KEY,
    model_id      VARCHAR(128) NOT NULL,
    capability    VARCHAR(32) NOT NULL,
    operation     VARCHAR(64) NOT NULL,
    ability_key   VARCHAR(255) NOT NULL,
    algo_type     VARCHAR(64) NOT NULL DEFAULT '',
    display_name  VARCHAR(255) NOT NULL DEFAULT '',
    status        VARCHAR(32) NOT NULL DEFAULT 'active',
    extra         JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (model_id, operation, algo_type)
);

CREATE INDEX IF NOT EXISTS idx_anycap_model_routes_lookup
    ON anycap_model_routes (model_id, operation, status);

CREATE INDEX IF NOT EXISTS idx_anycap_model_routes_ability_key
    ON anycap_model_routes (ability_key);

CREATE INDEX IF NOT EXISTS idx_anycap_model_routes_catalog
    ON anycap_model_routes (capability, status, model_id);
