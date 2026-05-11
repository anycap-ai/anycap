package integration

import (
	"context"
	"net/http"
	"strings"
	"testing"

	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	imagehandler "gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/image"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

func TestImageGenerate_WatermarkParam(t *testing.T) {
	apiKeys := apikey.NewMemoryService()
	created, err := apiKeys.CreateAPIKey(context.Background(), "test_user", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}

	catalog := nexushub.NewCatalogStubWith([]model.ModelSpec{
		{
			ModelID:     "flux-dev",
			Capability:  model.CapabilityImage,
			DisplayName: "FLUX Dev",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					RequestHints: map[string]any{"prompt": map[string]any{"type": "string"}, "model": map[string]any{"type": "string", "default": "flux-dev"}},
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "flux-dev",
						GenType:    string(model.CapabilityImage),
						AlgoType:   "txt_2_img",
						Mode:       model.ModeTextToImage,
						Priority:   100,
						Enabled:    true,
					}},
				},
			},
		},
	})
	imageSvc := imageapp.NewService(catalog, nexushub.NewStubClient(), credit.NewStubClient(nil), nil)

	h := server.Default()
	protected := h.Group("/v1", middleware.Auth(apiKeys, nil), middleware.FeatureGate(integrationFeatureProvider{}))
	imagehandler.NewHandler(imageSvc).RegisterRoutes(protected)

	authz := ut.Header{Key: "Authorization", Value: "Bearer " + created.RawKey}
	contentType := ut.Header{Key: "Content-Type", Value: "application/json"}

	body := `{"prompt":"a cat","model":"flux-dev","watermark":true}`
	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate",
		&ut.Body{Body: strings.NewReader(body), Len: len(body)},
		authz, contentType,
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
}
