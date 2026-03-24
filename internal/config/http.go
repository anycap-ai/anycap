package config

import "os"

const defaultHTTPAddr = ":8080"

func HTTPAddr() string {
	addr := os.Getenv("ANYCAP_HTTP_ADDR")
	if addr == "" {
		return defaultHTTPAddr
	}

	return addr
}
