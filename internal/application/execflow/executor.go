package execflow

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type Executor struct {
	credit   port.CreditClient
	billing  port.BillingCoordinator
	usage    port.UsageWriter
	callLogs port.CallLogRepo
	now      func() time.Time
}

func NewExecutor(
	credit port.CreditClient,
	billing port.BillingCoordinator,
	usage port.UsageWriter,
	callLogs port.CallLogRepo,
) *Executor {
	return &Executor{
		credit:   credit,
		billing:  billing,
		usage:    usage,
		callLogs: callLogs,
		now:      time.Now,
	}
}

func Run[T any](ctx context.Context, e *Executor, input Input, hooks Hooks[T]) (T, error) {
	var zero T

	logger := logging.WithContext(ctx).WithField("capability", input.Capability)
	if hooks.Invoke == nil {
		logger.Error("execution invoke hook is not configured")
		return zero, model.ErrInternal
	}

	if input.MinCredit > 0 {
		if e == nil || e.credit == nil {
			logger.Error("credit client not configured for billed execution")
			return zero, model.ErrInternal
		}
		if input.UserID == "" {
			logger.Warn("missing user id for billed execution")
			return zero, model.ErrAuthInvalid
		}
		balance, err := e.credit.GetBalance(ctx, input.UserID)
		if err != nil {
			logger.WithError(err).Error("credit balance lookup failed")
			return zero, err
		}
		if balance.Available < input.MinCredit {
			logger.WithFields(logging.Fields{
				"available_credit": balance.Available,
				"required_credit":  input.MinCredit,
			}).Warn("insufficient credit for execution")
			return zero, model.ErrInsufficientCredit
		}
	}

	startedAt := e.now().UTC()
	deductKey := input.RequestID
	if e != nil && e.billing != nil {
		intent, err := e.billing.CreateOrGetIntent(ctx, model.CreateBillingIntentInput{
			UserID:     input.UserID,
			APIKeyID:   input.APIKeyID,
			Provider:   input.Provider,
			Capability: input.Capability,
			TraceID:    input.RequestID,
			CreditCost: input.IntentCreditCost,
		})
		if err != nil {
			logger.WithError(err).Error("create billing intent failed")
			return zero, err
		}
		deductKey = intent.DeductSourceID
	}

	result, err := hooks.Invoke(ctx)
	if err != nil {
		if e != nil && e.billing != nil {
			_ = e.billing.MarkUncertain(ctx, input.Provider, input.RequestID, err.Error())
		}
		return zero, err
	}

	if hooks.AfterSuccess != nil {
		if err := hooks.AfterSuccess(ctx, &result); err != nil {
			return zero, err
		}
	}

	success := ProviderSuccessMeta{CreditCost: input.IntentCreditCost}
	if hooks.OnProviderSuccess != nil {
		success = hooks.OnProviderSuccess(result)
	}

	if e != nil && e.billing != nil {
		if err := e.billing.RecordProviderSuccess(ctx, model.RecordBillingProviderSuccessInput{
			Provider:       input.Provider,
			TraceID:        input.RequestID,
			ProviderTaskID: success.ProviderTaskID,
			ProviderStatus: success.ProviderStatus,
			CreditCost:     success.CreditCost,
		}); err != nil {
			logger.WithFields(logging.Fields{
				"provider_task": success.ProviderTaskID,
				"credit_cost":   success.CreditCost,
			}).WithError(err).Error("record billing provider success failed")
			return zero, model.ErrBillingUncertain
		}
	}

	if e != nil && e.usage != nil && hooks.BuildUsageRecords != nil {
		records := hooks.BuildUsageRecords(result, startedAt)
		if records != nil {
			if records.Event != nil {
				if err := e.usage.InsertUsageEvent(ctx, *records.Event); err != nil {
					logger.WithFields(logging.Fields{
						"provider":    input.Provider,
						"credit_cost": success.CreditCost,
					}).WithError(err).Warn("usage event persistence failed")
				}
			}
			if records.ProviderRun != nil {
				if err := e.usage.InsertProviderRun(ctx, *records.ProviderRun); err != nil {
					logger.WithFields(logging.Fields{
						"provider":       input.Provider,
						"provider_task":  success.ProviderTaskID,
						"provider_state": success.ProviderStatus,
					}).WithError(err).Warn("provider run persistence failed")
				}
			}
		}
	}

	if success.CreditCost > 0 {
		if e == nil || e.credit == nil {
			logger.Error("credit client not configured for charged execution")
			return zero, model.ErrInternal
		}
		if err := e.credit.Deduct(ctx, input.UserID, success.CreditCost, input.Capability, deductKey); err != nil {
			if e.billing != nil {
				_ = e.billing.MarkUncertain(ctx, input.Provider, input.RequestID, err.Error())
			}
			logger.WithField("credit_cost", success.CreditCost).WithError(err).Error("credit deduction failed")
			return zero, model.ErrBillingUncertain
		}
	}

	if e != nil && e.billing != nil {
		if err := e.billing.MarkDeducted(ctx, input.Provider, input.RequestID); err != nil {
			logger.WithError(err).Error("finalize billing intent failed")
			return zero, model.ErrBillingUncertain
		}
	}

	if e != nil && e.callLogs != nil && hooks.BuildCallLog != nil {
		entry := hooks.BuildCallLog(result, startedAt)
		if entry != nil {
			if err := e.callLogs.Insert(ctx, *entry); err != nil {
				logger.WithFields(logging.Fields{
					"credit_cost": success.CreditCost,
				}).WithError(err).Warn("call log persistence failed")
			}
		}
	}

	return result, nil
}
