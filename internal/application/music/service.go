package music

import (
	"context"
	"fmt"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type Service struct {
	catalog  port.CatalogRepository
	nexusHub port.NexusHubClient
	credit   port.CreditClient
	callLogs port.CallLogRepo
}

func NewService(catalog port.CatalogRepository, nexusHub port.NexusHubClient, credit port.CreditClient, callLogs port.CallLogRepo) *Service {
	return &Service{
		catalog:  catalog,
		nexusHub: nexusHub,
		credit:   credit,
		callLogs: callLogs,
	}
}

func (s *Service) Generate(ctx context.Context, req model.GenerateMusicRequest) (model.GenerateMusicResult, error) {
	if err := req.Validate(); err != nil {
		return model.GenerateMusicResult{}, err
	}
	if s == nil || s.catalog == nil || s.nexusHub == nil {
		return model.GenerateMusicResult{}, model.ErrMusicExecutionNotConfigured
	}
	if s.credit == nil {
		return model.GenerateMusicResult{}, model.ErrInternal
	}
	if req.UserID == "" {
		return model.GenerateMusicResult{}, model.ErrAuthInvalid
	}

	balance, err := s.credit.GetBalance(ctx, req.UserID)
	if err != nil {
		return model.GenerateMusicResult{}, err
	}
	if balance.Available < 1 {
		return model.GenerateMusicResult{}, model.ErrInsufficientCredit
	}

	spec, err := s.catalog.GetModel(ctx, model.CapabilityMusic, req.Model)
	if err != nil {
		return model.GenerateMusicResult{}, err
	}
	route, err := selectGenerateRoute(spec)
	if err != nil {
		return model.GenerateMusicResult{}, err
	}

	startedAt := time.Now()
	result, err := s.nexusHub.GenerateMusic(ctx, req, route)
	if err != nil {
		return model.GenerateMusicResult{}, err
	}

	cost := result.CreditCost
	if cost <= 0 {
		cost = 1
	}
	if err := s.credit.Deduct(ctx, req.UserID, cost, "music.generate", req.RequestID); err != nil {
		return model.GenerateMusicResult{}, model.ErrBillingUncertain
	}

	if s.callLogs != nil {
		_ = s.callLogs.Insert(ctx, model.CallLog{
			RequestID:  req.RequestID,
			UserID:     req.UserID,
			Capability: "music.generate",
			Model:      req.Model,
			Status:     result.Status,
			LatencyMS:  time.Since(startedAt).Milliseconds(),
			CreditCost: cost,
		})
	}

	return result, nil
}

func selectGenerateRoute(spec *model.ModelSpec) (model.RouteBinding, error) {
	if spec == nil {
		return model.RouteBinding{}, fmt.Errorf("%w: model spec is nil", model.ErrModelRouteNotConfigured)
	}

	opSpec, ok := spec.Operations[model.OperationGenerate]
	if !ok || len(opSpec.Routes) == 0 {
		return model.RouteBinding{}, fmt.Errorf("%w: model=%s operation=%s", model.ErrModelRouteNotConfigured, spec.ModelID, model.OperationGenerate)
	}

	var (
		selected model.RouteBinding
		found    bool
	)

	for _, route := range opSpec.Routes {
		if !route.Enabled || route.AbilityKey == "" || route.GenType == "" {
			continue
		}
		if !found || route.Priority > selected.Priority {
			selected = route
			found = true
		}
	}

	if !found {
		return model.RouteBinding{}, fmt.Errorf("%w: model=%s operation=%s", model.ErrModelRouteNotConfigured, spec.ModelID, model.OperationGenerate)
	}

	return selected, nil
}
