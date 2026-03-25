DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM api_keys
        WHERE user_id !~ '^[0-9]+$'
    ) THEN
        RAISE EXCEPTION 'migration 0006 blocked: api_keys.user_id contains non-numeric values';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM call_logs
        WHERE user_id !~ '^[0-9]+$'
    ) THEN
        RAISE EXCEPTION 'migration 0006 blocked: call_logs.user_id contains non-numeric values';
    END IF;
END $$;

ALTER TABLE api_keys
    ALTER COLUMN user_id TYPE BIGINT
    USING user_id::BIGINT;

ALTER TABLE call_logs
    ALTER COLUMN user_id TYPE BIGINT
    USING user_id::BIGINT;
