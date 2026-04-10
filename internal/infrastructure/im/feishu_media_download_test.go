package im

import (
	"context"
	"os"
	"strings"
	"testing"

	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
)

func TestFeishuLongConnBot_HandleNormalizedEventDownloadsCurrentImageToLocalPath(t *testing.T) {
	tmpDir := t.TempDir()
	var gotEvent NormalizedInboundEvent

	adapter := NewFeishuAdapter(FeishuAdapterConfig{})
	adapter.downloadMessageResource = func(ctx context.Context, messageID string, fileKey string, resourceType string) (*DownloadedMessageResource, error) {
		if messageID != "om_image" {
			t.Fatalf("unexpected message id %q", messageID)
		}
		if fileKey != "img_123" {
			t.Fatalf("unexpected file key %q", fileKey)
		}
		if resourceType != "image" {
			t.Fatalf("unexpected resource type %q", resourceType)
		}
		return &DownloadedMessageResource{
			Content:  []byte("image-bytes"),
			FileName: "screen.png",
		}, nil
	}

	bot := NewFeishuLongConnBot(FeishuLongConnBotConfig{
		AppID:       "cli_appid",
		AppSecret:   "app_secret",
		Adapter:     adapter,
		DownloadDir: tmpDir,
		HandleInbound: func(ctx context.Context, event NormalizedInboundEvent) (string, error) {
			gotEvent = event
			return "", nil
		},
	})
	if bot == nil {
		t.Fatal("expected bot to be constructed")
	}

	err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:    "feishu",
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		MessageID:   "om_image",
		SenderID:    "ou_sender",
		ChatType:    "p2p",
		MessageType: "image",
		Message:     "User sent a Feishu image message. Inspect content_json for resource identifiers.",
		ContentJSON: `{"image_key":"img_123"}`,
	})
	if err != nil {
		t.Fatalf("handleNormalizedEvent() error = %v", err)
	}
	if gotEvent.FileInfo == nil || strings.TrimSpace(gotEvent.FileInfo.LocalPath) == "" {
		t.Fatalf("expected downloaded local path in current event, got %+v", gotEvent.FileInfo)
	}
	content, readErr := os.ReadFile(gotEvent.FileInfo.LocalPath)
	if readErr != nil {
		t.Fatalf("ReadFile() error = %v", readErr)
	}
	if string(content) != "image-bytes" {
		t.Fatalf("unexpected downloaded content %q", string(content))
	}
	rendered := gotEvent.AgentInputText()
	if !strings.Contains(rendered, `local_path="`) {
		t.Fatalf("expected rendered local_path, got %s", rendered)
	}
}

func TestFeishuLongConnBot_HandleNormalizedEventDownloadsQuotedAndHistoryMedia(t *testing.T) {
	tmpDir := t.TempDir()
	var gotEvent NormalizedInboundEvent

	adapter := NewFeishuAdapter(FeishuAdapterConfig{})
	adapter.getMessage = func(ctx context.Context, messageID string) (*larkim.Message, error) {
		return buildHistoryMessage("om_parent", "oc_chat", "ou_sender", "user", "image", `{"image_key":"img_parent"}`), nil
	}
	adapter.listMessages = func(ctx context.Context, containerType string, containerID string, limit int) ([]*larkim.Message, error) {
		switch containerType {
		case "thread":
			return []*larkim.Message{
				buildHistoryMessage("om_text", "oc_chat", "ou_sender", "user", "text", `{"text":"看看这个图"}`),
				buildHistoryMessage("om_thread_image", "oc_chat", "ou_sender", "user", "image", `{"image_key":"img_thread"}`),
			}, nil
		case "chat":
			return []*larkim.Message{
				buildHistoryMessage("om_chat_file", "oc_chat", "ou_sender", "user", "file", `{"file_key":"file_chat","file_name":"spec.pdf"}`),
				buildHistoryMessage("om_text", "oc_chat", "ou_sender", "user", "text", `{"text":"看看这个图"}`),
			}, nil
		default:
			return nil, nil
		}
	}
	adapter.downloadMessageResource = func(ctx context.Context, messageID string, fileKey string, resourceType string) (*DownloadedMessageResource, error) {
		return &DownloadedMessageResource{
			Content:  []byte(messageID + ":" + fileKey + ":" + resourceType),
			FileName: fileKey + ".bin",
		}, nil
	}

	bot := NewFeishuLongConnBot(FeishuLongConnBotConfig{
		AppID:       "cli_appid",
		AppSecret:   "app_secret",
		Adapter:     adapter,
		DownloadDir: tmpDir,
		HandleInbound: func(ctx context.Context, event NormalizedInboundEvent) (string, error) {
			gotEvent = event
			return "", nil
		},
	})
	if bot == nil {
		t.Fatal("expected bot to be constructed")
	}

	err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:    "feishu",
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		MessageID:   "om_text",
		SenderID:    "ou_sender",
		ChatType:    "p2p",
		ThreadID:    "omt_thread",
		ParentID:    "om_parent",
		MessageType: "text",
		Message:     "看看这个图",
	})
	if err != nil {
		t.Fatalf("handleNormalizedEvent() error = %v", err)
	}
	if gotEvent.QuotedMessage == nil || gotEvent.QuotedMessage.FileInfo == nil || gotEvent.QuotedMessage.FileInfo.LocalPath == "" {
		t.Fatalf("expected quoted media local path, got %+v", gotEvent.QuotedMessage)
	}
	if len(gotEvent.ThreadHistory) != 1 || gotEvent.ThreadHistory[0].FileInfo == nil || gotEvent.ThreadHistory[0].FileInfo.LocalPath == "" {
		t.Fatalf("expected thread history media local path, got %+v", gotEvent.ThreadHistory)
	}
	if len(gotEvent.ChatHistory) != 1 || gotEvent.ChatHistory[0].FileInfo == nil || gotEvent.ChatHistory[0].FileInfo.LocalPath == "" {
		t.Fatalf("expected chat history media local path, got %+v", gotEvent.ChatHistory)
	}
	rendered := gotEvent.AgentInputText()
	if !strings.Contains(rendered, `local_path="`) {
		t.Fatalf("expected rendered local_path in enriched context, got %s", rendered)
	}
}
