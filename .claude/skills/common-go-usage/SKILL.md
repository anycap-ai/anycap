---
name: common-go-usage
description: Reference documentation for the common-go SDK - a collection of shared Go utilities for observability, analytics, frameworks, and common helpers.
---

# common-go SDK

Shared Go utilities for building microservices with observability, analytics, and framework integrations.

## Package Index

| Category | Package | Import | Description |
|----------|---------|--------|-------------|
| **Observability** | [metrics](references/observability/metrics.md) | `gitlab.knoffice.tech/open/common-go/metrics` | Prometheus metrics (Counter, Gauge, Histogram) |
| | [logging](references/observability/logging.md) | `gitlab.knoffice.tech/open/common-go/logging` | Structured logging with context |
| | [trace](references/observability/trace.md) | `gitlab.knoffice.tech/open/common-go/trace` | Distributed tracing |
| **Analytics** | [ga4](references/analytics/ga4.md) | `gitlab.knoffice.tech/open/common-go/ga4` | Google Analytics 4 tracking |
| | [mixpanel](references/analytics/mixpanel.md) | `gitlab.knoffice.tech/open/common-go/mixpanel` | Mixpanel event tracking |
| **Frameworks** | [hertz](references/frameworks/hertz.md) | `gitlab.knoffice.tech/open/common-go/hertz/middleware` | Hertz HTTP middleware |
| | [kitex](references/frameworks/kitex.md) | `gitlab.knoffice.tech/open/common-go/kitex/middleware` | Kitex RPC middleware |
| **Utilities** | [dconf](references/utilities/dconf.md) | `gitlab.knoffice.tech/open/common-go/dconf` | Dynamic configuration (Nacos) |
| | [env](references/utilities/env.md) | `gitlab.knoffice.tech/open/common-go/env` | Environment helpers |
| | [utils](references/utilities/utils.md) | `gitlab.knoffice.tech/open/common-go/utils` | Common utility functions |
| | [bizhelper](references/utilities/bizhelper.md) | `gitlab.knoffice.tech/open/common-go/bizhelper` | Business context management |
| | [panics](references/utilities/panics.md) | `gitlab.knoffice.tech/open/common-go/panics` | Panic recovery |
| | [resty](references/utilities/resty.md) | `gitlab.knoffice.tech/open/common-go/resty` | HTTP client with tracing |
| | [lark](references/utilities/lark.md) | `gitlab.knoffice.tech/open/common-go/lark/bot` | Lark/Feishu messaging |
| | [consts](references/utilities/consts.md) | `gitlab.knoffice.tech/open/common-go/consts` | Shared constants |

## Typical Initialization

```go
package main

import (
	"context"
	"time"

	"gitlab.knoffice.tech/open/common-go/dconf"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/metrics"
	"gitlab.knoffice.tech/open/common-go/trace"
)

func main() {
	// 1. Initialize logging
	logging.Init(&logging.Config{
		Level:  "info",
		Format: "json",
		Output: "stdout",
	})

	// 2. Initialize metrics
	metrics.Init("my-service", "instance-1", "prod")

	// 3. Initialize tracing (wraps http.DefaultTransport)
	trace.Setup()

	// 4. Initialize dynamic config (optional)
	if err := dconf.Init(); err != nil {
		logging.GetLogger().Fatalf("dconf init failed: %v", err)
	}
	defer dconf.Stop()

	// 5. Start metrics push (optional)
	ctx := context.Background()
	metrics.RunPushMetrics(ctx, "https://pushgateway.example.com", 30*time.Second, "user", "pass")

	// ... start your server
}
```
