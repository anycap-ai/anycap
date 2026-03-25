package apikey

import (
	"context"
	"database/sql"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type Result interface {
	RowsAffected() (int64, error)
}

type Row interface {
	Scan(dest ...any) error
}

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...any) (Result, error)
	QueryRowContext(ctx context.Context, query string, args ...any) Row
}

type SQLDB struct {
	db *sql.DB
}

func OpenPostgres(dsn string) (*sql.DB, error) {
	return sql.Open("pgx", dsn)
}

func NewSQLDB(db *sql.DB) *SQLDB {
	return &SQLDB{db: db}
}

func (d *SQLDB) ExecContext(ctx context.Context, query string, args ...any) (Result, error) {
	return d.db.ExecContext(ctx, query, args...)
}

func (d *SQLDB) QueryRowContext(ctx context.Context, query string, args ...any) Row {
	return d.db.QueryRowContext(ctx, query, args...)
}
