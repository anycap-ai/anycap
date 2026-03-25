package apikey

import (
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func parseUserID(userID string) (int64, error) {
	numericUserID, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		return 0, model.ErrInternal
	}
	return numericUserID, nil
}

func formatUserID(userID int64) string {
	return strconv.FormatInt(userID, 10)
}
