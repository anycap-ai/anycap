package paymentevents

import (
	"fmt"
	"strings"

	rmq "github.com/apache/rocketmq-clients/golang/v5"
	"github.com/apache/rocketmq-clients/golang/v5/credentials"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
)

type WorkerConfig struct {
	Endpoint      string
	Topic         string
	AccessKey     string
	SecretKey     string
	ConsumerGroup string
	Tags          []string
}

func NewWorkerConfig(cfg config.PaymentEventsConfig) WorkerConfig {
	return WorkerConfig{
		Endpoint:      cfg.Endpoint,
		Topic:         cfg.Topic,
		AccessKey:     cfg.AccessKey,
		SecretKey:     cfg.SecretKey,
		ConsumerGroup: cfg.ConsumerGroup,
		Tags:          append([]string(nil), cfg.Tags...),
	}
}

func (c WorkerConfig) Validate() error {
	switch {
	case strings.TrimSpace(c.Endpoint) == "":
		return fmt.Errorf("payment events endpoint is required")
	case strings.TrimSpace(c.Topic) == "":
		return fmt.Errorf("payment events topic is required")
	case strings.TrimSpace(c.AccessKey) == "":
		return fmt.Errorf("payment events access key is required")
	case strings.TrimSpace(c.SecretKey) == "":
		return fmt.Errorf("payment events secret key is required")
	case strings.TrimSpace(c.ConsumerGroup) == "":
		return fmt.Errorf("payment events consumer group is required")
	default:
		return nil
	}
}

func (c WorkerConfig) RocketMQConfig() *rmq.Config {
	return &rmq.Config{
		Endpoint:      c.Endpoint,
		ConsumerGroup: c.ConsumerGroup,
		Credentials: &credentials.SessionCredentials{
			AccessKey:    c.AccessKey,
			AccessSecret: c.SecretKey,
		},
	}
}

func buildSubscriptionExpression(tags []string) *rmq.FilterExpression {
	if len(tags) == 0 {
		return rmq.SUB_ALL
	}
	expressions := make([]string, 0, len(tags))
	for _, tag := range tags {
		trimmed := strings.TrimSpace(tag)
		if trimmed == "" {
			continue
		}
		expressions = append(expressions, trimmed)
	}
	if len(expressions) == 0 {
		return rmq.SUB_ALL
	}
	return rmq.NewFilterExpression(strings.Join(expressions, " || "))
}
