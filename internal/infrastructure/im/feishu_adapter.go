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
	OpenAPIBaseURL    string
}

type FeishuAdapter struct {
	verificationToken         string
	encryptKey                string
	replyAPI                  string
	client                    *http.Client
	appID                     string
	appSecret                 string
	openAPIBaseURL            string
	larkClient                *lark.Client
	getMessage                func(context.Context, string) (*larkim.Message, error)
	listMessages              func(context.Context, string, string, int) ([]*larkim.Message, error)
	downloadMessageResource   func(context.Context, string, string, string) (*DownloadedMessageResource, error)
	readDocxRawContent        func(context.Context, string) (*FeishuDocxReadResult, error)
	readWikiNode              func(context.Context, string) (*FeishuWikiNodeResult, error)
	readSheetPreview          func(context.Context, string, FeishuSheetReadOptions) (*FeishuSheetReadResult, error)
	readBitablePreview        func(context.Context, string, FeishuBitableReadOptions) (*FeishuBitableReadResult, error)
	inspectDocxHeadings       func(context.Context, string) (*FeishuDocxHeadingInspectResult, error)
	createDocx                func(context.Context, string, string, string, string) (*FeishuDocxCreateResult, error)
	createSheet               func(context.Context, string, string, string) (*FeishuSheetCreateResult, error)
	createBitable             func(context.Context, string, string, string) (*FeishuBitableCreateResult, error)
	appendDocxSection         func(context.Context, string, string, string) error
	appendDocxMarkdown        func(context.Context, string, string) error
	appendDocxUnderHeading    func(context.Context, string, string, int, string) error
	replaceDocxHeadingSection func(context.Context, string, string, int, string) error
	appendSheetRows           func(context.Context, string, string, [][]any) error
	updateSheetRange          func(context.Context, string, string, [][]any) error
	createBitableRecords      func(context.Context, string, string, []FeishuBitableRecordWrite) error
	updateBitableRecords      func(context.Context, string, string, []FeishuBitableRecordWrite) error
}

type DownloadedMessageResource struct {
	Content  []byte
	FileName string
}

func NewFeishuAdapter(cfg FeishuAdapterConfig) *FeishuAdapter {
	client := cfg.HTTPClient
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}
	adapter := &FeishuAdapter{
		verificationToken: strings.TrimSpace(cfg.VerificationToken),
		encryptKey:        strings.TrimSpace(cfg.EncryptKey),
		replyAPI:          strings.TrimSpace(cfg.ReplyAPI),
		client:            client,
		appID:             strings.TrimSpace(cfg.AppID),
		appSecret:         strings.TrimSpace(cfg.AppSecret),
		openAPIBaseURL:    normalizeFeishuOpenAPIBaseURL(cfg.OpenAPIBaseURL),
		larkClient:        buildFeishuDirectClient(strings.TrimSpace(cfg.AppID), strings.TrimSpace(cfg.AppSecret), client, normalizeFeishuOpenAPIBaseURL(cfg.OpenAPIBaseURL)),
	}
	adapter.getMessage = adapter.getMessageViaAPI
	adapter.listMessages = adapter.listMessagesViaAPI
	adapter.downloadMessageResource = adapter.downloadMessageResourceViaAPI
	adapter.readDocxRawContent = adapter.readDocxRawContentViaAPI
	adapter.readWikiNode = adapter.readWikiNodeViaAPI
	adapter.readSheetPreview = adapter.readSheetPreviewViaAPI
	adapter.readBitablePreview = adapter.readBitablePreviewViaAPI
	adapter.inspectDocxHeadings = adapter.inspectDocxHeadingsViaAPI
	adapter.createDocx = adapter.createDocxViaAPI
	adapter.createSheet = adapter.createSheetViaAPI
	adapter.createBitable = adapter.createBitableViaAPI
	adapter.appendDocxSection = adapter.appendDocxSectionViaAPI
	adapter.appendDocxMarkdown = adapter.appendDocxMarkdownViaAPI
	adapter.appendDocxUnderHeading = adapter.appendDocxUnderHeadingViaAPI
	adapter.replaceDocxHeadingSection = adapter.replaceDocxHeadingSectionViaAPI
	adapter.appendSheetRows = adapter.appendSheetRowsViaAPI
	adapter.updateSheetRange = adapter.updateSheetRangeViaAPI
	adapter.createBitableRecords = adapter.createBitableRecordsViaAPI
	adapter.updateBitableRecords = adapter.updateBitableRecordsViaAPI
	return adapter
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

func (a *FeishuAdapter) GetMessage(ctx context.Context, messageID string) (*larkim.Message, error) {
	if a == nil || a.getMessage == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	return a.getMessage(ctx, strings.TrimSpace(messageID))
}

func (a *FeishuAdapter) ListMessages(ctx context.Context, containerType string, containerID string, limit int) ([]*larkim.Message, error) {
	if a == nil || a.listMessages == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	return a.listMessages(ctx, strings.TrimSpace(containerType), strings.TrimSpace(containerID), limit)
}

func (a *FeishuAdapter) DownloadMessageResource(ctx context.Context, messageID string, fileKey string, resourceType string) (*DownloadedMessageResource, error) {
	if a == nil || a.downloadMessageResource == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	return a.downloadMessageResource(ctx, strings.TrimSpace(messageID), strings.TrimSpace(fileKey), strings.TrimSpace(resourceType))
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

func buildFeishuDirectClient(appID, appSecret string, httpClient *http.Client, openAPIBaseURL string) *lark.Client {
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
	if strings.TrimSpace(openAPIBaseURL) != "" {
		options = append(options, lark.WithOpenBaseUrl(strings.TrimRight(strings.TrimSpace(openAPIBaseURL), "/")))
	}
	return lark.NewClient(appID, appSecret, options...)
}

func normalizeFeishuOpenAPIBaseURL(value string) string {
	value = strings.TrimRight(strings.TrimSpace(value), "/")
	if value == "" {
		return strings.TrimRight(lark.FeishuBaseUrl, "/")
	}
	return value
}

func (a *FeishuAdapter) getMessageViaAPI(ctx context.Context, messageID string) (*larkim.Message, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	if strings.TrimSpace(messageID) == "" {
		return nil, model.ErrValidation("feishu message id is required")
	}

	req := larkim.NewGetMessageReqBuilder().
		MessageId(strings.TrimSpace(messageID)).
		UserIdType("open_id").
		Build()
	resp, err := a.larkClient.Im.V1.Message.Get(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("get feishu message: %w", err)
	}
	if !resp.Success() {
		return nil, fmt.Errorf("get feishu message: code=%d msg=%s", resp.Code, resp.Msg)
	}
	if resp.Data == nil || len(resp.Data.Items) == 0 || resp.Data.Items[0] == nil {
		return nil, nil
	}
	return resp.Data.Items[0], nil
}

func (a *FeishuAdapter) listMessagesViaAPI(ctx context.Context, containerType string, containerID string, limit int) ([]*larkim.Message, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	if strings.TrimSpace(containerType) == "" || strings.TrimSpace(containerID) == "" {
		return nil, model.ErrValidation("feishu container type and container id are required")
	}
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	req := larkim.NewListMessageReqBuilder().
		ContainerIdType(strings.TrimSpace(containerType)).
		ContainerId(strings.TrimSpace(containerID)).
		SortType("ByCreateTimeDesc").
		PageSize(limit).
		Build()
	resp, err := a.larkClient.Im.V1.Message.List(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("list feishu messages: %w", err)
	}
	if !resp.Success() {
		return nil, fmt.Errorf("list feishu messages: code=%d msg=%s", resp.Code, resp.Msg)
	}
	if resp.Data == nil || len(resp.Data.Items) == 0 {
		return nil, nil
	}
	items := make([]*larkim.Message, 0, len(resp.Data.Items))
	for idx := len(resp.Data.Items) - 1; idx >= 0; idx-- {
		if resp.Data.Items[idx] == nil {
			continue
		}
		items = append(items, resp.Data.Items[idx])
	}
	return items, nil
}

func (a *FeishuAdapter) sendDirectMessage(ctx context.Context, binding model.IMBinding, message string) error {
	if a == nil || a.larkClient == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	chatID := strings.TrimSpace(binding.ChannelID)
	if chatID == "" {
		return model.ErrValidation("feishu chat id is required")
	}

	msgType, content, err := buildFeishuOutboundMessage(message)
	if err != nil {
		return fmt.Errorf("marshal feishu message content: %w", err)
	}

	req := larkim.NewCreateMessageReqBuilder().
		ReceiveIdType(larkim.ReceiveIdTypeChatId).
		Body(
			larkim.NewCreateMessageReqBodyBuilder().
				ReceiveId(chatID).
				MsgType(msgType).
				Content(content).
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

func buildFeishuOutboundMessage(message string) (string, string, error) {
	message = strings.TrimSpace(message)
	if !shouldUseFeishuPostMessage(message) {
		content, err := json.Marshal(map[string]string{"text": message})
		if err != nil {
			return "", "", err
		}
		return "text", string(content), nil
	}
	content, err := json.Marshal(map[string]any{
		"zh_cn": map[string]any{
			"title":   "",
			"content": buildFeishuPostContent(message),
		},
	})
	if err != nil {
		return "", "", err
	}
	return "post", string(content), nil
}

func shouldUseFeishuPostMessage(message string) bool {
	for _, line := range strings.Split(message, "\n") {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "- ") || strings.HasPrefix(trimmed, "* ") || strings.HasPrefix(trimmed, "# ") {
			return true
		}
		if len(trimmed) > 3 && trimmed[0] >= '0' && trimmed[0] <= '9' && strings.Contains(trimmed, ". ") {
			return true
		}
	}
	return strings.Contains(message, "**")
}

func buildFeishuPostContent(message string) [][]map[string]any {
	var content [][]map[string]any
	for _, rawLine := range strings.Split(message, "\n") {
		line := strings.TrimSpace(rawLine)
		if line == "" {
			continue
		}
		line, boldLine := normalizeFeishuPostLine(line)
		elements := buildFeishuPostTextElements(line)
		if boldLine {
			for _, element := range elements {
				element["style"] = []string{"bold"}
			}
		}
		content = append(content, elements)
	}
	if len(content) == 0 {
		content = append(content, []map[string]any{{"tag": "text", "text": strings.TrimSpace(message)}})
	}
	return content
}

func normalizeFeishuPostLine(line string) (string, bool) {
	switch {
	case strings.HasPrefix(line, "- "):
		return "• " + strings.TrimSpace(strings.TrimPrefix(line, "- ")), false
	case strings.HasPrefix(line, "* "):
		return "• " + strings.TrimSpace(strings.TrimPrefix(line, "* ")), false
	case strings.HasPrefix(line, "# "):
		return strings.TrimSpace(strings.TrimPrefix(line, "# ")), true
	default:
		return line, false
	}
}

func buildFeishuPostTextElements(line string) []map[string]any {
	var elements []map[string]any
	for {
		start, token := nextFeishuInlineMarkdownToken(line)
		if start < 0 {
			if line != "" {
				elements = append(elements, map[string]any{"tag": "text", "text": line})
			}
			break
		}
		if start > 0 {
			elements = append(elements, map[string]any{"tag": "text", "text": line[:start]})
		}
		rest := line[start+len(token):]
		end := strings.Index(rest, token)
		if end < 0 {
			elements = append(elements, map[string]any{"tag": "text", "text": line[start:]})
			break
		}
		formattedText := rest[:end]
		if formattedText != "" {
			element := map[string]any{"tag": "text", "text": formattedText}
			if token == "**" {
				element["style"] = []string{"bold"}
			}
			elements = append(elements, element)
		}
		line = rest[end+len(token):]
	}
	if len(elements) == 0 {
		return []map[string]any{{"tag": "text", "text": ""}}
	}
	return elements
}

func nextFeishuInlineMarkdownToken(line string) (int, string) {
	bold := strings.Index(line, "**")
	code := strings.Index(line, "`")
	switch {
	case bold < 0 && code < 0:
		return -1, ""
	case bold < 0:
		return code, "`"
	case code < 0:
		return bold, "**"
	case bold <= code:
		return bold, "**"
	default:
		return code, "`"
	}
}

func (a *FeishuAdapter) downloadMessageResourceViaAPI(ctx context.Context, messageID string, fileKey string, resourceType string) (*DownloadedMessageResource, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	if strings.TrimSpace(messageID) == "" {
		return nil, model.ErrValidation("feishu message id is required")
	}
	if strings.TrimSpace(fileKey) == "" {
		return nil, model.ErrValidation("feishu file key is required")
	}
	normalizedType := strings.ToLower(strings.TrimSpace(resourceType))
	switch normalizedType {
	case "image", "file":
	default:
		return nil, model.ErrValidation("unsupported feishu resource type")
	}

	req := larkim.NewGetMessageResourceReqBuilder().
		MessageId(strings.TrimSpace(messageID)).
		FileKey(strings.TrimSpace(fileKey)).
		Type(normalizedType).
		Build()
	resp, err := a.larkClient.Im.V1.MessageResource.Get(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("get feishu message resource: %w", err)
	}
	if !resp.Success() {
		return nil, fmt.Errorf("get feishu message resource: code=%d msg=%s", resp.Code, resp.Msg)
	}
	content, err := io.ReadAll(resp.File)
	if err != nil {
		return nil, fmt.Errorf("read feishu message resource: %w", err)
	}
	return &DownloadedMessageResource{
		Content:  content,
		FileName: strings.TrimSpace(resp.FileName),
	}, nil
}
