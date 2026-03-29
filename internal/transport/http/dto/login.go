package dto

type LoginInitRequest struct {
	Method string `json:"method,omitempty"`
}

type LoginPollRequest struct {
	LoginSessionID string `json:"login_session_id"`
	PollToken      string `json:"poll_token,omitempty"`
}

type DeviceCodeCheckRequest struct {
	UserCode string `json:"user_code"`
}

type DeviceVerifyRequest struct {
	UserCode string           `json:"user_code"`
	User     *AuthUserProfile `json:"user,omitempty"`
}

type BrowserVerifyRequest struct {
	BrowserToken string           `json:"browser_token"`
	User         *AuthUserProfile `json:"user,omitempty"`
}

type AuthUserProfile struct {
	Email   string `json:"email,omitempty"`
	Name    string `json:"name,omitempty"`
	Picture string `json:"picture,omitempty"`
}
