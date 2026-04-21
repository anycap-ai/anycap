package app

import (
	"database/sql"

	driveapp "gitlab.knoffice.tech/engineering/anycap/internal/application/drive"
	pageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/page"
	spaceapp "gitlab.knoffice.tech/engineering/anycap/internal/application/space"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/kvsync"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/postgres"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type storageComposition struct {
	db                *sqlstore.SQLDB
	spaceService      *spaceapp.Service
	driveService      *driveapp.Service
	pageService       *pageapp.Service
	quotaProvider     port.StorageQuotaProvider
	uploadSessionRepo port.UploadSessionRepository
	storageObjectRepo port.StorageObjectRepository
	edgeGrantStore    port.EdgeGrantStore
	kvSyncWorker      *kvsync.Worker
}

func buildPersistentStorageComposition(cfg config.Config, sqlDB *sql.DB, shared sharedComposition) (storageComposition, error) {
	db, err := newExternalDB(cfg, sqlDB)
	if err != nil {
		return storageComposition{}, err
	}

	spaceRepo := postgres.NewSpaceRepo(db)
	spaceService := spaceapp.NewService(spaceRepo)
	quotaProvider := config.NewStorageQuotaProvider(cfg)
	driveNodeRepo := postgres.NewDriveNodeRepo(db)
	driveShareRepo := postgres.NewDriveShareRepo(db)
	uploadSessionRepo := postgres.NewUploadSessionRepo(db)
	storageObjectRepo := postgres.NewStorageObjectRepo(db)
	pageSiteRepo := postgres.NewPageSiteRepo(db)
	pageSlugRepo := postgres.NewPageSlugRepo(db)
	pageVersionRepo := postgres.NewPageVersionRepo(db)
	kvSyncJobRepo := postgres.NewKVSyncJobRepo(db)
	kvClient := buildKVSyncClient(cfg)
	edgeGrantStore := buildEdgeGrantStore(cfg)
	driveProjector := kvsync.NewDriveProjector(kvClient, driveNodeRepo, driveShareRepo, storageObjectRepo)
	pageProjector := kvsync.NewPageProjector(kvClient, pageSiteRepo, pageVersionRepo, cfg.PageHostFormat)
	kvSyncWorker := kvsync.NewWorker(kvSyncJobRepo, map[string]kvsync.Projector{
		model.KVSyncJobTypeDriveFileMetaSync:    driveProjector,
		model.KVSyncJobTypeDriveDirChildrenSync: driveProjector,
		model.KVSyncJobTypeDriveDirMetaSync:     driveProjector,
		model.KVSyncJobTypeDriveShareSync:       driveProjector,
		model.KVSyncJobTypeDriveDirTreeDelete:   driveProjector,
		model.KVSyncJobTypePageHostSync:         pageProjector,
		model.KVSyncJobTypePageHostDelete:       pageProjector,
	}, kvsync.WorkerConfig{
		WorkerID:     "anycap-server",
		PollInterval: cfg.KVSyncPollInterval,
		LockTTL:      cfg.KVSyncLockTTL,
	})
	kvSyncWaiter := kvsync.NewWaiter(kvSyncJobRepo, kvsync.WaiterConfig{
		Timeout: cfg.KVSyncWaitTimeout,
	})

	var driveKVSyncOption driveapp.ServiceOption
	var pageKVSyncOption pageapp.ServiceOption
	if cfg.KVSyncEnabled {
		driveKVSyncOption = driveapp.WithKVSync(kvSyncJobRepo, kvSyncWaiter, cfg.KVSyncWaitEnabled)
		pageKVSyncOption = pageapp.WithKVSync(kvSyncJobRepo, kvSyncWaiter, cfg.KVSyncWaitEnabled)
	}

	return storageComposition{
		db:           db,
		spaceService: spaceService,
		driveService: driveapp.NewService(
			spaceService,
			driveNodeRepo,
			driveapp.WithUpload(uploadSessionRepo, storageObjectRepo, shared.cloudObjectStore),
			driveapp.WithShare(driveShareRepo, cfg.PasswordPepper, cfg.DriveShareBaseURL),
			driveapp.WithEdgeAccess(edgeGrantStore, cfg.DriveAccessTTLSeconds, deriveDriveAccessBaseURL(cfg.DriveShareBaseURL)),
			driveKVSyncOption,
			driveapp.WithQuota(quotaProvider, spaceRepo),
		),
		pageService: pageapp.NewService(
			spaceService,
			pageSiteRepo,
			pageSlugRepo,
			cfg.PasswordPepper,
			pageapp.WithVersioning(pageVersionRepo, uploadSessionRepo, storageObjectRepo, shared.cloudObjectStore),
			pageapp.WithPageHostFormat(cfg.PageHostFormat),
			pageapp.WithPreviewHost(edgeGrantStore, cfg.PagePreviewHostFormat, cfg.PagePreviewTTLSeconds),
			pageKVSyncOption,
			pageapp.WithQuota(quotaProvider, spaceRepo),
		),
		quotaProvider:     quotaProvider,
		uploadSessionRepo: uploadSessionRepo,
		storageObjectRepo: storageObjectRepo,
		edgeGrantStore:    edgeGrantStore,
		kvSyncWorker: func() *kvsync.Worker {
			if cfg.KVSyncEnabled {
				return kvSyncWorker
			}
			return nil
		}(),
	}, nil
}
