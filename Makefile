MODULE   := gitlab.knoffice.tech/engineering/anycap
VERSION  := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT   := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
DATE     := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)

LDFLAGS  := -s -w \
  -X $(MODULE)/pkg/buildinfo.Version=$(VERSION) \
  -X $(MODULE)/pkg/buildinfo.Commit=$(COMMIT) \
  -X $(MODULE)/pkg/buildinfo.Date=$(DATE)

BINARIES := anycap anycap-server anycap-mock

.PHONY: all build install install-bin clean test lint setup-hooks tools dev $(BINARIES)

all:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  build        Build all binaries ($(BINARIES))"
	@echo "  dev          Start dev server (go run)"
	@echo "  test         Run tests"
	@echo "  lint         Run linter"
	@echo "  install      Setup hooks and install tools"
	@echo "  install-bin  go install CLI and server"
	@echo "  clean        Remove built binaries"

build: $(BINARIES)

$(BINARIES):
	go build -ldflags '$(LDFLAGS)' -o ./$@ ./cmd/$@

install: setup-hooks tools
	@echo "done: hooks and tools installed"

install-bin:
	go install -ldflags '$(LDFLAGS)' ./cmd/anycap
	go install -ldflags '$(LDFLAGS)' ./cmd/anycap-server

test:
	go test ./...

lint:
	golangci-lint run ./...

setup-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/*
	@echo "git hooks installed (.githooks/)"

tools:
	go install golang.org/x/tools/cmd/goimports@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

dev:
	go run -ldflags '$(LDFLAGS)' ./cmd/anycap-server

clean:
	rm -f $(BINARIES)
