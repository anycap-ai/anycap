package paymentevents

import (
	"context"
	"fmt"
	"log"

	"gitlab.knoffice.tech/engineering/anycap/internal/application/billingevents"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	rmq "github.com/apache/rocketmq-clients/golang/v5"
)

type EventProcessor interface {
	Process(ctx context.Context, event model.PaymentInboundEvent) (billingevents.ProcessResult, error)
}

type MessageHandler struct {
	processor EventProcessor
}

func NewMessageHandler(processor EventProcessor) *MessageHandler {
	return &MessageHandler{processor: processor}
}

func (h *MessageHandler) HandleMessage(ctx context.Context, body []byte) (billingevents.ProcessResult, error) {
	event, err := DecodeEventEnvelope(body)
	if err != nil {
		return billingevents.ProcessResult{}, err
	}
	return h.processor.Process(ctx, event)
}

type pushConsumer interface {
	Start() error
	GracefulStop() error
}

type Worker struct {
	config   WorkerConfig
	handler  *MessageHandler
	consumer pushConsumer
}

func NewWorker(cfg WorkerConfig, handler *MessageHandler) (*Worker, error) {
	if handler == nil {
		return nil, fmt.Errorf("payment events message handler is required")
	}
	if err := cfg.Validate(); err != nil {
		return nil, err
	}
	consumer, err := rmq.NewPushConsumer(
		cfg.RocketMQConfig(),
		rmq.WithPushSubscriptionExpressions(map[string]*rmq.FilterExpression{
			cfg.Topic: buildSubscriptionExpression(cfg.Tags),
		}),
		rmq.WithPushMessageListener(&rmq.FuncMessageListener{
			Consume: func(msg *rmq.MessageView) rmq.ConsumerResult {
				result, err := handler.HandleMessage(context.Background(), msg.GetBody())
				if err != nil {
					log.Printf("payment events: handle message failed topic=%s message_id=%s err=%v", msg.GetTopic(), msg.GetMessageId(), err)
					return rmq.FAILURE
				}
				log.Printf("payment events: processed topic=%s message_id=%s event_key=%s status=%s duplicate=%t", msg.GetTopic(), msg.GetMessageId(), result.EventKey, result.Status, result.Duplicate)
				return rmq.SUCCESS
			},
		}),
	)
	if err != nil {
		return nil, err
	}
	return &Worker{
		config:   cfg,
		handler:  handler,
		consumer: consumer,
	}, nil
}

func (w *Worker) Run(ctx context.Context) error {
	if w == nil || w.consumer == nil {
		return fmt.Errorf("payment events worker is not configured")
	}
	if err := w.consumer.Start(); err != nil {
		return err
	}
	defer func() {
		if err := w.consumer.GracefulStop(); err != nil {
			log.Printf("payment events: graceful stop failed: %v", err)
		}
	}()
	<-ctx.Done()
	return nil
}
