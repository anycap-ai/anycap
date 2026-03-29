package auth

import (
	"io"
	"net/http"
	"net/url"
	"path"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func normalizeIssuerURL(raw string) (*url.URL, error) {
	if strings.TrimSpace(raw) == "" {
		return nil, model.ErrInternal
	}
	parsed, err := url.Parse(raw)
	if err != nil {
		return nil, model.ErrInternal
	}
	if parsed.Scheme == "" {
		parsed, err = url.Parse("https://" + raw)
		if err != nil {
			return nil, model.ErrInternal
		}
	}
	return parsed, nil
}

func joinURLPath(basePath, suffix string) string {
	cleanBase := strings.TrimSuffix(basePath, "/")
	return path.Join(cleanBase, suffix)
}

func mapAuthError(resp *http.Response) error {
	if resp != nil && resp.Body != nil {
		_, _ = io.Copy(io.Discard, resp.Body)
	}
	if resp == nil {
		return model.ErrInternal
	}
	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden || resp.StatusCode == http.StatusBadRequest {
		return model.ErrAuthInvalid
	}
	return model.ErrInternal
}
