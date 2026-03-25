package model

type CallLog struct {
	RequestID  string `json:"request_id"`
	UserID     string `json:"user_id"`
	APIKeyID   string `json:"api_key_id,omitempty"`
	Capability string `json:"capability"`
	Model      string `json:"model,omitempty"`
	Status     string `json:"status"`
	LatencyMS  int64  `json:"latency_ms,omitempty"`
	CreditCost int64  `json:"credit_cost,omitempty"`
	ErrorCode  string `json:"error_code,omitempty"`
}
