package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type BillingIntentRepository interface {
	CreateOrGetIntent(ctx context.Context, intent model.BillingIntent) (model.BillingIntent, error)
	GetIntentByTrace(ctx context.Context, provider, traceID string) (*model.BillingIntent, error)
	RecordProviderSuccess(ctx context.Context, update model.BillingIntentProviderSuccessUpdate) error
	RecordProviderFailure(ctx context.Context, update model.BillingIntentProviderFailureUpdate) error
	MarkUncertain(ctx context.Context, update model.BillingIntentRetryUpdate) error
	MarkDeducted(ctx context.Context, update model.BillingIntentDeductedUpdate) error
	MarkReleased(ctx context.Context, update model.BillingIntentReleaseUpdate) error
	ListRecoverableIntents(ctx context.Context, now time.Time, limit int) ([]model.BillingIntent, error)
}

type BillingCoordinator interface {
	CreateOrGetIntent(ctx context.Context, input model.CreateBillingIntentInput) (model.BillingIntent, error)
	RecordProviderSuccess(ctx context.Context, input model.RecordBillingProviderSuccessInput) error
	RecordProviderFailure(ctx context.Context, provider, traceID, providerStatus, lastError string) error
	MarkUncertain(ctx context.Context, provider, traceID, lastError string) error
	MarkLookupNotReady(ctx context.Context, intent model.BillingIntent, lastError string) error
	MarkDeducted(ctx context.Context, provider, traceID string) error
}
