package dto

type LoginInitRequest struct {
	Method       string `json:"method,omitempty"`
	RedirectPort int    `json:"redirect_port,omitempty"`
}

type LoginCallbackRequest struct {
	LoginSessionID string `json:"login_session_id"`
	Code           string `json:"code"`
	State          string `json:"state,omitempty"`
	RedirectURI    string `json:"redirect_uri,omitempty"`
}

type LoginPollRequest struct {
	LoginSessionID string `json:"login_session_id"`
}
