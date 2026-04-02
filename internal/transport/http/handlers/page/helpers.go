package page

import (
	"context"
	"errors"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) resolvePageSiteID(ctx context.Context, rawID string) (int64, error) {
	return h.resolver.ResolvePageSiteID(ctx, rawID)
}

func (h *Handler) resolvePageVersionID(ctx context.Context, rawID string) (int64, error) {
	return h.resolver.ResolvePageVersionID(ctx, rawID)
}

func (h *Handler) resolveUploadSessionID(ctx context.Context, rawID string) (int64, error) {
	return h.resolver.ResolveUploadSessionID(ctx, rawID)
}

func (h *Handler) presentPageSite(ctx context.Context, site *model.PageSite) (presenter.PageSiteDTO, error) {
	return presenter.PresentPageSite(ctx, h.mapper, site)
}

func (h *Handler) presentPageSites(ctx context.Context, sites []model.PageSite) ([]presenter.PageSiteDTO, error) {
	return presenter.PresentPageSites(ctx, h.mapper, sites)
}

func (h *Handler) presentPageVersion(ctx context.Context, version *model.PageVersion) (presenter.PageVersionDTO, error) {
	return presenter.PresentPageVersion(ctx, h.mapper, version)
}

func (h *Handler) presentPageVersions(ctx context.Context, versions []model.PageVersion) ([]presenter.PageVersionDTO, error) {
	return presenter.PresentPageVersions(ctx, h.mapper, versions)
}

func (h *Handler) presentPageVersionPresign(ctx context.Context, input *model.PageVersionPresignResult) (presenter.PageVersionPresignDTO, error) {
	return presenter.PresentPageVersionPresign(ctx, h.mapper, input)
}

func statusCodeForPageError(err error) int {
	if err == nil {
		return consts.StatusOK
	}
	var domainErr *model.DomainError
	if errors.As(err, &domainErr) {
		switch domainErr.Code {
		case "validation", "quota_exceeded", "limit_reached":
			return consts.StatusBadRequest
		case "not_found":
			return consts.StatusNotFound
		case "conflict":
			return consts.StatusConflict
		case "not_configured":
			return consts.StatusServiceUnavailable
		case "payload_too_large":
			return consts.StatusRequestEntityTooLarge
		case "too_many_requests":
			return consts.StatusTooManyRequests
		}
	}
	return consts.StatusInternalServerError
}

// writePageError writes a structured error response, using the DomainError code
// when available (e.g. "quota_exceeded", "payload_too_large") for precise client-side matching,
// falling back to the handler-level operation code otherwise.
func writePageError(c context.Context, ctx *app.RequestContext, err error, fallbackCode string) {
	code := fallbackCode
	var domainErr *model.DomainError
	if errors.As(err, &domainErr) {
		code = domainErr.Code
	}
	handlers.WriteError(c, ctx, statusCodeForPageError(err), code, err.Error())
}
