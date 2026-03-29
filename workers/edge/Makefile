# Cloudflare Workers deployment helpers for anycap-edge
#
# Usage:
#   make deploy              # Deploy to dev (default)
#   make deploy ENV=prod     # Deploy to production
#   make secrets             # Upload secrets from .secrets.dev (default)
#   make secrets ENV=prod    # Upload secrets from .secrets.prod
#   make dev                 # Start local dev server

ENV ?= dev
SECRETS_FILE := .secrets.$(ENV)

.PHONY: dev deploy secrets typecheck test

dev:
	pnpm exec wrangler dev --env dev

typecheck:
	pnpm exec tsc --noEmit

test:
	pnpm exec vitest run

deploy:
	@if [ "$(ENV)" != "dev" ] && [ "$(ENV)" != "prod" ]; then \
		echo "Error: ENV must be 'dev' or 'prod', got '$(ENV)'"; \
		exit 1; \
	fi
	@if [ "$(ENV)" = "prod" ]; then \
		echo "⚠️  You are about to deploy to PRODUCTION environment."; \
		printf "Type 'prod' to confirm: "; \
		read confirm; \
		if [ "$$confirm" != "prod" ]; then \
			echo "Aborted."; \
			exit 1; \
		fi; \
	fi
	@echo "Deploying to $(ENV)..."
	pnpm exec wrangler deploy --env $(ENV)
	@echo "Deployed to $(ENV)!"

secrets:
	@if [ "$(ENV)" != "dev" ] && [ "$(ENV)" != "prod" ]; then \
		echo "Error: ENV must be 'dev' or 'prod', got '$(ENV)'"; \
		exit 1; \
	fi
	@if [ ! -f $(SECRETS_FILE) ]; then \
		echo "Error: $(SECRETS_FILE) not found"; \
		exit 1; \
	fi
	@if [ "$(ENV)" = "prod" ]; then \
		echo "⚠️  You are about to set PRODUCTION secrets."; \
		printf "Type 'prod' to confirm: "; \
		read confirm; \
		if [ "$$confirm" != "prod" ]; then \
			echo "Aborted."; \
			exit 1; \
		fi; \
	fi
	@echo "Uploading secrets from $(SECRETS_FILE) to $(ENV)..."
	@awk -F '=' ' \
		BEGIN { print "{" } \
		/^[^#]/ && NF >= 2 { \
			key = $$1; \
			value = substr($$0, index($$0, "=") + 1); \
			gsub(/^["'"'"']|["'"'"']$$/, "", value); \
			gsub(/\\/, "\\\\", value); \
			gsub(/"/, "\\\"", value); \
			if (count++) print ","; \
			printf "  \"%s\": \"%s\"", key, value \
		} \
		END { print "\n}" } \
	' $(SECRETS_FILE) | pnpm exec wrangler secret bulk --env $(ENV)
	@echo "Done!"

