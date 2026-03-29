package sqlstore

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

type Rows interface {
	Next() bool
	Scan(dest ...any) error
	Close() error
	Err() error
}

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...any) (Result, error)
	QueryContext(ctx context.Context, query string, args ...any) (Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) Row
}

type Tx interface {
	DBTX
	Commit() error
	Rollback() error
}

type TxStarter interface {
	DBTX
	BeginTx(ctx context.Context, opts *sql.TxOptions) (Tx, error)
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

func (d *SQLDB) QueryContext(ctx context.Context, query string, args ...any) (Rows, error) {
	return d.db.QueryContext(ctx, query, args...)
}

func (d *SQLDB) QueryRowContext(ctx context.Context, query string, args ...any) Row {
	return d.db.QueryRowContext(ctx, query, args...)
}

func (d *SQLDB) BeginTx(ctx context.Context, opts *sql.TxOptions) (Tx, error) {
	tx, err := d.db.BeginTx(ctx, opts)
	if err != nil {
		return nil, err
	}
	return &SQLTx{tx: tx}, nil
}

type SQLTx struct {
	tx *sql.Tx
}

func (t *SQLTx) ExecContext(ctx context.Context, query string, args ...any) (Result, error) {
	return t.tx.ExecContext(ctx, query, args...)
}

func (t *SQLTx) QueryContext(ctx context.Context, query string, args ...any) (Rows, error) {
	return t.tx.QueryContext(ctx, query, args...)
}

func (t *SQLTx) QueryRowContext(ctx context.Context, query string, args ...any) Row {
	return t.tx.QueryRowContext(ctx, query, args...)
}

func (t *SQLTx) Commit() error {
	return t.tx.Commit()
}

func (t *SQLTx) Rollback() error {
	return t.tx.Rollback()
}
