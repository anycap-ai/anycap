package dto

type LoginInitRequest struct {
	Method       string `json:"method,omitempty"`
	RedirectPort int    `json:"redirect_port,omitempty"`
	RedirectURL  string `json:"redirect_url,omitempty"`
}

type LoginCallbackRequest struct {
	LoginSessionID string `json:"login_session_id"`
	Code           string `json:"code"`
	State          string `json:"state,omitempty"`
	RedirectURI    string `json:"redirect_uri,omitempty"`
}

type LoginPollRequest struct {
	LoginSessionID string `json:"login_session_id"`
	PollToken      string `json:"poll_token,omitempty"`
}

type DeviceCodeCheckRequest struct {
	UserCode string `json:"user_code"`
}

type DeviceVerifyRequest struct {
	UserCode string `json:"user_code"`
	User     struct {
		ID    string `json:"id,omitempty"`
		Email string `json:"email,omitempty"`
		Name  string `json:"name,omitempty"`
	} `json:"user,omitempty"`
}

type BrowserBindRequest struct {
	BrowserToken string `json:"browser_token"`
}

type BrowserCompleteRequest struct {
	LoginSessionID string `json:"login_session_id"`
	BrowserToken   string `json:"browser_token"`
	Code           string `json:"code"`
	State          string `json:"state,omitempty"`
	RedirectURI    string `json:"redirect_uri,omitempty"`
}
