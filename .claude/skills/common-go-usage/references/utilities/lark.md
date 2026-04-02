# lark

Lark/Feishu bot messaging.

```go
import "gitlab.knoffice.tech/open/common-go/lark/bot"
```

## Create Bot

```go
b, err := bot.NewBot(&bot.BotOptions{
	AppID:      "cli_xxxxx",
	AppSecret:  "secret",
	TemplateID: "AAq9GawQoRSCy",  // Optional, has default
})
if err != nil {
	log.Fatal(err)
}
```

## Send Message

```go
err := b.SendMessage(ctx, "Message content", &bot.SendMessageOptions{
	GroupChatIDs: []string{"oc_xxxxx"},      // Group chats
	UserOpenIDs:  []string{"ou_xxxxx"},      // Users by open ID
	UserEmails:   []string{"user@example.com"}, // Users by email
})
```

## Message Content

Content supports [Lark card rich text](https://open.feishu.cn/document/feishu-cards/card-components/content-components/rich-text):

```go
content := `**Bold text**
Normal text
- List item 1
- List item 2`

b.SendMessage(ctx, content, opts)
```

## SendMessageOptions

| Field | Description |
|-------|-------------|
| `GroupChatIDs` | List of group chat IDs |
| `UserOpenIDs` | List of user open IDs |
| `UserEmails` | List of user email addresses |

At least one recipient type is required.
