package userstore

import (
	"context"
	"database/sql"
	"encoding/json"
	"strconv"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
)

type Provisioner struct {
	db apikey.TxStarter
}

func NewProvisioner(db apikey.TxStarter) *Provisioner {
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

	user, err = insertUserAndIdentity(ctx, tx, provider, authUser, now.UTC())
	if err != nil {
		return model.User{}, false, err
	}
	if err = tx.Commit(); err != nil {
		return model.User{}, false, err
	}
	return user, true, nil
}

func getUserByIdentity(ctx context.Context, db apikey.DBTX, provider, externalSubject string) (model.User, error) {
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

func updateUserAndIdentity(ctx context.Context, db apikey.DBTX, userID, provider string, authUser model.AuthUser, now time.Time) error {
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
		SET email = $2, name = $3, avatar_url = $4, updated_at = $5
		WHERE id = $1
	`, numericID, emptyStringToNil(authUser.Email), emptyStringToNil(authUser.Name), emptyStringToNil(authUser.Picture), now); err != nil {
		return err
	}
	if _, err = db.ExecContext(ctx, `
		UPDATE auth_identities
		SET email = $4, raw_profile = $5, updated_at = $6
		WHERE user_id = $1 AND provider = $2 AND external_subject = $3
	`, numericID, provider, authUser.UserID, emptyStringToNil(authUser.Email), rawProfile, now); err != nil {
		return err
	}
	return nil
}

func insertUserAndIdentity(ctx context.Context, db apikey.DBTX, provider string, authUser model.AuthUser, now time.Time) (model.User, error) {
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

func emptyStringToNil(value string) any {
	if value == "" {
		return nil
	}
	return value
}
