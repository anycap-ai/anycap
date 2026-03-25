# Local Debug and Testing Guide

> Date: 2026-03-25

## Current Approach

We use a local server with a manually injected API key in the database for end-to-end testing. This lets us test the full CLI -> Server -> NexusHub flow locally before auth and credit services are integrated.

### Prerequisites

```bash
# Start local infrastructure (Postgres + Redis)
make infra-up

# Start the server
make dev
```

### Injecting a Test API Key

Since the auth flow is not yet fully wired, we inject an API key directly into Postgres for local testing.

```bash
# Connect to local Postgres
psql -h 127.0.0.1 -p 15432 -U anycap -d anycap
```

```sql
-- user_id must be numeric (bigint). Use a value like 2000000001.
-- key_prefix is the first 12 characters of the raw API key.
-- Generate the SHA-256 hash of the API key using Go (not shell tools).
-- For key "ak_deadbeef1234567890abcdef":
INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, status, created_at)
VALUES (
  'key_test_001',
  2000000001,
  'dev-test-key',
  'ak_deadbeef1',
  'c34fb5c53dcaddf5b0a3bfe6e83bdd5aa60996667da551b7f09b5baa76a7b5dd',
  'active',
  NOW()
);
```

To compute the hash correctly in Go (useful if you need a different key):

```go
package main

import (
    "crypto/sha256"
    "fmt"
)

func main() {
    h := sha256.Sum256([]byte("ak_deadbeef1234567890abcdef"))
    fmt.Printf("%x\n", h)
}
```

### CLI Testing Commands

```bash
# Public endpoints (no auth needed)
go run ./cmd/anycap --endpoint http://127.0.0.1:8080 image models
go run ./cmd/anycap --endpoint http://127.0.0.1:8080 image models nano-banana-2
go run ./cmd/anycap --endpoint http://127.0.0.1:8080 image models nano-banana-2 schema

# Authenticated endpoints (needs API key)
ANYCAP_API_KEY=ak_deadbeef1234567890abcdef \
  go run ./cmd/anycap --endpoint http://127.0.0.1:8080 image generate \
    --prompt "a paper crane on a wooden table" \
    --model nano-banana-2

# With extra params
ANYCAP_API_KEY=ak_deadbeef1234567890abcdef \
  go run ./cmd/anycap --endpoint http://127.0.0.1:8080 image generate \
    --prompt "a landscape" \
    --model nano-banana-2 \
    --param aspect_ratio=16:9 \
    --param resolution=2k
```

### Unit Tests

Unit tests use a mock server (`internal/cli/testutil/mockserver/`) that simulates server responses without any real infrastructure:

```bash
go test ./internal/cli/...
```

### What This Does NOT Cover

- **Auth flow**: Login/OAuth is not tested this way. We inject the API key directly.
- **Credit deduction**: The server stub does not deduct credits.
- **Real image generation**: The NexusHub executor is stubbed; generate returns a fake image URL.

Once auth and credit services are integrated, we can do full end-to-end testing with real user accounts and credit deduction.
