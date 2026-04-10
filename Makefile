MODULE   := gitlab.knoffice.tech/engineering/anycap
VERSION  := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT   := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
DATE     := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)

LDFLAGS  := -s -w \
  -X $(MODULE)/pkg/buildinfo.Version=$(VERSION) \
  -X $(MODULE)/pkg/buildinfo.Commit=$(COMMIT) \
  -X $(MODULE)/pkg/buildinfo.Date=$(DATE)

BINARIES := anycap anycap-server anycap-mock

.PHONY: all build install install-bin clean test lint setup-hooks tools dev dev-no-watch infra-up infra-down infra-reset sync-skills annotate-ui $(BINARIES)

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
	@echo "  sync-skills  Sync skills/ to embedded for go:embed"

build: annotate-ui draw-ui sync-skills $(BINARIES)

$(BINARIES):
	go build -ldflags '$(LDFLAGS)' -o ./$@ ./cmd/$@

install: setup-hooks tools
	@echo "done: hooks and tools installed"

install-bin:
	go install -ldflags '$(LDFLAGS)' ./cmd/anycap
	go install -ldflags '$(LDFLAGS)' ./cmd/anycap-server

test: annotate-ui sync-skills
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
	$(shell go env GOPATH)/bin/air

dev-no-watch:
	go run -ldflags '$(LDFLAGS)' ./cmd/anycap-server

clean:
	rm -f $(BINARIES)

# ---------- Annotate UI ----------

ANNOTATE_WEB := internal/cli/annotate/web
ANNOTATE_PAGE := internal/cli/annotate/page.html

annotate-ui:
	cd $(ANNOTATE_WEB) && npm install && npm run build
	cp $(ANNOTATE_WEB)/dist/index.html $(ANNOTATE_PAGE)
	@echo "annotate UI built -> $(ANNOTATE_PAGE)"

# ---------- Draw UI ----------

DRAW_WEB := internal/cli/draw/web
DRAW_PAGE := internal/cli/draw/page.html

draw-ui:
	cd $(DRAW_WEB) && npm install && npm run build
	cp $(DRAW_WEB)/dist/index.html $(DRAW_PAGE)
	@echo "draw UI built -> $(DRAW_PAGE)"

# ---------- Skills Embedding ----------

EMBEDDED_SKILLS := internal/cli/skill/embedded/anycap-cli

sync-skills:
	@rm -rf $(EMBEDDED_SKILLS)
	@mkdir -p $(EMBEDDED_SKILLS)/references
	@cp skills/anycap-cli/SKILL.md $(EMBEDDED_SKILLS)/
	@cp skills/anycap-cli/references/*.md $(EMBEDDED_SKILLS)/references/
	@echo "skills synced to $(EMBEDDED_SKILLS)"

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
