package middleware

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
)

const requestErrorKey = "request_error"

func ReportError(c *app.RequestContext, err error) {
	if c == nil || err == nil {
		return
	}
	c.Set(requestErrorKey, err.Error())
}

func getReportedError(c *app.RequestContext) string {
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

func AccessLog() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		startedAt := time.Now()
		c.Next(ctx)

		statusCode := c.Response.StatusCode()
		latencyMS := time.Since(startedAt).Milliseconds()
		errorCode, errorMessage := extractResponseError(c.Response.Body())
		internalError := getReportedError(c)

		if statusCode >= 400 && (errorCode != "" || errorMessage != "" || internalError != "") {
			log.Printf(
				"request_id=%s method=%s path=%s status=%d latency_ms=%d error_code=%s error_message=%q internal_error=%q",
				GetRequestID(c),
				string(c.Method()),
				string(c.Path()),
				statusCode,
				latencyMS,
				errorCode,
				errorMessage,
				internalError,
			)
			return
		}

		log.Printf(
			"request_id=%s method=%s path=%s status=%d latency_ms=%d",
			GetRequestID(c),
			string(c.Method()),
			string(c.Path()),
			statusCode,
			latencyMS,
		)
	}
}
