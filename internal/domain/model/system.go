package model

type ServiceStatus struct {
	Name    string `json:"name"`
	Env     string `json:"env"`
	Version string `json:"version"`
	Commit  string `json:"commit"`
	BuildAt string `json:"build_at"`
	Status  string `json:"status"`
}

type LoginInitResult struct {
	FlowType        string `json:"flow_type"`
	LoginSessionID  string `json:"login_session_id"`
	AuthorizeURL    string `json:"authorize_url,omitempty"`
	VerificationURI string `json:"verification_uri,omitempty"`
	UserCode        string `json:"user_code,omitempty"`
	State           string `json:"state,omitempty"`
	ExpiresIn       int    `json:"expires_in,omitempty"`
	Interval        int    `json:"interval,omitempty"`
}

type LoginCallbackResult struct {
	APIKeyID string     `json:"api_key_id"`
	APIKey   string     `json:"api_key"`
	User     *LoginUser `json:"user,omitempty"`
}

type LoginPollResult struct {
	Status   string     `json:"status"`
	APIKeyID string     `json:"api_key_id,omitempty"`
	APIKey   string     `json:"api_key,omitempty"`
	User     *LoginUser `json:"user,omitempty"`
}

type LoginUser struct {
	ID    string `json:"id"`
	Email string `json:"email,omitempty"`
	Name  string `json:"name,omitempty"`
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
