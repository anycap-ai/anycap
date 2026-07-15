package execflow

import (
	"context"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type Input struct {
	UserID           string
	APIKeyID         string
	Capability       string
	Provider         string
	RequestID        string
	Model            string
	MinCredit        int64
	IntentCreditCost int64
}

type ProviderSuccessMeta struct {
	ProviderTaskID string
	ProviderStatus string
	CreditCost     int64
}

type UsageRecords struct {
	Event       *model.UsageEventRecord
	ProviderRun *model.ProviderRunRecord
}

type Hooks[T any] struct {
	Invoke            func(context.Context) (T, error)
	InvocationMeta    func() model.InvocationMeta
	OnProviderSuccess func(T) ProviderSuccessMeta
	BuildUsageRecords func(T, time.Time) *UsageRecords
	BuildCallLog      func(T, time.Time) *model.CallLog
	AfterSuccess      func(context.Context, *T) error
}

func HasUsableOutput(outputs []model.Artifact) bool {
	for _, output := range outputs {
		if strings.TrimSpace(output.URL) != "" {
			return true
		}
	}
	return false
}
