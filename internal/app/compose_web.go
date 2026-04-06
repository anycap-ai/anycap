package app

import (
	feedbackapp "gitlab.knoffice.tech/engineering/anycap/internal/application/feedback"
	webapp "gitlab.knoffice.tech/engineering/anycap/internal/application/web"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/feedbackstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type webComposition struct {
	webService      *webapp.Service
	feedbackService *feedbackapp.Service
}

func buildStubWebComposition(cfg config.Config, shared sharedComposition, billingComp billingComposition) webComposition {
	return webComposition{
		webService:      buildWebService(cfg, shared.creditClient, billingComp.callLogs),
		feedbackService: feedbackapp.NewService(feedbackstore.NewMemoryFeedbackRepo(), buildFeedbackNotifier(cfg), cfg.AppEnv),
	}
}

func buildPersistentWebComposition(cfg config.Config, db *sqlstore.SQLDB, shared sharedComposition, billingComp billingComposition) webComposition {
	return webComposition{
		webService:      buildWebService(cfg, shared.creditClient, billingComp.callLogs),
		feedbackService: feedbackapp.NewService(feedbackstore.NewFeedbackDBRepo(db), buildFeedbackNotifier(cfg), cfg.AppEnv),
	}
}
