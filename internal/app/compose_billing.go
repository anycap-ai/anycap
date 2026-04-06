package app

import (
	"context"
	"fmt"

	billingapp "gitlab.knoffice.tech/engineering/anycap/internal/application/billing"
	billingeventsapp "gitlab.knoffice.tech/engineering/anycap/internal/application/billingevents"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	billinginfra "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/billing"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/idempotency"
	paymenteventsinfra "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/paymentevents"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/usage"
)

type checkoutIdempotencyClaimer interface {
	Claim(ctx context.Context, scope, key string) (bool, error)
	Release(ctx context.Context, scope, key string) error
}

type billingComposition struct {
	callLogs                   port.CallLogRepo
	usageReader                port.UsageReader
	usageWriter                port.UsageWriter
	usageSyncRepo              port.UsageSyncRepository
	billingRepo                port.BillingIntentRepository
	billingService             *billingapp.Service
	checkoutIdempotencyClaimer checkoutIdempotencyClaimer
	paymentEventsWorker        *paymenteventsinfra.Worker
}

func buildStubBillingComposition(_ config.Config, _ sharedComposition) billingComposition {
	callLogs := calllog.NewMemoryCallLogRepo()
	usageRepo := usage.NewMemoryRepo()
	billingRepo := billinginfra.NewMemoryRepo()

	return billingComposition{
		callLogs:       callLogs,
		usageReader:    usageRepo,
		usageWriter:    usageRepo,
		usageSyncRepo:  usageRepo,
		billingRepo:    billingRepo,
		billingService: billingapp.NewService(billingRepo),
	}
}

func buildPersistentBillingComposition(cfg config.Config, db *sqlstore.SQLDB, _ sharedComposition) (billingComposition, error) {
	callLogs := calllog.NewCallLogDBRepo(db)
	usageRepo := usage.NewRepo(db)
	billingRepo := billinginfra.NewRepo(db)

	result := billingComposition{
		callLogs:                   callLogs,
		usageReader:                usageRepo,
		usageWriter:                usageRepo,
		usageSyncRepo:              usageRepo,
		billingRepo:                billingRepo,
		billingService:             billingapp.NewService(billingRepo),
		checkoutIdempotencyClaimer: idempotency.NewIdempotencyRepo(db),
	}

	if cfg.PaymentEvents.Enabled {
		if !cfg.PaymentEvents.Configured() {
			return billingComposition{}, fmt.Errorf("payment events mq is enabled but not fully configured")
		}
		receiptRepo := paymenteventsinfra.NewRepo(db)
		billingEventsService := billingeventsapp.NewService(receiptRepo, billingeventsapp.Config{
			BizID: cfg.PaymentEvents.BizID,
		})
		handler := paymenteventsinfra.NewMessageHandler(billingEventsService)
		worker, err := paymenteventsinfra.NewWorker(paymenteventsinfra.NewWorkerConfig(cfg.PaymentEvents), handler)
		if err != nil {
			return billingComposition{}, err
		}
		result.paymentEventsWorker = worker
	}

	return result, nil
}
