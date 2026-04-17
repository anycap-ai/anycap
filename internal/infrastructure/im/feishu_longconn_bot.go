package im

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"

	"github.com/larksuite/oapi-sdk-go/v3/event/dispatcher"
	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
	larkws "github.com/larksuite/oapi-sdk-go/v3/ws"
)

const (
	feishuQuotedMessageLimit     = 1
	feishuThreadHistoryLimit     = 6
	feishuChatHistoryLimit       = 6
	defaultFeishuTurnMergeWindow = 1200 * time.Millisecond
)

type FeishuLongConnBotConfig struct {
	AppID               string
	AppSecret           string
	DownloadDir         string
	ActionDir           string
	TurnMergeWindow     time.Duration
	BindingService      *agentcontrolapp.BindingService
	ConversationService *agentcontrolapp.ConversationService
	HandleInbound       func(context.Context, NormalizedInboundEvent) (string, error)
	Adapter             *FeishuAdapter
}

type feishuPendingBurstTurn struct {
	event NormalizedInboundEvent
	timer *time.Timer
}

type FeishuLongConnBot struct {
	appID               string
	appSecret           string
	bindingService      *agentcontrolapp.BindingService
	conversationService *agentcontrolapp.ConversationService
	inboundHandler      func(context.Context, NormalizedInboundEvent) (string, error)
	adapter             *FeishuAdapter
	downloadDir         string
	actionDir           string
	turnMergeWindow     time.Duration
	pendingMu           sync.Mutex
	pendingTurns        map[string]*feishuPendingBurstTurn
	client              *larkws.Client
}

func NewFeishuLongConnBot(cfg FeishuLongConnBotConfig) *FeishuLongConnBot {
	appID := strings.TrimSpace(cfg.AppID)
	appSecret := strings.TrimSpace(cfg.AppSecret)
	if appID == "" || appSecret == "" || cfg.Adapter == nil {
		return nil
	}
	if cfg.ConversationService == nil && cfg.HandleInbound == nil {
		return nil
	}

	bot := &FeishuLongConnBot{
		appID:               appID,
		appSecret:           appSecret,
		bindingService:      cfg.BindingService,
		conversationService: cfg.ConversationService,
		inboundHandler:      cfg.HandleInbound,
		adapter:             cfg.Adapter,
		downloadDir:         strings.TrimSpace(cfg.DownloadDir),
		actionDir:           strings.TrimSpace(cfg.ActionDir),
		turnMergeWindow:     normalizeFeishuTurnMergeWindow(cfg.TurnMergeWindow),
		pendingTurns:        map[string]*feishuPendingBurstTurn{},
	}

	eventDispatcher := dispatcher.NewEventDispatcher("", "").
		OnP2MessageReceiveV1(bot.onMessageReceive)
	bot.client = larkws.NewClient(appID, appSecret, larkws.WithEventHandler(eventDispatcher))
	return bot
}

func (b *FeishuLongConnBot) Run(ctx context.Context) error {
	if b == nil || b.client == nil {
		return nil
	}

	errCh := make(chan error, 1)
	go func() {
		errCh <- b.client.Start(ctx)
	}()
	if strings.TrimSpace(b.actionDir) != "" {
		go func() {
			if err := b.runFeishuActionWatcher(ctx); err != nil {
				logging.WithError(err).Warn("feishu resource action watcher stopped")
			}
		}()
	}

	select {
	case <-ctx.Done():
		return nil
	case err := <-errCh:
		if ctx.Err() != nil {
			return nil
		}
		return err
	}
}

func (b *FeishuLongConnBot) onMessageReceive(ctx context.Context, event *larkim.P2MessageReceiveV1) error {
	normalized, ok, err := b.normalizeEvent(event)
	if err != nil || !ok {
		return err
	}
	return b.handleNormalizedEvent(ctx, normalized)
}

func (b *FeishuLongConnBot) normalizeEvent(event *larkim.P2MessageReceiveV1) (NormalizedInboundEvent, bool, error) {
	if b == nil || event == nil || event.Event == nil || event.Event.Message == nil || event.Event.Sender == nil || event.Event.Sender.SenderId == nil {
		return NormalizedInboundEvent{}, false, nil
	}
	if senderType := stringValue(event.Event.Sender.SenderType); senderType != "" && senderType != "user" {
		return NormalizedInboundEvent{}, false, nil
	}

	chatID := strings.TrimSpace(stringValue(event.Event.Message.ChatId))
	if chatID == "" {
		return NormalizedInboundEvent{}, false, nil
	}
	senderID := strings.TrimSpace(stringValue(event.Event.Sender.SenderId.OpenId))
	if senderID == "" {
		return NormalizedInboundEvent{}, false, nil
	}
	messageType := strings.TrimSpace(stringValue(event.Event.Message.MessageType))
	contentJSON := strings.TrimSpace(stringValue(event.Event.Message.Content))
	mentions := normalizeFeishuMentions(event.Event.Message.Mentions)
	messageText, err := normalizeFeishuMessageText(messageType, contentJSON, mentions)
	if err != nil {
		return NormalizedInboundEvent{}, false, err
	}

	return NormalizedInboundEvent{
		Platform:    model.IMPlatformFeishu,
		BotID:       b.appID,
		ChannelID:   chatID,
		MessageID:   strings.TrimSpace(stringValue(event.Event.Message.MessageId)),
		SenderID:    senderID,
		ChatType:    strings.TrimSpace(stringValue(event.Event.Message.ChatType)),
		ThreadID:    strings.TrimSpace(stringValue(event.Event.Message.ThreadId)),
		ParentID:    strings.TrimSpace(stringValue(event.Event.Message.ParentId)),
		RootID:      strings.TrimSpace(stringValue(event.Event.Message.RootId)),
		MessageType: messageType,
		Message:     messageText,
		ContentJSON: contentJSON,
		FileInfo:    extractFeishuFileInfo(messageType, contentJSON),
		Mentions:    mentions,
	}, true, nil
}

func (b *FeishuLongConnBot) handleNormalizedEvent(ctx context.Context, event NormalizedInboundEvent) error {
	if b == nil {
		return model.ErrNotConfigured("feishu long connection bot is not configured")
	}
	if b.shouldMergeBurstTurn(event) {
		b.enqueueBurstTurn(event)
		return nil
	}
	if err := b.flushPendingBurstTurnForEvent(event); err != nil {
		return err
	}
	return b.dispatchNormalizedEvent(ctx, event)
}

func (b *FeishuLongConnBot) dispatchNormalizedEvent(ctx context.Context, event NormalizedInboundEvent) error {
	enrichedEvent := b.enrichContext(ctx, event)
	if b.inboundHandler != nil {
		replyMessage, err := b.inboundHandler(ctx, enrichedEvent)
		if err != nil {
			return err
		}
		replyMessage = strings.TrimSpace(replyMessage)
		if replyMessage == "" {
			return nil
		}
		binding := model.IMBinding{Platform: event.Platform, BotID: event.BotID, ChannelID: event.ChannelID, SenderID: event.SenderID}
		if sendErr := b.adapter.SendMessage(ctx, binding, replyMessage); sendErr != nil {
			logging.WithError(sendErr).Warn("send feishu long connection reply failed")
		}
		return nil
	}
	if b.conversationService == nil {
		return model.ErrNotConfigured("feishu long connection bot is not configured")
	}

	if strings.HasPrefix(strings.TrimSpace(event.Message), "/bind ") {
		if b.bindingService == nil {
			return model.ErrNotConfigured("binding service is not configured")
		}
		_, err := b.bindingService.ConsumeBindCommand(ctx, agentcontrolapp.ConsumeBindCommandInput{
			Platform:  event.Platform,
			BotID:     event.BotID,
			ChannelID: event.ChannelID,
			SenderID:  event.SenderID,
			Message:   event.Message,
		})
		return err
	}

	result, err := b.conversationService.HandleInboundMessage(ctx, agentcontrolapp.InboundChatInput{
		Platform:  enrichedEvent.Platform,
		BotID:     enrichedEvent.BotID,
		ChatID:    enrichedEvent.ChannelID,
		MessageID: enrichedEvent.MessageID,
		SenderID:  enrichedEvent.SenderID,
		Message:   enrichedEvent.Message,
	})
	if err != nil {
		return err
	}
	if result != nil && result.Binding != nil {
		if message := agentcontrolapp.BuildInboundChatReply(*result); strings.TrimSpace(message) != "" {
			if sendErr := b.adapter.SendMessage(ctx, *result.Binding, message); sendErr != nil {
				logging.WithError(sendErr).Warn("send feishu long connection reply failed")
			}
		}
	}
	return nil
}

func (b *FeishuLongConnBot) shouldMergeBurstTurn(event NormalizedInboundEvent) bool {
	if b == nil || b.turnMergeWindow <= 0 {
		return false
	}
	command, err := agentcontrolapp.ParseChatCommand(event.Message)
	if err != nil || command.Action != model.AgentChatActionContinue {
		return false
	}
	if strings.TrimSpace(event.ChannelID) == "" || strings.TrimSpace(event.SenderID) == "" {
		return false
	}
	if hasFeishuConversationStructure(event) {
		return false
	}
	return true
}

func hasFeishuConversationStructure(event NormalizedInboundEvent) bool {
	return strings.TrimSpace(event.ThreadID) != "" ||
		strings.TrimSpace(event.ParentID) != "" ||
		strings.TrimSpace(event.RootID) != ""
}

func normalizeFeishuTurnMergeWindow(window time.Duration) time.Duration {
	if window < 0 {
		return 0
	}
	return window
}

func (b *FeishuLongConnBot) enqueueBurstTurn(event NormalizedInboundEvent) {
	if b == nil {
		return
	}
	key := b.burstTurnKey(event)
	if key == "" {
		return
	}

	b.pendingMu.Lock()
	defer b.pendingMu.Unlock()

	if existing, ok := b.pendingTurns[key]; ok && existing != nil {
		existing.event = event
		existing.timer.Reset(b.turnMergeWindow)
		return
	}

	timer := time.AfterFunc(b.turnMergeWindow, func() {
		b.flushPendingBurstTurn(key)
	})
	b.pendingTurns[key] = &feishuPendingBurstTurn{
		event: event,
		timer: timer,
	}
}

func (b *FeishuLongConnBot) flushPendingBurstTurnForEvent(event NormalizedInboundEvent) error {
	if b == nil {
		return nil
	}
	key := b.burstTurnKey(event)
	if key == "" {
		return nil
	}
	pending := b.takePendingBurstTurn(key)
	if pending == nil {
		return nil
	}
	return b.dispatchNormalizedEvent(context.Background(), pending.event)
}

func (b *FeishuLongConnBot) flushPendingBurstTurn(key string) {
	if b == nil {
		return
	}
	pending := b.takePendingBurstTurn(key)
	if pending == nil {
		return
	}
	if err := b.dispatchNormalizedEvent(context.Background(), pending.event); err != nil {
		logging.WithError(err).Warn("dispatch merged feishu burst turn failed")
	}
}

func (b *FeishuLongConnBot) takePendingBurstTurn(key string) *feishuPendingBurstTurn {
	if b == nil || strings.TrimSpace(key) == "" {
		return nil
	}
	b.pendingMu.Lock()
	defer b.pendingMu.Unlock()

	pending := b.pendingTurns[key]
	if pending == nil {
		return nil
	}
	delete(b.pendingTurns, key)
	if pending.timer != nil {
		pending.timer.Stop()
	}
	return pending
}

func (b *FeishuLongConnBot) burstTurnKey(event NormalizedInboundEvent) string {
	if b == nil {
		return ""
	}
	channelID := strings.TrimSpace(event.ChannelID)
	senderID := strings.TrimSpace(event.SenderID)
	if channelID == "" || senderID == "" {
		return ""
	}
	scope := strings.TrimSpace(event.ThreadID)
	if scope == "" {
		scope = strings.TrimSpace(event.RootID)
	}
	if scope == "" {
		scope = channelID
	}
	return strings.Join([]string{
		strings.TrimSpace(event.BotID),
		channelID,
		senderID,
		scope,
	}, "|")
}

func (b *FeishuLongConnBot) enrichContext(ctx context.Context, event NormalizedInboundEvent) NormalizedInboundEvent {
	if b == nil || b.adapter == nil {
		return event
	}
	command, err := agentcontrolapp.ParseChatCommand(event.Message)
	if err != nil || command.Action != model.AgentChatActionContinue {
		return event
	}

	enriched := event
	enriched.FileInfo = resolvedNormalizedFileInfo(enriched.FileInfo, enriched.MessageType, enriched.ContentJSON)
	if fileInfo, err := b.downloadMessageResourceToLocal(ctx, enriched.MessageID, enriched.FileInfo); err == nil {
		enriched.FileInfo = fileInfo
	} else if err != nil {
		logging.WithError(err).Warn("download feishu current message resource failed")
	}
	enriched.Resources = b.readCurrentMessageResources(ctx, enriched.Message)
	if quoted, err := b.loadQuotedMessage(ctx, event); err == nil && quoted != nil {
		hydrated := b.hydrateContextMessageResources(ctx, *quoted)
		enriched.QuotedMessage = &hydrated
	} else if err != nil {
		logging.WithError(err).Warn("load feishu quoted message failed")
	}
	if threadHistory, err := b.loadThreadHistory(ctx, event); err == nil && len(threadHistory) > 0 {
		enriched.ThreadHistory = b.hydrateHistoryResources(ctx, threadHistory)
	} else if err != nil {
		logging.WithError(err).Warn("load feishu thread history failed")
	}
	if chatHistory, err := b.loadChatHistory(ctx, event); err == nil && len(chatHistory) > 0 {
		enriched.ChatHistory = b.hydrateHistoryResources(ctx, chatHistory)
	} else if err != nil {
		logging.WithError(err).Warn("load feishu chat history failed")
	}
	actionResources := collectFeishuActionResources(enriched)
	if err := b.writeFeishuActionContext(enriched.MessageID, actionResources); err != nil {
		logging.WithError(err).Warn("write feishu resource action context failed")
	} else if len(actionResources) > 0 {
		action := b.feishuResourceActionPaths()
		enriched.ResourceAction = action
	}
	return enriched
}

func (b *FeishuLongConnBot) readCurrentMessageResources(ctx context.Context, message string) []NormalizedInboundResource {
	return b.readMessageResources(ctx, message)
}

func (b *FeishuLongConnBot) readMessageResources(ctx context.Context, message string) []NormalizedInboundResource {
	if b == nil || b.adapter == nil {
		return nil
	}
	refs := ExtractFeishuResourceRefs(message)
	if len(refs) == 0 {
		return nil
	}
	resources := make([]NormalizedInboundResource, 0, len(refs))
	writer := NewFeishuResourceArtifactWriter(b.downloadDir, nil)
	for _, ref := range refs {
		resource := NormalizedInboundResource{
			URL:   strings.TrimSpace(ref.URL),
			Kind:  ref.Kind,
			Token: strings.TrimSpace(ref.Token),
		}

		result, err := b.adapter.ReadFeishuResource(ctx, ref, defaultFeishuResourceReadOptions())
		artifact := FeishuResourceArtifact{Ref: ref}
		if err != nil {
			resource.ErrorCode, resource.ErrorText = normalizeFeishuResourceReadError(err)
			resource.ReadError = err
			artifact.ErrorCode = resource.ErrorCode
			artifact.ErrorText = resource.ErrorText
			artifact.ReadMode = "error"
		} else if result != nil {
			resource.Title = strings.TrimSpace(result.Title)
			resource.ReadMode = strings.TrimSpace(result.ReadMode)
			artifact.Title = resource.Title
			artifact.ReadMode = resource.ReadMode
			artifact.Content = result.Content
		}

		if path, writeErr := writeFeishuResourceArtifact(writer, artifact); writeErr == nil {
			resource.LocalPath = path
		} else if writeErr != nil {
			logging.WithError(writeErr).Warn("write feishu resource artifact failed")
		}
		resources = append(resources, resource)
	}
	return resources
}

func collectFeishuActionResources(event NormalizedInboundEvent) []NormalizedInboundResource {
	resources := make([]NormalizedInboundResource, 0, len(event.Resources))
	seen := make(map[string]struct{})
	add := func(items []NormalizedInboundResource) {
		for _, resource := range items {
			key := feishuActionResourceKey(resource)
			if key == "" {
				continue
			}
			if _, ok := seen[key]; ok {
				continue
			}
			seen[key] = struct{}{}
			resources = append(resources, resource)
		}
	}
	add(event.Resources)
	if event.QuotedMessage != nil {
		add(event.QuotedMessage.Resources)
	}
	for _, item := range event.ThreadHistory {
		add(item.Resources)
	}
	for _, item := range event.ChatHistory {
		add(item.Resources)
	}
	return resources
}

func feishuActionResourceKey(resource NormalizedInboundResource) string {
	kind := strings.TrimSpace(string(resource.Kind))
	token := strings.TrimSpace(resource.Token)
	if kind == "" || token == "" {
		return ""
	}
	return kind + ":" + token
}

func (b *FeishuLongConnBot) runFeishuActionWatcher(ctx context.Context) error {
	if b == nil || strings.TrimSpace(b.actionDir) == "" {
		return nil
	}
	if err := os.MkdirAll(filepath.Join(b.actionDir, "outbox"), 0o755); err != nil {
		return fmt.Errorf("create feishu action outbox: %w", err)
	}
	if err := os.MkdirAll(filepath.Join(b.actionDir, "results"), 0o755); err != nil {
		return fmt.Errorf("create feishu action results: %w", err)
	}
	if _, err := b.processFeishuActionOutboxOnce(ctx); err != nil {
		logging.WithError(err).Warn("process existing feishu resource actions failed")
	}
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return fmt.Errorf("create feishu action watcher: %w", err)
	}
	defer watcher.Close()

	outboxDir := filepath.Join(b.actionDir, "outbox")
	if err := watcher.Add(outboxDir); err != nil {
		return fmt.Errorf("watch feishu action outbox: %w", err)
	}
	for {
		select {
		case <-ctx.Done():
			return nil
		case event, ok := <-watcher.Events:
			if !ok {
				return nil
			}
			if !isFeishuActionOutboxEvent(event) {
				continue
			}
			if _, err := b.processFeishuActionOutboxOnce(ctx); err != nil {
				logging.WithError(err).Warn("process feishu resource action failed")
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return nil
			}
			if err != nil {
				logging.WithError(err).Warn("watch feishu resource action outbox failed")
			}
		}
	}
}

func (b *FeishuLongConnBot) processFeishuActionOutboxOnce(ctx context.Context) ([]*FeishuResourceActionResult, error) {
	if b == nil || b.adapter == nil || strings.TrimSpace(b.actionDir) == "" {
		return nil, nil
	}
	helper := NewFeishuResourceActionHelper(b.actionDir, b.adapter.ExecuteFeishuResourceWrite)
	return helper.ProcessOutboxOnce(ctx)
}

func isFeishuActionOutboxEvent(event fsnotify.Event) bool {
	if filepath.Ext(strings.TrimSpace(event.Name)) != ".json" {
		return false
	}
	return event.Op&(fsnotify.Create|fsnotify.Write|fsnotify.Rename) != 0
}

func (b *FeishuLongConnBot) writeFeishuActionContext(messageID string, resources []NormalizedInboundResource) error {
	if b == nil || strings.TrimSpace(b.actionDir) == "" {
		return nil
	}
	return WriteFeishuResourceActionContext(b.actionDir, messageID, resources)
}

func (b *FeishuLongConnBot) feishuResourceActionPaths() *NormalizedInboundResourceAction {
	if b == nil || strings.TrimSpace(b.actionDir) == "" {
		return nil
	}
	root := strings.TrimSpace(b.actionDir)
	return &NormalizedInboundResourceAction{
		ContextPath: filepath.Join(root, "context.json"),
		OutboxPath:  filepath.Join(root, "outbox"),
		ResultsPath: filepath.Join(root, "results"),
	}
}

func defaultFeishuResourceReadOptions() FeishuResourceReadOptions {
	return FeishuResourceReadOptions{
		Sheet: FeishuSheetReadOptions{
			MaxRows:    20,
			MaxColumns: 10,
		},
		Bitable: FeishuBitableReadOptions{
			MaxRecordsPerTable: 20,
		},
	}
}

func normalizeFeishuResourceReadError(err error) (string, string) {
	if err == nil {
		return "", ""
	}
	var readErr *FeishuResourceReadError
	if errors.As(err, &readErr) {
		return strings.TrimSpace(readErr.Code), strings.TrimSpace(readErr.Error())
	}
	return "read_failed", strings.TrimSpace(err.Error())
}

func writeFeishuResourceArtifact(writer *FeishuResourceArtifactWriter, artifact FeishuResourceArtifact) (string, error) {
	if writer == nil || strings.TrimSpace(writer.root) == "" {
		return "", nil
	}
	result, err := writer.Write(artifact)
	if err != nil || result == nil {
		return "", err
	}
	return strings.TrimSpace(result.LocalPath), nil
}

func (b *FeishuLongConnBot) loadQuotedMessage(ctx context.Context, event NormalizedInboundEvent) (*NormalizedInboundContextMessage, error) {
	parentID := strings.TrimSpace(event.ParentID)
	if parentID == "" {
		return nil, nil
	}
	message, err := b.adapter.GetMessage(ctx, parentID)
	if err != nil {
		return nil, err
	}
	if message == nil {
		return nil, nil
	}
	normalized, ok, err := normalizeFeishuContextMessage(message, strings.TrimSpace(event.ChatType))
	if err != nil || !ok {
		return nil, err
	}
	return &normalized, nil
}

func (b *FeishuLongConnBot) loadThreadHistory(ctx context.Context, event NormalizedInboundEvent) ([]NormalizedInboundContextMessage, error) {
	threadID := strings.TrimSpace(event.ThreadID)
	if threadID == "" {
		threadID = strings.TrimSpace(event.RootID)
	}
	if threadID == "" {
		return nil, nil
	}
	items, err := b.adapter.ListMessages(ctx, "thread", threadID, feishuThreadHistoryLimit+feishuQuotedMessageLimit)
	if err != nil {
		return nil, err
	}
	return normalizeFeishuContextHistory(items, strings.TrimSpace(event.ChatType), strings.TrimSpace(event.MessageID), feishuThreadHistoryLimit)
}

func (b *FeishuLongConnBot) loadChatHistory(ctx context.Context, event NormalizedInboundEvent) ([]NormalizedInboundContextMessage, error) {
	chatID := strings.TrimSpace(event.ChannelID)
	if chatID == "" {
		return nil, nil
	}
	items, err := b.adapter.ListMessages(ctx, "chat", chatID, feishuChatHistoryLimit+1)
	if err != nil {
		return nil, err
	}
	return normalizeFeishuContextHistory(items, strings.TrimSpace(event.ChatType), strings.TrimSpace(event.MessageID), feishuChatHistoryLimit)
}

func stringValue(value *string) string {
	if value == nil {
		return ""
	}
	return strings.TrimSpace(*value)
}

func normalizeFeishuMentions(raw []*larkim.MentionEvent) []NormalizedInboundMention {
	if len(raw) == 0 {
		return nil
	}
	mentions := make([]NormalizedInboundMention, 0, len(raw))
	for _, item := range raw {
		if item == nil {
			continue
		}
		mention := NormalizedInboundMention{
			Key:       stringValue(item.Key),
			Name:      stringValue(item.Name),
			TenantKey: stringValue(item.TenantKey),
		}
		if item.Id != nil {
			mention.OpenID = stringValue(item.Id.OpenId)
		}
		if mention.Key == "" && mention.OpenID == "" && mention.Name == "" && mention.TenantKey == "" {
			continue
		}
		mentions = append(mentions, mention)
	}
	if len(mentions) == 0 {
		return nil
	}
	return mentions
}

func resolveMentionPlaceholders(text string, mentions []NormalizedInboundMention) string {
	resolved := strings.TrimSpace(text)
	if resolved == "" || len(mentions) == 0 {
		return resolved
	}
	for _, mention := range mentions {
		if strings.TrimSpace(mention.Key) == "" || strings.TrimSpace(mention.Name) == "" {
			continue
		}
		resolved = strings.ReplaceAll(resolved, mention.Key, "@"+strings.TrimSpace(mention.Name))
	}
	return resolved
}

func normalizeFeishuMessageText(messageType string, contentJSON string, mentions []NormalizedInboundMention) (string, error) {
	normalizedType := strings.TrimSpace(messageType)
	if normalizedType == "" || strings.EqualFold(normalizedType, "text") {
		var content struct {
			Text string `json:"text"`
		}
		if err := json.Unmarshal([]byte(contentJSON), &content); err != nil {
			return "", fmt.Errorf("decode feishu long connection message: %w", err)
		}
		return resolveMentionPlaceholders(strings.TrimSpace(content.Text), mentions), nil
	}
	return fmt.Sprintf("User sent a Feishu %s message. Inspect content_json for resource identifiers.", normalizedType), nil
}

func normalizeFeishuContextHistory(messages []*larkim.Message, chatType string, currentMessageID string, limit int) ([]NormalizedInboundContextMessage, error) {
	if len(messages) == 0 || limit <= 0 {
		return nil, nil
	}
	normalized := make([]NormalizedInboundContextMessage, 0, minInt(len(messages), limit))
	for _, item := range messages {
		if item == nil {
			continue
		}
		if strings.TrimSpace(stringValue(item.MessageId)) == strings.TrimSpace(currentMessageID) {
			continue
		}
		contextMessage, ok, err := normalizeFeishuContextMessage(item, chatType)
		if err != nil {
			return nil, err
		}
		if !ok {
			continue
		}
		normalized = append(normalized, contextMessage)
		if len(normalized) >= limit {
			break
		}
	}
	if len(normalized) == 0 {
		return nil, nil
	}
	return normalized, nil
}

func normalizeFeishuContextMessage(message *larkim.Message, defaultChatType string) (NormalizedInboundContextMessage, bool, error) {
	if message == nil {
		return NormalizedInboundContextMessage{}, false, nil
	}
	messageType := strings.TrimSpace(stringValue(message.MsgType))
	contentJSON := strings.TrimSpace(messageBodyContent(message.Body))
	mentions := normalizeFeishuMessageMentions(message.Mentions)
	messageText, err := normalizeFeishuMessageText(messageType, contentJSON, mentions)
	if err != nil {
		return NormalizedInboundContextMessage{}, false, err
	}

	senderID, senderType := normalizeFeishuSender(message.Sender)
	return NormalizedInboundContextMessage{
		MessageID:   strings.TrimSpace(stringValue(message.MessageId)),
		ChannelID:   strings.TrimSpace(stringValue(message.ChatId)),
		SenderID:    senderID,
		SenderType:  senderType,
		ChatType:    strings.TrimSpace(defaultChatType),
		ThreadID:    strings.TrimSpace(stringValue(message.ThreadId)),
		ParentID:    strings.TrimSpace(stringValue(message.ParentId)),
		RootID:      strings.TrimSpace(stringValue(message.RootId)),
		MessageType: messageType,
		Message:     messageText,
		ContentJSON: contentJSON,
		FileInfo:    extractFeishuFileInfo(messageType, contentJSON),
		Mentions:    mentions,
	}, true, nil
}

func resolvedNormalizedFileInfo(current *NormalizedInboundFileInfo, messageType, contentJSON string) *NormalizedInboundFileInfo {
	if current != nil {
		return current
	}
	return extractFeishuFileInfo(messageType, contentJSON)
}

func (b *FeishuLongConnBot) hydrateHistoryResources(ctx context.Context, messages []NormalizedInboundContextMessage) []NormalizedInboundContextMessage {
	if len(messages) == 0 {
		return messages
	}
	downloaded := make([]NormalizedInboundContextMessage, 0, len(messages))
	for _, item := range messages {
		downloaded = append(downloaded, b.hydrateContextMessageResources(ctx, item))
	}
	return downloaded
}

func (b *FeishuLongConnBot) hydrateContextMessageResources(ctx context.Context, item NormalizedInboundContextMessage) NormalizedInboundContextMessage {
	hydrated := item
	hydrated.FileInfo = resolvedNormalizedFileInfo(hydrated.FileInfo, hydrated.MessageType, hydrated.ContentJSON)
	if fileInfo, err := b.downloadMessageResourceToLocal(ctx, item.MessageID, hydrated.FileInfo); err == nil {
		hydrated.FileInfo = fileInfo
	} else if err != nil {
		logging.WithError(err).Warn("download feishu context message resource failed")
	}
	hydrated.Resources = b.readMessageResources(ctx, hydrated.Message)
	return hydrated
}

func (b *FeishuLongConnBot) downloadMessageResourceToLocal(ctx context.Context, messageID string, fileInfo *NormalizedInboundFileInfo) (*NormalizedInboundFileInfo, error) {
	if b == nil || b.adapter == nil {
		return fileInfo, nil
	}
	if strings.TrimSpace(b.downloadDir) == "" {
		return fileInfo, nil
	}
	info := fileInfo
	if info == nil {
		return nil, nil
	}
	if strings.TrimSpace(info.LocalPath) != "" {
		return info, nil
	}

	resourceType, fileKey := resolveFeishuDownloadTarget(info)
	if resourceType == "" || fileKey == "" {
		return info, nil
	}
	resource, err := b.adapter.DownloadMessageResource(ctx, messageID, fileKey, resourceType)
	if err != nil {
		return info, err
	}
	if resource == nil || len(resource.Content) == 0 {
		return info, nil
	}
	if err := os.MkdirAll(b.downloadDir, 0o755); err != nil {
		return info, err
	}
	localPath := filepath.Join(b.downloadDir, buildFeishuResourceFileName(messageID, fileKey, preferResourceFileName(resource.FileName, info.FileName), resourceType))
	if err := os.WriteFile(localPath, resource.Content, 0o600); err != nil {
		return info, err
	}
	hydrated := *info
	if hydrated.FileName == "" {
		hydrated.FileName = preferResourceFileName(resource.FileName, info.FileName)
	}
	hydrated.LocalPath = localPath
	return &hydrated, nil
}

func resolveFeishuDownloadTarget(info *NormalizedInboundFileInfo) (string, string) {
	if info == nil {
		return "", ""
	}
	switch strings.ToLower(strings.TrimSpace(info.MessageType)) {
	case "image":
		return "image", strings.TrimSpace(info.ImageKey)
	case "file":
		return "file", strings.TrimSpace(info.FileKey)
	default:
		return "", ""
	}
}

func preferResourceFileName(resourceFileName, fallback string) string {
	if strings.TrimSpace(resourceFileName) != "" {
		return strings.TrimSpace(resourceFileName)
	}
	return strings.TrimSpace(fallback)
}

func buildFeishuResourceFileName(messageID, fileKey, fileName, resourceType string) string {
	baseName := sanitizeFeishuResourceName(strings.TrimSpace(strings.TrimSuffix(fileName, filepath.Ext(fileName))))
	ext := strings.TrimSpace(filepath.Ext(fileName))
	if baseName == "" {
		baseName = sanitizeFeishuResourceName(fileKey)
	}
	if baseName == "" {
		baseName = strings.TrimSpace(resourceType)
	}
	if baseName == "" {
		baseName = "resource"
	}
	if ext == "" {
		ext = ".bin"
	}
	return fmt.Sprintf("%s-%s%s", sanitizeFeishuResourceName(messageID), baseName, ext)
}

func sanitizeFeishuResourceName(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}
	var builder strings.Builder
	for _, r := range trimmed {
		switch {
		case r >= 'a' && r <= 'z':
			builder.WriteRune(r)
		case r >= 'A' && r <= 'Z':
			builder.WriteRune(r)
		case r >= '0' && r <= '9':
			builder.WriteRune(r)
		case r == '.', r == '-', r == '_':
			builder.WriteRune(r)
		default:
			builder.WriteRune('_')
		}
	}
	return strings.Trim(builder.String(), "._-")
}

func messageBodyContent(body *larkim.MessageBody) string {
	if body == nil || body.Content == nil {
		return ""
	}
	return strings.TrimSpace(*body.Content)
}

func normalizeFeishuSender(sender *larkim.Sender) (string, string) {
	if sender == nil {
		return "", ""
	}
	return strings.TrimSpace(stringValue(sender.Id)), strings.TrimSpace(stringValue(sender.SenderType))
}

func normalizeFeishuMessageMentions(raw []*larkim.Mention) []NormalizedInboundMention {
	if len(raw) == 0 {
		return nil
	}
	mentions := make([]NormalizedInboundMention, 0, len(raw))
	for _, item := range raw {
		if item == nil {
			continue
		}
		mention := NormalizedInboundMention{
			Key:       stringValue(item.Key),
			OpenID:    stringValue(item.Id),
			Name:      stringValue(item.Name),
			TenantKey: stringValue(item.TenantKey),
		}
		if mention.Key == "" && mention.OpenID == "" && mention.Name == "" && mention.TenantKey == "" {
			continue
		}
		mentions = append(mentions, mention)
	}
	if len(mentions) == 0 {
		return nil
	}
	return mentions
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
