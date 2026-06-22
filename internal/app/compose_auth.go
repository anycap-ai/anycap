package app

import (
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/loginsession"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	userstore "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/user"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type authComposition struct {
	userProvisioner port.UserProvisioner
	userReader      port.UserReader
	apiKeyService   port.APIKeyService
	loginService    *loginapp.Service
	identityTokens  port.IdentityTokenAuthenticator
	idResolver      idresolver.IDResolver
	idMapper        presenter.IDMapper
}

func buildStubAuthComposition(cfg config.Config, shared sharedComposition) authComposition {
	users := userstore.NewMemoryProvisioner()
	apiKeys := apikey.NewMemoryService()
	loginSessions := loginsession.NewMemoryLoginSessionRepo()

	return authComposition{
		userProvisioner: users,
		userReader:      users,
		apiKeyService:   apiKeys,
		loginService: loginapp.NewService(
			users,
			shared.signupReward,
			apiKeys,
			loginSessions,
			buildDeviceVerificationURL(cfg),
			nil,
			nil,
			nil,
			nil,
			cfg.LoginAPIKeyTTL,
		),
		identityTokens: buildIdentityTokenAuthenticator(cfg, users, shared.signupReward),
		idResolver:     idresolver.PassthroughIDResolver{},
		idMapper:       presenter.PassthroughIDMapper{},
	}
}

func buildPersistentAuthComposition(cfg config.Config, db *sqlstore.SQLDB, shared sharedComposition) authComposition {
	apiKeyRepo := apikey.NewAPIKeyRepo(db)
	loginSessionRepo := loginsession.NewLoginSessionRepo(db)
	users := userstore.NewProvisioner(db)
	apiKeyService := auth.NewRepositoryAPIKeyService(apiKeyRepo, users, nil, nil)

	var externalIDMapper interface {
		idresolver.IDResolver
		presenter.IDMapper
	}
	if shouldBypassAuthForLocalTest(cfg) {
		logging.GetLogger().Warn("external-id using passthrough mapper because bypass auth is enabled")
		externalIDMapper = passthroughIDMapperResolver{}
	} else {
		externalIDMapper = idresolver.NewPostgresExternalIDMapper(db)
	}

	return authComposition{
		userProvisioner: users,
		userReader:      users,
		apiKeyService:   apiKeyService,
		loginService: loginapp.NewService(
			users,
			shared.signupReward,
			apiKeyService,
			loginSessionRepo,
			buildDeviceVerificationURL(cfg),
			nil,
			nil,
			nil,
			nil,
			cfg.LoginAPIKeyTTL,
		),
		identityTokens: buildIdentityTokenAuthenticator(cfg, users, shared.signupReward),
		idResolver:     externalIDMapper,
		idMapper:       externalIDMapper,
	}
}
