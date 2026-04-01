package paymentevents

import (
	"encoding/json"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func DecodeEventEnvelope(body []byte) (model.PaymentInboundEvent, error) {
	var event model.PaymentInboundEvent
	if err := json.Unmarshal(body, &event); err != nil {
		return model.PaymentInboundEvent{}, fmt.Errorf("decode payment event envelope: %w", err)
	}
	return event, nil
}
