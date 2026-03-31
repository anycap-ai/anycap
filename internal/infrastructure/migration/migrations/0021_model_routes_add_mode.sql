-- 0021: Add mode, mode_description, model_description to anycap_model_routes.
-- mode is the user-facing modality identifier (text-to-video, image-to-video, etc.)
-- algo_type remains as the internal NexusHub dispatch value.

-- 1. Add new columns
ALTER TABLE anycap_model_routes
    ADD COLUMN IF NOT EXISTS mode              VARCHAR(64)  NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS mode_description  TEXT         NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS model_description TEXT         NOT NULL DEFAULT '';

-- 2. Backfill mode from algo_type for existing rows where mode is empty
UPDATE anycap_model_routes SET mode = 'text-to-image'  WHERE mode = '' AND algo_type = 'txt_2_img';
UPDATE anycap_model_routes SET mode = 'image-to-image' WHERE mode = '' AND algo_type = 'img_2_img';
UPDATE anycap_model_routes SET mode = 'text-to-video'  WHERE mode = '' AND algo_type = 'txt_2_video';
UPDATE anycap_model_routes SET mode = 'image-to-video' WHERE mode = '' AND algo_type = 'img_2_video';
UPDATE anycap_model_routes SET mode = 'text-to-music'  WHERE mode = '' AND algo_type = 'text_2_music';

-- 3. Drop old unique constraint, add new one
ALTER TABLE anycap_model_routes
    DROP CONSTRAINT IF EXISTS anycap_model_routes_model_id_operation_algo_type_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'anycap_model_routes_model_id_operation_mode_key'
    ) THEN
        ALTER TABLE anycap_model_routes
            ADD CONSTRAINT anycap_model_routes_model_id_operation_mode_key
            UNIQUE (model_id, operation, mode);
    END IF;
END $$;
