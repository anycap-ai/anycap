# metrics

Prometheus-compatible metrics using VictoriaMetrics.

```go
import "gitlab.knoffice.tech/open/common-go/metrics"
```

## Initialization

```go
// Required: Initialize before using any metrics
metrics.Init("app-name", "instance-id", "prod",
	metrics.WithLabels(map[string]string{"region": "us-west"}),
	metrics.WithBizID("biz-123"),
)
```

## Counter

```go
// Create and use
counter := metrics.NewCounter("requests_total", "Total requests")
counter.Inc(map[string]string{"method": "GET", "path": "/api"})
counter.Add(map[string]string{"method": "POST"}, 5)

// Convenience functions
metrics.IncCounter("requests_total", map[string]string{"status": "200"})
metrics.AddCounter("requests_total", map[string]string{"status": "500"}, 3)
```

## Gauge

```go
// Create and use
gauge := metrics.NewGauge("connections_active", "Active connections")
gauge.Set(map[string]string{"pool": "main"}, 42.0)
gauge.Inc(map[string]string{"pool": "main"})
gauge.Dec(map[string]string{"pool": "main"})

// Convenience function
metrics.SetGauge("memory_usage", map[string]string{"type": "heap"}, 1024.5)
```

## Histogram

```go
// Create and use
histogram := metrics.NewHistogram("request_duration_seconds", "Request latency")
histogram.Observe(map[string]string{"endpoint": "/api"}, 0.125)

// With custom buckets
histogram.WithBuckets([]float64{0.01, 0.05, 0.1, 0.5, 1.0})

// Convenience function
metrics.ObserveHistogram("response_size_bytes", map[string]string{"type": "json"}, 2048.0)
```

## Push Gateway

```go
ctx := context.Background()

// Continuous push (interval >= 15s)
err := metrics.RunPushMetrics(ctx, "https://pushgateway.example.com", 30*time.Second, "user", "pass")

// One-time push
err := metrics.PushMetricsOnce(ctx, "https://pushgateway.example.com", "user", "pass")
```

## Accessors

```go
metrics.IsInit()       // bool
metrics.AppLabel()     // string
metrics.InstanceLabel()// string
metrics.EnvLabel()     // string
metrics.BizIDLabel()   // string
metrics.Labels()       // map[string]string
```
