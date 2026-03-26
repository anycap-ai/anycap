package postgres

import (
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestAggregateModelSpecs_UsesRouteMetadata(t *testing.T) {
	specs := aggregateModelSpecs([]model.ModelRoute{
		{
			ModelID:     "flux-dev",
			Capability:  model.CapabilityImage,
			Operation:   model.OperationGenerate,
			AbilityKey:  "flux-primary",
			AlgoType:    "txt_2_img",
			DisplayName: "FLUX Dev",
			RouteType:   model.RouteTypeScheduler,
			Region:      "us",
			Tier:        "pro",
			Env:         "prod",
			Priority:    250,
			Enabled:     true,
			Status:      model.ModelRouteStatusActive,
		},
	})

	if len(specs) != 1 {
		t.Fatalf("expected 1 spec, got %d", len(specs))
	}

	routes := specs[0].Operations[model.OperationGenerate].Routes
	if len(routes) != 1 {
		t.Fatalf("expected 1 route, got %d", len(routes))
	}

	route := routes[0]
	if route.RouteType != model.RouteTypeScheduler {
		t.Fatalf("expected scheduler route type, got %s", route.RouteType)
	}
	if route.Priority != 250 {
		t.Fatalf("expected priority 250, got %d", route.Priority)
	}
	if !route.Enabled {
		t.Fatal("expected route to be enabled")
	}
	if route.Region != "us" || route.Tier != "pro" || route.Env != "prod" {
		t.Fatalf("expected route metadata to be preserved, got region=%s tier=%s env=%s", route.Region, route.Tier, route.Env)
	}
}

func TestHydrateRouteFields_ReadsExtraAndKeepsCustomMetadata(t *testing.T) {
	route := &model.ModelRoute{
		Extra: map[string]any{
			"route_type": model.RouteTypeScheduler,
			"region":     "eu",
			"tier":       "enterprise",
			"env":        "staging",
			"priority":   180,
			"enabled":    false,
			"vendor":     "acme",
		},
	}

	hydrateRouteFields(route)

	if route.RouteType != model.RouteTypeScheduler {
		t.Fatalf("expected scheduler route type, got %s", route.RouteType)
	}
	if route.Region != "eu" || route.Tier != "enterprise" || route.Env != "staging" {
		t.Fatalf("expected decoded route metadata, got region=%s tier=%s env=%s", route.Region, route.Tier, route.Env)
	}
	if route.Priority != 180 {
		t.Fatalf("expected priority 180, got %d", route.Priority)
	}
	if route.Enabled {
		t.Fatal("expected route to be disabled")
	}
	if route.Extra["vendor"] != "acme" {
		t.Fatalf("expected custom extra to be preserved, got %#v", route.Extra)
	}
	if _, ok := route.Extra["priority"]; ok {
		t.Fatalf("expected route metadata keys to be stripped from extra, got %#v", route.Extra)
	}
}
