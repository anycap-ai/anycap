package app

import (
	"time"

	catalogapp "gitlab.knoffice.tech/engineering/anycap/internal/application/catalog"
	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/curatedcatalog"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

type sharedComposition struct {
	config               config.Config
	buildInfo            buildinfo.Info
	catalogRepo          port.CatalogRepository
	modelRouteRepo       port.ModelRouteRepository
	catalogService       *catalogapp.Service
	modelRouteService    *modelrouteapp.Service
	discoveryRefresher   *curatedcatalog.Refresher
	capProvider          port.CapabilitiesProvider
	cloudObjectStore     port.CloudObjectStore
	capGetExpiry         time.Duration
	artifactIngestClient port.ArtifactIngestClient
	imageExecutionClient port.NexusHubClient
	videoExecutionClient port.NexusHubClient
	musicExecutionClient port.NexusHubClient
	creditClient         port.CreditClient
	paymentClient        port.PaymentClient
	creditPacks          []model.CreditPackSpec
}

func buildSharedComposition(cfg config.Config, info buildinfo.Info) sharedComposition {
	catalogRepo, modelRouteRepo, refresher := buildCatalogAndModelRouteRepos(cfg)
	return sharedComposition{
		config:               cfg,
		buildInfo:            info,
		catalogRepo:          catalogRepo,
		modelRouteRepo:       modelRouteRepo,
		catalogService:       catalogapp.NewService(catalogRepo),
		modelRouteService:    modelrouteapp.NewService(modelRouteRepo),
		discoveryRefresher:   refresher,
		capProvider:          buildCapabilitiesProvider(cfg),
		cloudObjectStore:     buildCloudObjectStorage(cfg),
		capGetExpiry:         time.Duration(cfg.CloudS3.PresignGetExpiry) * time.Second,
		artifactIngestClient: buildArtifactIngestClient(cfg),
		imageExecutionClient: buildImageExecutionClient(cfg),
		videoExecutionClient: buildVideoExecutionClient(cfg),
		musicExecutionClient: buildMusicExecutionClient(cfg),
		creditClient:         buildCreditClient(cfg),
		paymentClient:        buildPaymentClient(cfg),
		creditPacks:          buildCreditPackSpecs(cfg.CreditPacks),
	}
}
