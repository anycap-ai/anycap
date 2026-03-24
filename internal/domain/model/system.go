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
	AuthURL string `json:"auth_url"`
	State   string `json:"state"`
}
