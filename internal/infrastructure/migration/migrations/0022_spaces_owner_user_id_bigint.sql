DO $$
BEGIN
    -- Only run if spaces.owner_user_id is still text.
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'spaces' AND column_name = 'owner_user_id' AND data_type = 'text'
    ) THEN
        -- Safeguard: block if non-numeric values exist.
        IF EXISTS (SELECT 1 FROM spaces WHERE owner_user_id !~ '^[0-9]+$') THEN
            RAISE EXCEPTION 'migration 0022 blocked: spaces.owner_user_id contains non-numeric values';
        END IF;
        ALTER TABLE spaces ALTER COLUMN owner_user_id TYPE BIGINT USING owner_user_id::BIGINT;
    END IF;
END $$;
