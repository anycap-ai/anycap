package middleware

import (
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
)

const requestErrorKey = "request_error"

func ReportError(c requestErrorStore, err error) {
	if c == nil || err == nil {
		return
	}
	c.Set(requestErrorKey, err.Error())
}

type requestErrorStore interface {
	Set(string, any)
	Get(string) (any, bool)
}

func getReportedError(c requestErrorStore) string {
	if c == nil {
		return ""
	}
	value, ok := c.Get(requestErrorKey)
	if !ok {
		return ""
	}
	message, ok := value.(string)
	if !ok {
		return ""
	}
	return message
}

func extractResponseError(body []byte) (string, string) {
	if len(body) == 0 {
		return "", ""
	}

	var env struct {
		Error *dto.ErrorPayload `json:"error"`
	}
	if err := json.Unmarshal(body, &env); err != nil || env.Error == nil {
		return "", ""
	}
	return env.Error.Code, env.Error.Message
}
