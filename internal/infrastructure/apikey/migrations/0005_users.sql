CREATE SEQUENCE IF NOT EXISTS anycap_user_id_seq
    START WITH 2000000000
    INCREMENT BY 1
    MINVALUE 2000000000
    MAXVALUE 2999999999;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    email TEXT NULL,
    name TEXT NULL,
    avatar_url TEXT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_identities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    provider TEXT NOT NULL,
    external_subject TEXT NOT NULL,
    email TEXT NULL,
    raw_profile JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, external_subject)
);

CREATE INDEX IF NOT EXISTS idx_auth_identities_user_id ON auth_identities (user_id);
