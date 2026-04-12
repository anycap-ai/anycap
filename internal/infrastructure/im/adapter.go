package im

import (
	"encoding/json"
	"fmt"
	"html"
	"strings"
)

type NormalizedInboundMention struct {
	Key       string
	OpenID    string
	Name      string
	TenantKey string
}

type NormalizedInboundEvent struct {
	Platform          string
	BotID             string
	ChannelID         string
	MessageID         string
	SenderID          string
	ChatType          string
	ThreadID          string
	ParentID          string
	RootID            string
	MessageType       string
	Message           string
	ContentJSON       string
	FileInfo          *NormalizedInboundFileInfo
	Mentions          []NormalizedInboundMention
	Resources         []NormalizedInboundResource
	QuotedMessage     *NormalizedInboundContextMessage
	ThreadHistory     []NormalizedInboundContextMessage
	ChatHistory       []NormalizedInboundContextMessage
	IsURLVerification bool
	Challenge         string
}

type NormalizedInboundContextMessage struct {
	MessageID   string
	ChannelID   string
	SenderID    string
	SenderType  string
	ChatType    string
	ThreadID    string
	ParentID    string
	RootID      string
	MessageType string
	Message     string
	ContentJSON string
	FileInfo    *NormalizedInboundFileInfo
	Mentions    []NormalizedInboundMention
	Resources   []NormalizedInboundResource
}

type NormalizedInboundFileInfo struct {
	MessageType string
	ImageKey    string
	FileKey     string
	FileName    string
	LocalPath   string
}

type NormalizedInboundResource struct {
	URL       string
	Kind      FeishuResourceKind
	Token     string
	Title     string
	ReadMode  string
	LocalPath string
	ErrorCode string
	ErrorText string
	ReadError error
}

func (e NormalizedInboundEvent) AgentInputText() string {
	current := NormalizedInboundContextMessage{
		MessageID:   e.MessageID,
		ChannelID:   e.ChannelID,
		SenderID:    e.SenderID,
		SenderType:  "user",
		ChatType:    e.ChatType,
		ThreadID:    e.ThreadID,
		ParentID:    e.ParentID,
		RootID:      e.RootID,
		MessageType: e.MessageType,
		Message:     e.Message,
		ContentJSON: e.ContentJSON,
		FileInfo:    e.FileInfo,
		Mentions:    e.Mentions,
		Resources:   e.Resources,
	}
	if len(e.ThreadHistory) == 0 && len(e.ChatHistory) == 0 && e.QuotedMessage == nil {
		return current.renderFeishuMessage("")
	}

	lines := []string{"<feishu-context>"}
	lines = append(lines, "  <current_message>")
	lines = append(lines, current.renderFeishuMessage("    "))
	lines = append(lines, "  </current_message>")
	if e.QuotedMessage != nil {
		lines = append(lines, "  <quoted_message>")
		lines = append(lines, e.QuotedMessage.renderFeishuMessage("    "))
		lines = append(lines, "  </quoted_message>")
	}
	if len(e.ThreadHistory) > 0 {
		lines = append(lines, "  <thread_history>")
		for _, item := range e.ThreadHistory {
			lines = append(lines, item.renderHistoryMessage("    "))
		}
		lines = append(lines, "  </thread_history>")
	}
	if len(e.ChatHistory) > 0 {
		lines = append(lines, "  <chat_history>")
		for _, item := range e.ChatHistory {
			lines = append(lines, item.renderHistoryMessage("    "))
		}
		lines = append(lines, "  </chat_history>")
	}
	lines = append(lines, "</feishu-context>")
	return strings.Join(lines, "\n")
}

func (m NormalizedInboundContextMessage) renderFeishuMessage(indent string) string {
	var attrs []string
	appendAttr := func(name, value string) {
		value = strings.TrimSpace(value)
		if value == "" {
			return
		}
		attrs = append(attrs, fmt.Sprintf(`%s="%s"`, name, html.EscapeString(value)))
	}

	appendAttr("message_id", m.MessageID)
	appendAttr("chat_id", m.ChannelID)
	appendAttr("chat_type", m.ChatType)
	appendAttr("message_type", m.MessageType)
	appendAttr("sender_open_id", m.SenderID)
	appendAttr("sender_type", m.SenderType)
	appendAttr("thread_id", m.ThreadID)
	appendAttr("parent_id", m.ParentID)
	appendAttr("root_id", m.RootID)

	header := fmt.Sprintf("%s<feishu-message", indent)
	if len(attrs) > 0 {
		header = fmt.Sprintf("%s %s", header, strings.Join(attrs, " "))
	}
	header += ">"

	lines := []string{header}
	if len(m.Mentions) > 0 {
		lines = append(lines, indent+"  <mentions>")
		for _, mention := range m.Mentions {
			mentionAttrs := make([]string, 0, 4)
			if key := strings.TrimSpace(mention.Key); key != "" {
				mentionAttrs = append(mentionAttrs, fmt.Sprintf(`key="%s"`, html.EscapeString(key)))
			}
			if openID := strings.TrimSpace(mention.OpenID); openID != "" {
				mentionAttrs = append(mentionAttrs, fmt.Sprintf(`open_id="%s"`, html.EscapeString(openID)))
			}
			if name := strings.TrimSpace(mention.Name); name != "" {
				mentionAttrs = append(mentionAttrs, fmt.Sprintf(`name="%s"`, html.EscapeString(name)))
			}
			if tenantKey := strings.TrimSpace(mention.TenantKey); tenantKey != "" {
				mentionAttrs = append(mentionAttrs, fmt.Sprintf(`tenant_key="%s"`, html.EscapeString(tenantKey)))
			}
			lines = append(lines, fmt.Sprintf("%s    <mention %s />", indent, strings.Join(mentionAttrs, " ")))
		}
		lines = append(lines, indent+"  </mentions>")
	}
	if fileInfo := m.resolvedFileInfo(); fileInfo != nil {
		lines = append(lines, fileInfo.render(indent+"  "))
	}
	if len(m.Resources) > 0 {
		lines = append(lines, renderFeishuResources(m.Resources, indent+"  "))
	}
	if strings.EqualFold(strings.TrimSpace(m.MessageType), "text") {
		lines = append(lines, indent+html.EscapeString(strings.TrimSpace(m.Message)))
	} else {
		if notice := strings.TrimSpace(m.Message); notice != "" {
			lines = append(lines, fmt.Sprintf("%s  <resource_notice>%s</resource_notice>", indent, html.EscapeString(notice)))
		}
		if raw := strings.TrimSpace(m.ContentJSON); raw != "" {
			lines = append(lines, fmt.Sprintf("%s  <content_json>%s</content_json>", indent, html.EscapeString(raw)))
		}
	}
	lines = append(lines, indent+"</feishu-message>")
	return strings.Join(lines, "\n")
}

func (m NormalizedInboundContextMessage) renderHistoryMessage(indent string) string {
	var attrs []string
	appendAttr := func(name, value string) {
		value = strings.TrimSpace(value)
		if value == "" {
			return
		}
		attrs = append(attrs, fmt.Sprintf(`%s="%s"`, name, html.EscapeString(value)))
	}
	appendAttr("role", m.role())
	appendAttr("message_id", m.MessageID)
	appendAttr("chat_id", m.ChannelID)
	appendAttr("message_type", m.MessageType)
	appendAttr("sender_open_id", m.SenderID)
	appendAttr("sender_type", m.SenderType)
	appendAttr("thread_id", m.ThreadID)
	appendAttr("parent_id", m.ParentID)
	appendAttr("root_id", m.RootID)

	header := fmt.Sprintf("%s<message", indent)
	if len(attrs) > 0 {
		header = fmt.Sprintf("%s %s", header, strings.Join(attrs, " "))
	}
	header += ">"

	lines := []string{header}
	if fileInfo := m.resolvedFileInfo(); fileInfo != nil {
		lines = append(lines, fileInfo.render(indent+"  "))
	}
	if len(m.Resources) > 0 {
		lines = append(lines, renderFeishuResources(m.Resources, indent+"  "))
	}
	if text := strings.TrimSpace(m.Message); text != "" {
		lines = append(lines, indent+"  "+html.EscapeString(text))
	}
	if !strings.EqualFold(strings.TrimSpace(m.MessageType), "text") {
		if raw := strings.TrimSpace(m.ContentJSON); raw != "" {
			lines = append(lines, fmt.Sprintf("%s  <content_json>%s</content_json>", indent, html.EscapeString(raw)))
		}
	}
	lines = append(lines, indent+"</message>")
	return strings.Join(lines, "\n")
}

func (m NormalizedInboundContextMessage) role() string {
	if strings.EqualFold(strings.TrimSpace(m.SenderType), "app") {
		return "assistant"
	}
	return "user"
}

func (m NormalizedInboundContextMessage) resolvedFileInfo() *NormalizedInboundFileInfo {
	if m.FileInfo != nil {
		return m.FileInfo
	}
	return extractFeishuFileInfo(m.MessageType, m.ContentJSON)
}

func extractFeishuFileInfo(messageType, contentJSON string) *NormalizedInboundFileInfo {
	normalizedType := strings.TrimSpace(messageType)
	switch normalizedType {
	case "file", "image", "audio", "media", "video":
	default:
		return nil
	}

	var content map[string]any
	if err := json.Unmarshal([]byte(contentJSON), &content); err != nil {
		return nil
	}
	info := &NormalizedInboundFileInfo{
		MessageType: normalizedType,
		ImageKey:    strings.TrimSpace(stringFromMap(content, "image_key")),
		FileKey:     strings.TrimSpace(stringFromMap(content, "file_key")),
		FileName:    strings.TrimSpace(stringFromMap(content, "file_name")),
	}
	if info.ImageKey == "" && info.FileKey == "" && info.FileName == "" {
		return nil
	}
	return info
}

func (i NormalizedInboundFileInfo) render(indent string) string {
	var attrs []string
	appendAttr := func(name, value string) {
		value = strings.TrimSpace(value)
		if value == "" {
			return
		}
		attrs = append(attrs, fmt.Sprintf(`%s="%s"`, name, html.EscapeString(value)))
	}
	appendAttr("type", i.MessageType)
	appendAttr("image_key", i.ImageKey)
	appendAttr("file_key", i.FileKey)
	appendAttr("file_name", i.FileName)
	appendAttr("local_path", i.LocalPath)
	return fmt.Sprintf("%s<file_info %s />", indent, strings.Join(attrs, " "))
}

func renderFeishuResources(resources []NormalizedInboundResource, indent string) string {
	lines := []string{indent + "<feishu-resources>"}
	for _, resource := range resources {
		var attrs []string
		appendAttr := func(name, value string) {
			value = strings.TrimSpace(value)
			if value == "" {
				return
			}
			attrs = append(attrs, fmt.Sprintf(`%s="%s"`, name, html.EscapeString(value)))
		}
		appendAttr("url", resource.URL)
		appendAttr("kind", string(resource.Kind))
		appendAttr("token", resource.Token)
		appendAttr("title", resource.Title)
		appendAttr("read_mode", resource.ReadMode)
		appendAttr("local_path", resource.LocalPath)

		lines = append(lines, fmt.Sprintf("%s  <feishu-resource %s>", indent, strings.Join(attrs, " ")))
		if resource.ErrorCode != "" || resource.ErrorText != "" {
			var errorAttrs []string
			if code := strings.TrimSpace(resource.ErrorCode); code != "" {
				errorAttrs = append(errorAttrs, fmt.Sprintf(`code="%s"`, html.EscapeString(code)))
			}
			if text := strings.TrimSpace(resource.ErrorText); text != "" {
				errorAttrs = append(errorAttrs, fmt.Sprintf(`message="%s"`, html.EscapeString(text)))
			}
			lines = append(lines, fmt.Sprintf("%s    <read_error %s />", indent, strings.Join(errorAttrs, " ")))
		}
		lines = append(lines, indent+"  </feishu-resource>")
	}
	lines = append(lines, indent+"</feishu-resources>")
	return strings.Join(lines, "\n")
}

func stringFromMap(values map[string]any, key string) string {
	raw, ok := values[key]
	if !ok || raw == nil {
		return ""
	}
	typed, ok := raw.(string)
	if !ok {
		return ""
	}
	return typed
}
