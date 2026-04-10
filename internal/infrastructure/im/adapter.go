package im

import (
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
	Mentions          []NormalizedInboundMention
	IsURLVerification bool
	Challenge         string
}

func (e NormalizedInboundEvent) AgentInputText() string {
	var attrs []string
	appendAttr := func(name, value string) {
		value = strings.TrimSpace(value)
		if value == "" {
			return
		}
		attrs = append(attrs, fmt.Sprintf(`%s="%s"`, name, html.EscapeString(value)))
	}

	appendAttr("message_id", e.MessageID)
	appendAttr("chat_id", e.ChannelID)
	appendAttr("chat_type", e.ChatType)
	appendAttr("message_type", e.MessageType)
	appendAttr("sender_open_id", e.SenderID)
	appendAttr("thread_id", e.ThreadID)
	appendAttr("parent_id", e.ParentID)
	appendAttr("root_id", e.RootID)

	lines := []string{fmt.Sprintf("<feishu-message %s>", strings.Join(attrs, " "))}
	if len(e.Mentions) > 0 {
		lines = append(lines, "  <mentions>")
		for _, mention := range e.Mentions {
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
			lines = append(lines, fmt.Sprintf("    <mention %s />", strings.Join(mentionAttrs, " ")))
		}
		lines = append(lines, "  </mentions>")
	}
	if strings.EqualFold(strings.TrimSpace(e.MessageType), "text") {
		lines = append(lines, html.EscapeString(strings.TrimSpace(e.Message)))
	} else {
		if notice := strings.TrimSpace(e.Message); notice != "" {
			lines = append(lines, fmt.Sprintf("  <resource_notice>%s</resource_notice>", html.EscapeString(notice)))
		}
		if raw := strings.TrimSpace(e.ContentJSON); raw != "" {
			lines = append(lines, fmt.Sprintf("  <content_json>%s</content_json>", html.EscapeString(raw)))
		}
	}
	lines = append(lines, "</feishu-message>")
	return strings.Join(lines, "\n")
}
