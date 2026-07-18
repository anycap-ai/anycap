package app

import (
	audioapp "gitlab.knoffice.tech/engineering/anycap/internal/application/audio"
	billingapp "gitlab.knoffice.tech/engineering/anycap/internal/application/billing"
	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	musicapp "gitlab.knoffice.tech/engineering/anycap/internal/application/music"
	usageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/usage"
	videoapp "gitlab.knoffice.tech/engineering/anycap/internal/application/video"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/postgres"
)

type mediaComposition struct {
	imageService        *imageapp.Service
	videoService        *videoapp.Service
	musicService        *musicapp.Service
	audioService        *audioapp.Service
	capabilitiesService *capapp.Service
	usageSyncWorker     *usageapp.Worker
	billingWorker       *billingapp.Worker
}

func buildStubMediaComposition(_ config.Config, shared sharedComposition, billingComp billingComposition) mediaComposition {
	imageService := imageapp.NewService(shared.catalogRepo, shared.imageExecutionClient, shared.creditClient, billingComp.callLogs)
	imageService.SetUsageWriter(billingComp.usageWriter)
	imageService.SetBillingCoordinator(billingComp.billingService)
	videoService := videoapp.NewService(shared.catalogRepo, shared.videoExecutionClient, shared.creditClient, billingComp.callLogs)
	videoService.SetUsageWriter(billingComp.usageWriter)
	videoService.SetBillingCoordinator(billingComp.billingService)
	musicService := musicapp.NewService(shared.catalogRepo, shared.musicExecutionClient, shared.creditClient, billingComp.callLogs)
	musicService.SetUsageWriter(billingComp.usageWriter)
	musicService.SetBillingCoordinator(billingComp.billingService)
	audioService := audioapp.NewService(shared.catalogRepo, shared.audioExecutionClient, shared.creditClient, billingComp.callLogs)
	audioService.SetUsageWriter(billingComp.usageWriter)
	audioService.SetBillingCoordinator(billingComp.billingService)
	capService := capapp.NewService(shared.capProvider, shared.cloudObjectStore, capapp.WithPresignGetExpiry(shared.capGetExpiry))
	capService.SetCreditClient(shared.creditClient)
	capService.SetCallLogRepo(billingComp.callLogs)
	capService.SetBillingCoordinator(billingComp.billingService)

	return mediaComposition{
		imageService:        imageService,
		videoService:        videoService,
		musicService:        musicService,
		audioService:        audioService,
		capabilitiesService: capService,
	}
}

func buildPersistentMediaComposition(cfg config.Config, shared sharedComposition, billingComp billingComposition, storageComp storageComposition) mediaComposition {
	capsUploadRepo := postgres.NewCapsUploadRepo(storageComp.db)
	capsTaskRepo := postgres.NewCapsTaskRepo(storageComp.db)
	capsTaskArtifactRepo := postgres.NewCapsTaskArtifactRepo(storageComp.db)
	capsArtifactRepo := postgres.NewCapsArtifactRepo(storageComp.db)
	capService := capapp.NewService(
		shared.capProvider,
		shared.cloudObjectStore,
		capapp.WithAudit(storageComp.spaceService, capsUploadRepo, storageComp.storageObjectRepo, capsTaskRepo, capsTaskArtifactRepo),
		capapp.WithPresignGetExpiry(shared.capGetExpiry),
	)
	capService.SetCreditClient(shared.creditClient)
	capService.SetCallLogRepo(billingComp.callLogs)
	capService.SetBillingCoordinator(billingComp.billingService)

	imageService := imageapp.NewService(shared.catalogRepo, shared.imageExecutionClient, shared.creditClient, billingComp.callLogs)
	imageService.SetUsageWriter(billingComp.usageWriter)
	imageService.SetBillingCoordinator(billingComp.billingService)
	imageService.SetUploadRefResolver(capService)
	videoService := videoapp.NewService(shared.catalogRepo, shared.videoExecutionClient, shared.creditClient, billingComp.callLogs)
	videoService.SetUsageWriter(billingComp.usageWriter)
	videoService.SetBillingCoordinator(billingComp.billingService)
	videoService.SetUploadRefResolver(capService)
	musicService := musicapp.NewService(shared.catalogRepo, shared.musicExecutionClient, shared.creditClient, billingComp.callLogs)
	musicService.SetUsageWriter(billingComp.usageWriter)
	musicService.SetBillingCoordinator(billingComp.billingService)
	audioService := audioapp.NewService(shared.catalogRepo, shared.audioExecutionClient, shared.creditClient, billingComp.callLogs)
	audioService.SetUsageWriter(billingComp.usageWriter)
	audioService.SetBillingCoordinator(billingComp.billingService)
	audioService.SetUploadRefResolver(capService)

	artifactPublisher := buildArtifactPublisher(
		cfg,
		shared.artifactIngestClient,
		capsArtifactRepo,
		storageComp.storageObjectRepo,
		storageComp.edgeGrantStore,
		storageComp.spaceService,
		shared.cloudObjectStore,
	)
	if artifactPublisher != nil {
		imageService.SetArtifactPublisher(artifactPublisher)
		videoService.SetArtifactPublisher(artifactPublisher)
		musicService.SetArtifactPublisher(artifactPublisher)
		audioService.SetArtifactPublisher(artifactPublisher)
	}

	var usageSyncWorker *usageapp.Worker
	if cfg.UsageSyncEnabled && hasImageExecutionProvider(cfg) {
		usageSyncWorker = usageapp.NewWorker(
			usageapp.NewService(billingComp.usageSyncRepo, shared.imageExecutionClient),
			usageapp.WorkerConfig{
				PollInterval: cfg.UsageSyncPollInterval,
				BatchSize:    cfg.UsageSyncBatchSize,
			},
		)
	}

	var billingWorker *billingapp.Worker
	if shared.creditClient != nil {
		billingNexusClient := shared.imageExecutionClient
		switch {
		case hasImageExecutionProvider(cfg):
			billingNexusClient = shared.imageExecutionClient
		case hasVideoExecutionProvider(cfg):
			billingNexusClient = shared.videoExecutionClient
		case hasMusicExecutionProvider(cfg):
			billingNexusClient = shared.musicExecutionClient
		}
		billingWorker = billingapp.NewWorker(
			billingComp.billingRepo,
			billingComp.billingService,
			billingNexusClient,
			shared.creditClient,
			billingapp.WorkerConfig{},
		)
	}

	return mediaComposition{
		imageService:        imageService,
		videoService:        videoService,
		musicService:        musicService,
		audioService:        audioService,
		capabilitiesService: capService,
		usageSyncWorker:     usageSyncWorker,
		billingWorker:       billingWorker,
	}
}
