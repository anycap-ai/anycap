MODULE   := gitlab.knoffice.tech/engineering/anycap
VERSION  := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT   := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
DATE     := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)

LDFLAGS  := -s -w \
  -X $(MODULE)/pkg/buildinfo.Version=$(VERSION) \
  -X $(MODULE)/pkg/buildinfo.Commit=$(COMMIT) \
  -X $(MODULE)/pkg/buildinfo.Date=$(DATE)

BINARIES := anycap anycap-server anycap-mock

.PHONY: all build install install-bin clean test lint setup-hooks tools dev infra-up infra-down infra-reset $(BINARIES)

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
	@echo "  infra-up     Start local Postgres + Redis (docker compose)"
	@echo "  infra-down   Stop local infra"
	@echo "  infra-reset  Destroy local infra volumes and restart"

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

# ---------- Local Infrastructure ----------

infra-up:
	docker compose up -d
	@echo "waiting for postgres..."
	@until docker compose exec -T postgres pg_isready -U anycap >/dev/null 2>&1; do sleep 1; done
	@echo "postgres ready  -> localhost:15432 (user=anycap pass=anycap db=anycap)"
	@echo "redis ready     -> localhost:16379 (no password)"

infra-down:
	docker compose down

infra-reset:
	docker compose down -v
	$(MAKE) infra-up
