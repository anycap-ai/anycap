package apikey

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"path/filepath"
	"slices"
	"strings"
)

//go:embed migrations/*.sql
var embeddedMigrations embed.FS

func ApplyMigrations(ctx context.Context, db DBTX) error {
	subFS, err := fs.Sub(embeddedMigrations, "migrations")
	if err != nil {
		return fmt.Errorf("open embedded migrations: %w", err)
	}

	return ApplyMigrationsFS(ctx, db, subFS)
}

func ApplyMigrationsFS(ctx context.Context, db DBTX, migrations fs.FS) error {
	entries, err := fs.ReadDir(migrations, ".")
	if err != nil {
		return fmt.Errorf("read migrations: %w", err)
	}

	files := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()
		if strings.HasPrefix(name, ".") || filepath.Ext(name) != ".sql" {
			continue
		}

		files = append(files, name)
	}

	slices.Sort(files)

	for _, name := range files {
		query, err := fs.ReadFile(migrations, name)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", name, err)
		}

		if _, err := db.ExecContext(ctx, string(query)); err != nil {
			return fmt.Errorf("apply migration %s: %w", name, err)
		}
	}

	return nil
}
