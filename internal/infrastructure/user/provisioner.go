package userstore

import (
	"context"
	"database/sql"
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type Provisioner struct {
	db sqlstore.TxStarter
}

func NewProvisioner(db sqlstore.TxStarter) *Provisioner {
	return &Provisioner{db: db}
}

func (p *Provisioner) FindOrCreateByAuthIdentity(ctx context.Context, provider string, authUser model.AuthUser, now time.Time) (user model.User, created bool, err error) {
	if p == nil || p.db == nil || provider == "" || authUser.UserID == "" {
		return model.User{}, false, model.ErrInternal
	}

	tx, err := p.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return model.User{}, false, err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	user, err = getUserByIdentity(ctx, tx, provider, authUser.UserID)
	if err == nil {
		if err = updateUserAndIdentity(ctx, tx, user.ID, provider, authUser, now.UTC()); err != nil {
			return model.User{}, false, err
		}
		user, err = getUserByIdentity(ctx, tx, provider, authUser.UserID)
		if err != nil {
			return model.User{}, false, err
		}
		if err = tx.Commit(); err != nil {
			return model.User{}, false, err
		}
		return user, false, nil
	}
	if err != sql.ErrNoRows {
		return model.User{}, false, err
	}

	user, err = migratePasswordIdentityByVerifiedEmail(ctx, tx, provider, authUser, now.UTC())
	if err == nil {
		if err = tx.Commit(); err != nil {
			return model.User{}, false, err
		}
		return user, false, nil
	}
	if err != sql.ErrNoRows {
		return model.User{}, false, err
	}

	user, err = insertUserAndIdentity(ctx, tx, provider, authUser, now.UTC())
	if err != nil {
		// Concurrent request already created this identity — retry lookup.
		if isDuplicateKey(err) {
			_ = tx.Rollback()
			return p.FindOrCreateByAuthIdentity(ctx, provider, authUser, now)
		}
		return model.User{}, false, err
	}
	if err = tx.Commit(); err != nil {
		return model.User{}, false, err
	}
	return user, true, nil
}

func migratePasswordIdentityByVerifiedEmail(ctx context.Context, db sqlstore.DBTX, provider string, authUser model.AuthUser, now time.Time) (model.User, error) {
	if !isMigratableAuth0PasswordIdentity(provider, authUser) {
		return model.User{}, sql.ErrNoRows
	}

	rows, err := db.QueryContext(ctx, `
		SELECT ai.user_id, ai.external_subject
		FROM auth_identities ai
		WHERE ai.provider = $1
			AND lower(ai.email) = lower($2)
			AND ai.external_subject LIKE 'auth0|%'
		ORDER BY ai.user_id
		LIMIT 2
	`, provider, authUser.Email)
	if err != nil {
		return model.User{}, err
	}
	defer rows.Close()

	type candidate struct {
		userID          int64
		externalSubject string
	}
	var candidates []candidate
	for rows.Next() {
		var item candidate
		if err := rows.Scan(&item.userID, &item.externalSubject); err != nil {
			return model.User{}, err
		}
		candidates = append(candidates, item)
	}
	if err := rows.Err(); err != nil {
		return model.User{}, err
	}
	if len(candidates) != 1 {
		return model.User{}, sql.ErrNoRows
	}

	userID := strconv.FormatInt(candidates[0].userID, 10)
	if err := rekeyUserIdentity(ctx, db, userID, provider, candidates[0].externalSubject, authUser, now); err != nil {
		return model.User{}, err
	}
	return getUserByIdentity(ctx, db, provider, authUser.UserID)
}

func (p *Provisioner) GetUserByID(ctx context.Context, userID string) (model.User, error) {
	if p == nil || p.db == nil || userID == "" {
		return model.User{}, model.ErrInternal
	}

	numericID, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		return model.User{}, model.ErrInternal
	}

	row := p.db.QueryRowContext(ctx, `
		SELECT id, COALESCE(email, ''), COALESCE(name, ''), COALESCE(avatar_url, ''), status, created_at, updated_at
		FROM users
		WHERE id = $1
	`, numericID)

	var user model.User
	var fetchedID int64
	if err := row.Scan(&fetchedID, &user.Email, &user.Name, &user.AvatarURL, &user.Status, &user.CreatedAt, &user.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return model.User{}, model.ErrAuthInvalid
		}
		return model.User{}, err
	}
	user.ID = strconv.FormatInt(fetchedID, 10)
	return user, nil
}

func getUserByIdentity(ctx context.Context, db sqlstore.DBTX, provider, externalSubject string) (model.User, error) {
	row := db.QueryRowContext(ctx, `
		SELECT u.id, COALESCE(u.email, ''), COALESCE(u.name, ''), COALESCE(u.avatar_url, ''), u.status, u.created_at, u.updated_at
		FROM auth_identities ai
		INNER JOIN users u ON u.id = ai.user_id
		WHERE ai.provider = $1 AND ai.external_subject = $2
	`, provider, externalSubject)

	var numericID int64
	var user model.User
	err := row.Scan(&numericID, &user.Email, &user.Name, &user.AvatarURL, &user.Status, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return model.User{}, err
	}
	user.ID = strconv.FormatInt(numericID, 10)
	return user, nil
}

func updateUserAndIdentity(ctx context.Context, db sqlstore.DBTX, userID, provider string, authUser model.AuthUser, now time.Time) error {
	rawProfile, err := json.Marshal(authUser)
	if err != nil {
		return model.ErrInternal
	}
	numericID, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		return model.ErrInternal
	}

	if _, err = db.ExecContext(ctx, `
		UPDATE users
		SET email = COALESCE($2, email), name = COALESCE($3, name), avatar_url = COALESCE($4, avatar_url), updated_at = $5
		WHERE id = $1
	`, numericID, emptyStringToNil(authUser.Email), emptyStringToNil(authUser.Name), emptyStringToNil(authUser.Picture), now); err != nil {
		return err
	}
	if _, err = db.ExecContext(ctx, `
		UPDATE auth_identities
		SET email = COALESCE($4, email), raw_profile = $5, updated_at = $6
		WHERE user_id = $1 AND provider = $2 AND external_subject = $3
	`, numericID, provider, authUser.UserID, emptyStringToNil(authUser.Email), rawProfile, now); err != nil {
		return err
	}
	return nil
}

func rekeyUserIdentity(ctx context.Context, db sqlstore.DBTX, userID, provider, oldExternalSubject string, authUser model.AuthUser, now time.Time) error {
	rawProfile, err := json.Marshal(authUser)
	if err != nil {
		return model.ErrInternal
	}
	numericID, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		return model.ErrInternal
	}

	if _, err = db.ExecContext(ctx, `
		UPDATE users
		SET email = COALESCE($2, email), name = COALESCE($3, name), avatar_url = COALESCE($4, avatar_url), updated_at = $5
		WHERE id = $1
	`, numericID, emptyStringToNil(authUser.Email), emptyStringToNil(authUser.Name), emptyStringToNil(authUser.Picture), now); err != nil {
		return err
	}
	if _, err = db.ExecContext(ctx, `
		UPDATE auth_identities
		SET external_subject = $4, email = COALESCE($5, email), raw_profile = $6, updated_at = $7
		WHERE user_id = $1 AND provider = $2 AND external_subject = $3
	`, numericID, provider, oldExternalSubject, authUser.UserID, emptyStringToNil(authUser.Email), rawProfile, now); err != nil {
		return err
	}
	return nil
}

func insertUserAndIdentity(ctx context.Context, db sqlstore.DBTX, provider string, authUser model.AuthUser, now time.Time) (model.User, error) {
	rawProfile, err := json.Marshal(authUser)
	if err != nil {
		return model.User{}, model.ErrInternal
	}

	row := db.QueryRowContext(ctx, `
		WITH next_id AS (
			SELECT nextval('anycap_user_id_seq') AS id
		), ins_user AS (
			INSERT INTO users (id, email, name, avatar_url, status, created_at, updated_at)
			SELECT id, $1, $2, $3, $4, $5, $5
			FROM next_id
			WHERE id >= 2000000000 AND id < 3000000000
			RETURNING id, email, name, avatar_url, status, created_at, updated_at
		), ins_identity AS (
			INSERT INTO auth_identities (user_id, provider, external_subject, email, raw_profile, created_at, updated_at)
			SELECT id, $6, $7, $1, $8, $5, $5
			FROM ins_user
		)
		SELECT id, COALESCE(email, ''), COALESCE(name, ''), COALESCE(avatar_url, ''), status, created_at, updated_at
		FROM ins_user
	`, emptyStringToNil(authUser.Email), emptyStringToNil(authUser.Name), emptyStringToNil(authUser.Picture), model.UserStatusActive, now, provider, authUser.UserID, rawProfile)

	var numericID int64
	var user model.User
	if err := row.Scan(&numericID, &user.Email, &user.Name, &user.AvatarURL, &user.Status, &user.CreatedAt, &user.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return model.User{}, model.ErrInternal
		}
		return model.User{}, err
	}
	user.ID = strconv.FormatInt(numericID, 10)
	return user, nil
}

func isDuplicateKey(err error) bool {
	return err != nil && strings.Contains(err.Error(), "SQLSTATE 23505")
}

func emptyStringToNil(value string) any {
	if value == "" {
		return nil
	}
	return value
}

func isMigratableAuth0PasswordIdentity(provider string, authUser model.AuthUser) bool {
	return provider == "auth0" &&
		authUser.EmailVerified &&
		strings.TrimSpace(authUser.Email) != "" &&
		strings.HasPrefix(strings.TrimSpace(authUser.UserID), "auth0|")
}
