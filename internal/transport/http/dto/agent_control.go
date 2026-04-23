package dto

import "time"

type CreateIMBindTokenRequest struct {
	Platform string `json:"platform"`
}

type IMBindTokenResponse struct {
	Token     string    `json:"token"`
	Platform  string    `json:"platform"`
	ExpiresAt time.Time `json:"expires_at"`
}

type RegisterRunnerRequest struct {
	Name     string `json:"name"`
	Platform string `json:"platform"`
	Agent    string `json:"agent,omitempty"`
}

type RunnerHeartbeatRequest struct {
	State string `json:"state"`
}

type InboundIMChatRequest struct {
	Platform  string `json:"platform"`
	BotID     string `json:"bot_id"`
	ChatID    string `json:"chat_id"`
	MessageID string `json:"message_id,omitempty"`
	SenderID  string `json:"sender_id"`
	Message   string `json:"message"`
}

type RunnerTaskUpdateRequest struct {
	Status       string `json:"status"`
	ErrorMessage string `json:"error_message,omitempty"`
}

type RunnerSessionUpdateRequest struct {
	Status        string `json:"status"`
	FinalMessage  string `json:"final_message,omitempty"`
	ExecutorRef   string `json:"executor_ref,omitempty"`
	ReplyDelivery string `json:"reply_delivery,omitempty"`
}

type OutboundIMReplyResponse struct {
	Platform       string `json:"platform"`
	BotID          string `json:"bot_id"`
	ChannelID      string `json:"channel_id"`
	SenderID       string `json:"sender_id,omitempty"`
	Message        string `json:"message"`
	IdempotencyKey string `json:"idempotency_key,omitempty"`
}

type ConversationControlRequest struct {
	Message string `json:"message,omitempty"`
}

type ConversationMailboxCreateRequest struct {
	SourceType    string `json:"source_type"`
	Payload       string `json:"payload"`
	SourceSession string `json:"source_session_id,omitempty"`
}
