package loginsession

import (
	"context"
	"database/sql"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/userid"
)

type LoginSessionRepo struct {
	db sqlstore.DBTX
}

func NewLoginSessionRepo(db sqlstore.DBTX) *LoginSessionRepo {
	return &LoginSessionRepo{db: db}
}

func (r *LoginSessionRepo) CreateSession(ctx context.Context, session model.LoginSession) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO login_sessions (
			id, flow_type, state, user_code, browser_token, poll_token,
			user_code_expires_at, authorized_user_id, auth0_subject,
			auth_user_email, auth_user_name, auth_user_picture,
			status, expires_at, created_at, last_polled_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
	`, session.ID, session.FlowType, emptyToNil(session.State), emptyToNil(session.UserCode), emptyToNil(session.BrowserToken), emptyToNil(session.PollToken), timeToNil(session.UserCodeExpiresAt), stringToInt64Nil(session.AuthorizedUserID), emptyToNil(session.Auth0Subject), emptyToNil(session.AuthUserEmail), emptyToNil(session.AuthUserName), emptyToNil(session.AuthUserPicture), session.Status, session.ExpiresAt, session.CreatedAt, timeToNil(session.LastPolledAt))
	return err
}

func (r *LoginSessionRepo) GetByID(ctx context.Context, sessionID string) (model.LoginSession, error) {
	return r.getOne(ctx, `
		SELECT
			id,
			flow_type,
			COALESCE(state, ''),
			COALESCE(user_code, ''),
			COALESCE(browser_token, ''),
			COALESCE(poll_token, ''),
			user_code_expires_at,
			authorized_user_id,
			COALESCE(auth0_subject, ''),
			COALESCE(auth_user_email, ''),
			COALESCE(auth_user_name, ''),
			COALESCE(auth_user_picture, ''),
			last_polled_at,
			status,
			expires_at,
			created_at
		FROM login_sessions
		WHERE id = $1
		`, sessionID)
}

func (r *LoginSessionRepo) GetByUserCode(ctx context.Context, userCode string) (model.LoginSession, error) {
	return r.getOne(ctx, `
		SELECT
			id,
			flow_type,
			COALESCE(state, ''),
			COALESCE(user_code, ''),
			COALESCE(browser_token, ''),
			COALESCE(poll_token, ''),
			user_code_expires_at,
			authorized_user_id,
			COALESCE(auth0_subject, ''),
			COALESCE(auth_user_email, ''),
			COALESCE(auth_user_name, ''),
			COALESCE(auth_user_picture, ''),
			last_polled_at,
			status,
			expires_at,
			created_at
		FROM login_sessions
	WHERE user_code = $1
	`, userCode)
}

func (r *LoginSessionRepo) GetByBrowserToken(ctx context.Context, browserToken string) (model.LoginSession, error) {
	return r.getOne(ctx, `
		SELECT
			id,
			flow_type,
			COALESCE(state, ''),
			COALESCE(user_code, ''),
			COALESCE(browser_token, ''),
			COALESCE(poll_token, ''),
			user_code_expires_at,
			authorized_user_id,
			COALESCE(auth0_subject, ''),
			COALESCE(auth_user_email, ''),
			COALESCE(auth_user_name, ''),
			COALESCE(auth_user_picture, ''),
			last_polled_at,
			status,
			expires_at,
			created_at
		FROM login_sessions
		WHERE browser_token = $1
	`, browserToken)
}

func (r *LoginSessionRepo) MarkCompleted(ctx context.Context, sessionID, apiKeyID string, completedAt time.Time) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE login_sessions
		SET api_key_id = $2, status = $3, completed_at = $4
		WHERE id = $1
	`, sessionID, apiKeyID, model.LoginSessionStatusCompleted, completedAt)
	return err
}

func (r *LoginSessionRepo) MarkVerified(ctx context.Context, sessionID string, authUser model.AuthUser, verifiedAt time.Time) error {
	numericID, err := userid.Parse(authUser.UserID)
	if err != nil {
		return model.ErrInternal
	}
	_, err = r.db.ExecContext(ctx, `
		UPDATE login_sessions
		SET authorized_user_id = $2, auth_user_email = $3, auth_user_name = $4, auth_user_picture = $5, status = $6, authorized_at = $7
		WHERE id = $1
	`, sessionID, numericID, emptyToNil(authUser.Email), emptyToNil(authUser.Name), emptyToNil(authUser.Picture), model.LoginSessionStatusAuthorized, verifiedAt)
	return err
}

func (r *LoginSessionRepo) MarkPolled(ctx context.Context, sessionID string, polledAt time.Time) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE login_sessions
		SET last_polled_at = $2
		WHERE id = $1
	`, sessionID, polledAt)
	return err
}

func (r *LoginSessionRepo) getOne(ctx context.Context, query string, arg string) (model.LoginSession, error) {
	row := r.db.QueryRowContext(ctx, query, arg)

	var session model.LoginSession
	var userCodeExpiresAt sql.NullTime
	var authorizedUserID sql.NullInt64
	var lastPolledAt sql.NullTime
	err := row.Scan(
		&session.ID,
		&session.FlowType,
		&session.State,
		&session.UserCode,
		&session.BrowserToken,
		&session.PollToken,
		&userCodeExpiresAt,
		&authorizedUserID,
		&session.Auth0Subject,
		&session.AuthUserEmail,
		&session.AuthUserName,
		&session.AuthUserPicture,
		&lastPolledAt,
		&session.Status,
		&session.ExpiresAt,
		&session.CreatedAt,
	)
	if err != nil {
		return model.LoginSession{}, err
	}
	if userCodeExpiresAt.Valid {
		session.UserCodeExpiresAt = userCodeExpiresAt.Time
	}
	if authorizedUserID.Valid {
		session.AuthorizedUserID = int64ToString(authorizedUserID.Int64)
	}
	if lastPolledAt.Valid {
		session.LastPolledAt = lastPolledAt.Time
	}

	return session, nil
}

func emptyToNil(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func timeToNil(t time.Time) any {
	if t.IsZero() {
		return nil
	}
	return t
}

func stringToInt64Nil(value string) any {
	if value == "" {
		return nil
	}
	id, err := userid.Parse(value)
	if err != nil {
		return nil
	}
	return id
}

func int64ToString(value int64) string {
	return userid.Format(value)
}
