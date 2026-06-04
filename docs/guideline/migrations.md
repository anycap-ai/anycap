# Migration Guidelines

## Purpose

Use this when changing SQL schema, embedded migrations, local seed SQL, or
database-backed resource IDs.

## Source of Truth

- Embedded migrations:
  `internal/infrastructure/migration/migrations/`
- Migration runner: `internal/infrastructure/migration/`
- Local seed SQL: `deploy/sql/`
- External ID rules: `docs/guideline/external-id.md`

## Embedded Migration Rules

- Migrations must be idempotent. Use `IF NOT EXISTS`, guarded `DO $$` blocks,
  conditional index creation, or equivalent checks.
- Once a migration has been deployed to any environment, do not edit it.
- Add a new sequential migration for follow-up changes.
- Keep migration filenames ordered and descriptive.
- Do not assume a `schema_migrations` table exists unless the runner has been
  changed to track it.

## Local Seed SQL

Files under `deploy/sql/` are for local reset/dev data. They can be rewritten
to represent the intended current local schema or seed state.

Do not use local seed SQL as a substitute for an embedded production migration.

## External Resource Columns

When a new SQL-backed resource is externally visible:

- Add an `external_id` column through migration.
- Backfill or generate values safely for existing rows.
- Add a unique index or constraint where appropriate.
- Wire ID mapping in `IDResolver` and `IDMapper`.

## Review Checklist

- Can this migration run more than once?
- Can it run against a partially migrated database?
- Does it avoid rewriting deployed migration files?
- Does it preserve external ID and storage path safety?
- Are related repos/tests updated?
