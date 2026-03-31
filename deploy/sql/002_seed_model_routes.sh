#!/bin/bash
# Seed anycap_model_routes from CSV.
# Runs as part of docker-entrypoint-initdb.d on first Postgres init.
#
# To add new model routes, just append rows to anycap_model_routes.csv.
# Columns: id, model_id, capability, operation, ability_key, algo_type,
#          mode, display_name, mode_description, model_description,
#          status, extra, created_at, updated_at, external_id

set -euo pipefail

CSV_FILE="/docker-entrypoint-initdb.d/anycap_model_routes.csv"

if [ ! -f "$CSV_FILE" ]; then
    echo "seed: $CSV_FILE not found, skipping"
    exit 0
fi

echo "seed: importing model routes from CSV..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
    \copy anycap_model_routes (id, model_id, capability, operation, ability_key, algo_type, display_name, status, extra, created_at, updated_at, external_id, mode, mode_description, model_description) FROM '$CSV_FILE' WITH (FORMAT csv, FORCE_NOT_NULL (algo_type, mode, display_name, mode_description, model_description, status, external_id));
    SELECT setval('anycap_model_routes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM anycap_model_routes));
SQL

ROW_COUNT=$(psql -t -A --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "SELECT count(*) FROM anycap_model_routes;")
echo "seed: done ($ROW_COUNT rows imported)"
