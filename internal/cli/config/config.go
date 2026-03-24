package config

import "os"

const DefaultEndpoint = "http://127.0.0.1:8080"

func ResolveEndpoint(override string) string {
	if override != "" {
		return override
	}

	if endpoint := os.Getenv("ANYCAP_API_ENDPOINT"); endpoint != "" {
		return endpoint
	}

	return DefaultEndpoint
}
