CREATE OR REPLACE FUNCTION anycap_generate_external_id(id_prefix TEXT, random_len INT DEFAULT 16)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
	alphabet CONSTANT TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	result TEXT := '';
	pick INT;
BEGIN
	IF random_len <= 0 THEN
		random_len := 16;
	END IF;

	FOR i IN 1..random_len LOOP
		pick := FLOOR(random() * LENGTH(alphabet) + 1);
		result := result || SUBSTRING(alphabet, pick, 1);
	END LOOP;

	RETURN id_prefix || result;
END;
$$;

DO $$
DECLARE
	rec RECORD;
BEGIN
	FOR rec IN
		SELECT *
		FROM (
			VALUES
				('users', 'u_', 'idx_users_external_id_unique'),
				('spaces', 'sp_', 'idx_spaces_external_id_unique'),
				('drive_nodes', 'dn_', 'idx_drive_nodes_external_id_unique'),
				('upload_sessions', 'upl_', 'idx_upload_sessions_external_id_unique'),
				('page_sites', 'pg_', 'idx_page_sites_external_id_unique'),
				('page_versions', 'pv_', 'idx_page_versions_external_id_unique'),
				('caps_uploads', 'cu_', 'idx_caps_uploads_external_id_unique'),
				('anycap_model_routes', 'mr_', 'idx_anycap_model_routes_external_id_unique')
		) AS t(table_name, prefix, index_name)
	LOOP
		IF to_regclass('public.' || rec.table_name) IS NULL THEN
			CONTINUE;
		END IF;

		EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS external_id TEXT', rec.table_name);
		EXECUTE format('ALTER TABLE %I ALTER COLUMN external_id SET DEFAULT anycap_generate_external_id(%L)', rec.table_name, rec.prefix);
		EXECUTE format('UPDATE %I SET external_id = anycap_generate_external_id(%L) WHERE external_id IS NULL', rec.table_name, rec.prefix);
		EXECUTE format('ALTER TABLE %I ALTER COLUMN external_id SET NOT NULL', rec.table_name);
		EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS %I ON %I (external_id)', rec.index_name, rec.table_name);
	END LOOP;
END;
$$;
