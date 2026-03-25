package apikey

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type LoginSessionRepo struct {
	db DBTX
}

func NewLoginSessionRepo(db DBTX) *LoginSessionRepo {
	return &LoginSessionRepo{db: db}
}

func (r *LoginSessionRepo) CreateSession(ctx context.Context, session model.LoginSession) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO login_sessions (
			id, flow_type, state, code_verifier, redirect_uri,
			device_code, user_code, auth0_subject, status, expires_at, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, session.ID, session.FlowType, emptyToNil(session.State), emptyToNil(session.CodeVerifier), emptyToNil(session.RedirectURI), emptyToNil(session.DeviceCode), emptyToNil(session.UserCode), emptyToNil(session.Auth0Subject), session.Status, session.ExpiresAt, session.CreatedAt)
	return err
}

func (r *LoginSessionRepo) GetByID(ctx context.Context, sessionID string) (model.LoginSession, error) {
	return r.getOne(ctx, `
		SELECT
			id,
			flow_type,
			COALESCE(state, ''),
			COALESCE(code_verifier, ''),
			COALESCE(redirect_uri, ''),
			COALESCE(device_code, ''),
			COALESCE(user_code, ''),
			COALESCE(auth0_subject, ''),
			status,
			expires_at,
			created_at
		FROM login_sessions
		WHERE id = $1
	`, sessionID)
}

func (r *LoginSessionRepo) GetByState(ctx context.Context, state string) (model.LoginSession, error) {
	return r.getOne(ctx, `
		SELECT
			id,
			flow_type,
			COALESCE(state, ''),
			COALESCE(code_verifier, ''),
			COALESCE(redirect_uri, ''),
			COALESCE(device_code, ''),
			COALESCE(user_code, ''),
			COALESCE(auth0_subject, ''),
			status,
			expires_at,
			created_at
		FROM login_sessions
		WHERE state = $1
	`, state)
}

func (r *LoginSessionRepo) MarkAuthorized(ctx context.Context, sessionID, auth0Subject string, authorizedAt time.Time) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE login_sessions
		SET auth0_subject = $2, status = $3, authorized_at = $4
		WHERE id = $1
	`, sessionID, auth0Subject, model.LoginSessionStatusAuthorized, authorizedAt)
	return err
}

func (r *LoginSessionRepo) MarkCompleted(ctx context.Context, sessionID, apiKeyID string, completedAt time.Time) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE login_sessions
		SET api_key_id = $2, status = $3, completed_at = $4
		WHERE id = $1
	`, sessionID, apiKeyID, model.LoginSessionStatusCompleted, completedAt)
	return err
}

func (r *LoginSessionRepo) getOne(ctx context.Context, query string, arg string) (model.LoginSession, error) {
	row := r.db.QueryRowContext(ctx, query, arg)

	var session model.LoginSession
	err := row.Scan(
		&session.ID,
		&session.FlowType,
		&session.State,
		&session.CodeVerifier,
		&session.RedirectURI,
		&session.DeviceCode,
		&session.UserCode,
		&session.Auth0Subject,
		&session.Status,
		&session.ExpiresAt,
		&session.CreatedAt,
	)
	if err != nil {
		return model.LoginSession{}, err
	}

	return session, nil
}

func emptyToNil(s string) any {
	if s == "" {
		return nil
	}
	return s
}
