DOCS_DIR := docs
DOCS_HOST ?= 127.0.0.1
DOCS_PORT ?= 4321
WORKER_PORT ?= 8787

.PHONY: help docs-install docs-dev docs-check docs-build docs-audit docs-preview docs-worker-preview docs-deploy

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

docs-install: ## Install pinned documentation dependencies
	@cd $(DOCS_DIR) && npm ci

docs-dev: ## Start the documentation dev server with hot reload
	@cd $(DOCS_DIR) && npm run dev -- --host $(DOCS_HOST) --port $(DOCS_PORT)

docs-check: ## Run Astro and content diagnostics
	@cd $(DOCS_DIR) && npm run check

docs-build: ## Build the production documentation site
	@cd $(DOCS_DIR) && npm run build

docs-audit: docs-build ## Audit metadata, structured data, links, and release artifacts
	@cd $(DOCS_DIR) && npm run audit:build

docs-preview: docs-audit ## Preview the production build locally
	@cd $(DOCS_DIR) && npm run preview -- --host $(DOCS_HOST) --port $(DOCS_PORT)

docs-worker-preview: docs-audit ## Preview the production build through Cloudflare Workers locally
	@cd $(DOCS_DIR) && npx wrangler dev --local --ip $(DOCS_HOST) --port $(WORKER_PORT)

docs-deploy: docs-check docs-audit ## Create or update the Cloudflare docs Worker
	@cd $(DOCS_DIR) && npx wrangler deploy
