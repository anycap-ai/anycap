package config

import "os"

const (
	defaultAppName  = "anycap-server"
	defaultAppEnv   = "local"
	defaultHTTPAddr = ":8080"
)

type Config struct {
	AppName         string
	AppEnv          string
	HTTPAddr        string
	NexusHubBaseURL string
	NexusHubToken   string
}

func Load() Config {
	return Config{
		AppName:         getEnv("ANYCAP_APP_NAME", defaultAppName),
		AppEnv:          getEnv("ANYCAP_APP_ENV", defaultAppEnv),
		HTTPAddr:        getEnv("ANYCAP_HTTP_ADDR", defaultHTTPAddr),
		NexusHubBaseURL: getEnv("NEXUSHUB_BASE_URL", ""),
		NexusHubToken:   getEnv("NEXUSHUB_TOKEN", ""),
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
