package config

import "os"

const (
	defaultServiceName = "anycap"
	defaultAppEnv      = "local"
	defaultHTTPAddr    = ":8080"
)

type Config struct {
	App  AppConfig
	HTTP HTTPConfig
}

type AppConfig struct {
	Name string
	Env  string
}

type HTTPConfig struct {
	Addr string
}

func Load() Config {
	return Config{
		App: AppConfig{
			Name: getEnv("ANYCAP_SERVICE_NAME", defaultServiceName),
			Env:  getEnv("ANYCAP_APP_ENV", defaultAppEnv),
		},
		HTTP: HTTPConfig{
			Addr: getEnv("ANYCAP_HTTP_ADDR", defaultHTTPAddr),
		},
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
