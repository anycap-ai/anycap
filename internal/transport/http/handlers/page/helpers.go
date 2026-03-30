package page

import (
	"context"
	"errors"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

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
		case "validation":
			return consts.StatusBadRequest
		case "not_found":
			return consts.StatusNotFound
		case "conflict":
			return consts.StatusConflict
		case "not_configured":
			return consts.StatusServiceUnavailable
		}
	}
	return consts.StatusInternalServerError
}
