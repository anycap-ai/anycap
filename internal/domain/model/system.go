package model

type ServiceStatus struct {
	Name     string          `json:"name"`
	Env      string          `json:"env"`
	Version  string          `json:"version"`
	Commit   string          `json:"commit"`
	BuildAt  string          `json:"build_at"`
	Status   string          `json:"status"`
	Features map[string]bool `json:"features,omitempty"`
}

type LoginInitResult struct {
	AuthURL string `json:"auth_url"`
	State   string `json:"state"`
}

type LoginCallbackResult struct {
	UserID   string `json:"user_id"`
	APIKeyID string `json:"api_key_id"`
	APIKey   string `json:"api_key"`
}

type Balance struct {
	Available int64  `json:"available"`
	Currency  string `json:"currency"`
}

type StatusResult struct {
	Service     ServiceStatus `json:"service"`
	RuntimeMode string        `json:"runtime_mode"`
	User        *Principal    `json:"user,omitempty"`
}

type CheckoutSession struct {
	ID  string `json:"id"`
	URL string `json:"url"`
}

type PaymentEvent struct {
	ID     string `json:"id"`
	Type   string `json:"type"`
	UserID string `json:"user_id,omitempty"`
}
