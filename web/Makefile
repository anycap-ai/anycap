# Cloudflare Pages deployment helpers
# Usage:
#   make cf-up-env              # Upload secrets from .env.preview to preview (default)
#   make cf-up-env ENV=preview  # Upload secrets from .env.preview to preview
#   make cf-up-env ENV=production     # Upload secrets from .env.production to production
#   make cf-deploy              # Build and deploy to preview (default)
#   make cf-deploy ENV=production     # Build and deploy to production

ENV ?= preview
ENV_FILE := .env.$(ENV)
BRANCH := $(if $(filter production,$(ENV)),main,preview)

.PHONY: cf-up-env cf-deploy

cf-up-env:
	@if [ "$(ENV)" != "preview" ] && [ "$(ENV)" != "production" ]; then \
		echo "Error: ENV must be 'preview' or 'production', got '$(ENV)'"; \
		exit 1; \
	fi
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Error: $(ENV_FILE) file not found"; \
		exit 1; \
	fi
	@if [ "$(ENV)" = "production" ]; then \
		echo "⚠️  You are about to upload secrets to PRODUCTION environment."; \
		printf "Type 'production' to confirm: "; \
		read confirm; \
		if [ "$$confirm" != "production" ]; then \
			echo "Aborted."; \
			exit 1; \
		fi; \
	fi
	@echo "Uploading secrets from $(ENV_FILE) to $(ENV) environment..."
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
	' $(ENV_FILE) | pnpm exec wrangler pages secret bulk --env $(ENV)
	@echo "Done!"

cf-deploy:
	@if [ "$(ENV)" != "preview" ] && [ "$(ENV)" != "production" ]; then \
		echo "Error: ENV must be 'preview' or 'production', got '$(ENV)'"; \
		exit 1; \
	fi
	@if [ "$(ENV)" = "production" ]; then \
		echo "⚠️  You are about to deploy to PRODUCTION environment."; \
		printf "Type 'production' to confirm: "; \
		read confirm; \
		if [ "$$confirm" != "production" ]; then \
			echo "Aborted."; \
			exit 1; \
		fi; \
	fi
	@echo "Building and deploying to $(ENV) (branch: $(BRANCH))..."
	pnpm build
	npx @cloudflare/next-on-pages
	pnpm exec wrangler pages deploy .vercel/output/static --branch $(BRANCH)
	@echo "Deployed to $(ENV)!"
