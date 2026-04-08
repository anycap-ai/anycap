package im

type NormalizedInboundEvent struct {
	Platform          string
	BotID             string
	ChannelID         string
	SenderID          string
	Message           string
	IsURLVerification bool
	Challenge         string
}
