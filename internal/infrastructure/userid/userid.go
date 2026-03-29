package userid

import (
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func Parse(value string) (int64, error) {
	numericID, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return 0, model.ErrInternal
	}
	return numericID, nil
}

func Format(value int64) string {
	return strconv.FormatInt(value, 10)
}
