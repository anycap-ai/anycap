package im

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	lark "github.com/larksuite/oapi-sdk-go/v3"
	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type FeishuAdapterConfig struct {
	VerificationToken string
	EncryptKey        string
	ReplyAPI          string
	AppID             string
	AppSecret         string
	HTTPClient        *http.Client
}

type FeishuAdapter struct {
	verificationToken string
	encryptKey        string
	replyAPI          string
	client            *http.Client
	appID             string
	appSecret         string
	larkClient        *lark.Client
}

func NewFeishuAdapter(cfg FeishuAdapterConfig) *FeishuAdapter {
	client := cfg.HTTPClient
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}
	return &FeishuAdapter{
		verificationToken: strings.TrimSpace(cfg.VerificationToken),
		encryptKey:        strings.TrimSpace(cfg.EncryptKey),
		replyAPI:          strings.TrimSpace(cfg.ReplyAPI),
		client:            client,
		appID:             strings.TrimSpace(cfg.AppID),
		appSecret:         strings.TrimSpace(cfg.AppSecret),
		larkClient:        buildFeishuDirectClient(strings.TrimSpace(cfg.AppID), strings.TrimSpace(cfg.AppSecret), client),
	}
}

func (a *FeishuAdapter) VerifyAndNormalize(req *http.Request) (NormalizedInboundEvent, error) {
	if a == nil {
		return NormalizedInboundEvent{}, model.ErrNotConfigured("feishu adapter is not configured")
	}
	body, err := io.ReadAll(req.Body)
	if err != nil {
		return NormalizedInboundEvent{}, fmt.Errorf("read feishu request body: %w", err)
	}
	req.Body = io.NopCloser(bytes.NewReader(body))

	var urlVerify struct {
		Type      string `json:"type"`
		Token     string `json:"token"`
		Challenge string `json:"challenge"`
	}
	if err := json.Unmarshal(body, &urlVerify); err == nil && strings.TrimSpace(urlVerify.Type) == "url_verification" {
		if a.verificationToken == "" || strings.TrimSpace(urlVerify.Token) != a.verificationToken {
			return NormalizedInboundEvent{}, model.ErrAuthInvalid
		}
		return NormalizedInboundEvent{
			Platform:          model.IMPlatformFeishu,
			IsURLVerification: true,
			Challenge:         strings.TrimSpace(urlVerify.Challenge),
		}, nil
	}

	if err := a.verifySignature(req, body); err != nil {
		return NormalizedInboundEvent{}, err
	}

	var payload struct {
		Header struct {
			EventType string `json:"event_type"`
			AppID     string `json:"app_id"`
		} `json:"header"`
		Event struct {
			Sender struct {
				SenderID struct {
					OpenID string `json:"open_id"`
				} `json:"sender_id"`
			} `json:"sender"`
			Message struct {
				MessageID string `json:"message_id"`
				ChatID    string `json:"chat_id"`
				Content   string `json:"content"`
			} `json:"message"`
		} `json:"event"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return NormalizedInboundEvent{}, fmt.Errorf("unmarshal feishu event: %w", err)
	}
	if payload.Header.EventType != "im.message.receive_v1" {
		return NormalizedInboundEvent{}, model.ErrValidation("unsupported feishu event type")
	}

	var content struct {
		Text string `json:"text"`
	}
	if err := json.Unmarshal([]byte(payload.Event.Message.Content), &content); err != nil {
		return NormalizedInboundEvent{}, fmt.Errorf("decode feishu message content: %w", err)
	}
	return NormalizedInboundEvent{
		Platform:  model.IMPlatformFeishu,
		BotID:     strings.TrimSpace(payload.Header.AppID),
		ChannelID: strings.TrimSpace(payload.Event.Message.ChatID),
		MessageID: strings.TrimSpace(payload.Event.Message.MessageID),
		SenderID:  strings.TrimSpace(payload.Event.Sender.SenderID.OpenID),
		Message:   strings.TrimSpace(content.Text),
	}, nil
}

func (a *FeishuAdapter) SendAccepted(ctx context.Context, binding model.IMBinding, task model.AgentTask) error {
	return a.sendReply(ctx, binding, fmt.Sprintf("任务已接收：%s", strings.TrimSpace(task.TaskText)))
}

func (a *FeishuAdapter) SendMessage(ctx context.Context, binding model.IMBinding, message string) error {
	return a.sendReply(ctx, binding, message)
}

func (a *FeishuAdapter) SendReaction(ctx context.Context, binding model.IMBinding, messageID string, emojiType string) error {
	if a == nil || a.larkClient == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	trimmedMessageID := strings.TrimSpace(messageID)
	if trimmedMessageID == "" {
		return model.ErrValidation("feishu message id is required")
	}
	normalizedEmojiType := NormalizeReactionEmojiType(emojiType)
	if !IsAllowedReactionEmojiType(normalizedEmojiType) {
		return model.ErrValidation("unsupported feishu reaction emoji type")
	}

	req := larkim.NewCreateMessageReactionReqBuilder().
		MessageId(trimmedMessageID).
		Body(
			larkim.NewCreateMessageReactionReqBodyBuilder().
				ReactionType(larkim.NewEmojiBuilder().EmojiType(normalizedEmojiType).Build()).
				Build(),
		).
		Build()

	resp, err := a.larkClient.Im.V1.MessageReaction.Create(ctx, req)
	if err != nil {
		return fmt.Errorf("send feishu reaction: %w", err)
	}
	if !resp.Success() {
		return fmt.Errorf("send feishu reaction: code=%d msg=%s", resp.Code, resp.Msg)
	}
	return nil
}

func (a *FeishuAdapter) SendCompleted(ctx context.Context, binding model.IMBinding, task model.AgentTask) error {
	return a.sendReply(ctx, binding, fmt.Sprintf("任务已完成：%s", strings.TrimSpace(task.TaskText)))
}

func (a *FeishuAdapter) SendFailure(ctx context.Context, binding model.IMBinding, task model.AgentTask) error {
	message := fmt.Sprintf("任务失败：%s", strings.TrimSpace(task.TaskText))
	if task.ErrorMessage != nil && strings.TrimSpace(*task.ErrorMessage) != "" {
		message = fmt.Sprintf("%s；错误：%s", message, strings.TrimSpace(*task.ErrorMessage))
	}
	return a.sendReply(ctx, binding, message)
}

func (a *FeishuAdapter) verifySignature(req *http.Request, body []byte) error {
	if a.encryptKey == "" {
		return model.ErrNotConfigured("feishu encrypt key is not configured")
	}
	timestamp := strings.TrimSpace(req.Header.Get("X-Lark-Request-Timestamp"))
	nonce := strings.TrimSpace(req.Header.Get("X-Lark-Request-Nonce"))
	signature := strings.TrimSpace(req.Header.Get("X-Lark-Signature"))
	if timestamp == "" || nonce == "" || signature == "" {
		return model.ErrAuthInvalid
	}

	sum := sha256.Sum256([]byte(timestamp + nonce + a.encryptKey + string(body)))
	expected := hex.EncodeToString(sum[:])
	if !strings.EqualFold(expected, signature) {
		return model.ErrAuthInvalid
	}
	return nil
}

func (a *FeishuAdapter) sendReply(ctx context.Context, binding model.IMBinding, message string) error {
	if a.larkClient != nil {
		return a.sendDirectMessage(ctx, binding, message)
	}
	if strings.TrimSpace(a.replyAPI) == "" {
		return model.ErrNotConfigured("feishu reply api is not configured")
	}
	payload := map[string]string{
		"platform":   model.IMPlatformFeishu,
		"bot_id":     strings.TrimSpace(binding.BotID),
		"channel_id": strings.TrimSpace(binding.ChannelID),
		"sender_id":  strings.TrimSpace(binding.SenderID),
		"message":    strings.TrimSpace(message),
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal feishu reply: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, a.replyAPI, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build feishu reply request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := a.client.Do(req)
	if err != nil {
		return fmt.Errorf("send feishu reply: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("send feishu reply: status %d", resp.StatusCode)
	}
	return nil
}

func buildFeishuDirectClient(appID, appSecret string, httpClient *http.Client) *lark.Client {
	if strings.TrimSpace(appID) == "" || strings.TrimSpace(appSecret) == "" {
		return nil
	}
	options := []lark.ClientOptionFunc{
		lark.WithEnableTokenCache(true),
		lark.WithReqTimeout(10 * time.Second),
		lark.WithLogLevel(larkcore.LogLevelInfo),
	}
	if httpClient != nil {
		options = append(options, lark.WithHttpClient(httpClient))
	}
	return lark.NewClient(appID, appSecret, options...)
}

func (a *FeishuAdapter) sendDirectMessage(ctx context.Context, binding model.IMBinding, message string) error {
	if a == nil || a.larkClient == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	chatID := strings.TrimSpace(binding.ChannelID)
	if chatID == "" {
		return model.ErrValidation("feishu chat id is required")
	}

	content, err := json.Marshal(map[string]string{"text": strings.TrimSpace(message)})
	if err != nil {
		return fmt.Errorf("marshal feishu message content: %w", err)
	}

	req := larkim.NewCreateMessageReqBuilder().
		ReceiveIdType(larkim.ReceiveIdTypeChatId).
		Body(
			larkim.NewCreateMessageReqBodyBuilder().
				ReceiveId(chatID).
				MsgType("text").
				Content(string(content)).
				Uuid(uuid.NewString()).
				Build(),
		).
		Build()

	resp, err := a.larkClient.Im.V1.Message.Create(ctx, req)
	if err != nil {
		return fmt.Errorf("send feishu direct message: %w", err)
	}
	if !resp.Success() {
		return fmt.Errorf("send feishu direct message: code=%d msg=%s", resp.Code, resp.Msg)
	}
	return nil
}
