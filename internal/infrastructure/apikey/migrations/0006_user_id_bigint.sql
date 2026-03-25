DO $$
BEGIN
    -- Only run if api_keys.user_id is still text.
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'api_keys' AND column_name = 'user_id' AND data_type = 'text'
    ) THEN
        -- Safeguard: block if non-numeric values exist.
        IF EXISTS (SELECT 1 FROM api_keys WHERE user_id !~ '^[0-9]+$') THEN
            RAISE EXCEPTION 'migration 0006 blocked: api_keys.user_id contains non-numeric values';
        END IF;
        ALTER TABLE api_keys ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;
    END IF;

    -- Only run if call_logs.user_id is still text.
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'call_logs' AND column_name = 'user_id' AND data_type = 'text'
    ) THEN
        IF EXISTS (SELECT 1 FROM call_logs WHERE user_id !~ '^[0-9]+$') THEN
            RAISE EXCEPTION 'migration 0006 blocked: call_logs.user_id contains non-numeric values';
        END IF;
        ALTER TABLE call_logs ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;
    END IF;
END $$;
