package config

import (
	"errors"
	"testing"
)

func TestInitRateLimitDConf_SkipsWhenDisabled(t *testing.T) {
	called := false
	originalInit := initRateLimitDConfClient
	t.Cleanup(func() {
		initRateLimitDConfClient = originalInit
	})
	initRateLimitDConfClient = func() error {
		called = true
		return nil
	}

	if err := InitRateLimitDConf(Config{RateLimitDConfEnabled: false}); err != nil {
		t.Fatalf("InitRateLimitDConf() error = %v", err)
	}
	if called {
		t.Fatal("expected init to be skipped when dconf disabled")
	}
}

func TestInitRateLimitDConf_CallsInitWhenEnabled(t *testing.T) {
	called := false
	originalInit := initRateLimitDConfClient
	t.Cleanup(func() {
		initRateLimitDConfClient = originalInit
	})
	initRateLimitDConfClient = func() error {
		called = true
		return nil
	}

	err := InitRateLimitDConf(Config{
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})
	if err != nil {
		t.Fatalf("InitRateLimitDConf() error = %v", err)
	}
	if !called {
		t.Fatal("expected init to be called when dconf enabled")
	}
}

func TestInitRateLimitDConf_ReturnsInitError(t *testing.T) {
	originalInit := initRateLimitDConfClient
	t.Cleanup(func() {
		initRateLimitDConfClient = originalInit
	})
	initRateLimitDConfClient = func() error {
		return errors.New("init failed")
	}

	err := InitRateLimitDConf(Config{
		RateLimitDConfEnabled: true,
	})
	if err == nil {
		t.Fatal("expected init error")
	}
}

func TestStopRateLimitDConf_SkipsWhenDisabled(t *testing.T) {
	called := false
	originalStop := stopRateLimitDConfClient
	t.Cleanup(func() {
		stopRateLimitDConfClient = originalStop
	})
	stopRateLimitDConfClient = func() error {
		called = true
		return nil
	}

	if err := StopRateLimitDConf(Config{RateLimitDConfEnabled: false}); err != nil {
		t.Fatalf("StopRateLimitDConf() error = %v", err)
	}
	if called {
		t.Fatal("expected stop to be skipped when dconf disabled")
	}
}

func TestStopRateLimitDConf_CallsStopWhenEnabled(t *testing.T) {
	called := false
	originalStop := stopRateLimitDConfClient
	t.Cleanup(func() {
		stopRateLimitDConfClient = originalStop
	})
	stopRateLimitDConfClient = func() error {
		called = true
		return nil
	}

	err := StopRateLimitDConf(Config{
		RateLimitDConfEnabled: true,
	})
	if err != nil {
		t.Fatalf("StopRateLimitDConf() error = %v", err)
	}
	if !called {
		t.Fatal("expected stop to be called when dconf enabled")
	}
}
