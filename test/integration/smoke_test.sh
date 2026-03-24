#!/usr/bin/env bash
# Smoke test for AnyCap Server.
# Usage: ANYCAP_API_ENDPOINT=http://127.0.0.1:8080 ./smoke_test.sh
#
# Tests verify that the server responds with correctly shaped JSON envelopes.
# Upstream-dependent endpoints (image/understand, video/read) may return 502
# when the real provider is unavailable -- that is still a valid server response.
set -euo pipefail

ENDPOINT="${ANYCAP_API_ENDPOINT:-http://127.0.0.1:8080}"
CURL_TIMEOUT="${CURL_TIMEOUT:-10}"
PASS=0
FAIL=0

run_test() {
  local name="$1"
  shift

  printf "  %-50s " "$name"
  if output=$("$@" 2>&1); then
    echo "PASS"
    PASS=$((PASS + 1))
  else
    echo "FAIL"
    echo "    $output" | head -5
    FAIL=$((FAIL + 1))
  fi
}

echo "AnyCap Server Smoke Tests"
echo "Endpoint: $ENDPOINT"
echo "----------------------------------------"

# ---------- Health & System ----------

echo ""
echo "[System]"

run_test "GET /ping" bash -c '
  curl -fsSL --max-time '"$CURL_TIMEOUT"' '"$ENDPOINT"'/ping | grep -q "\"status\":\"success\""
'

run_test "GET /healthz" bash -c '
  curl -fsSL --max-time '"$CURL_TIMEOUT"' '"$ENDPOINT"'/healthz | grep -q "\"status\":\"success\""
'

run_test "GET /v1/healthz" bash -c '
  curl -fsSL --max-time '"$CURL_TIMEOUT"' '"$ENDPOINT"'/v1/healthz | grep -q "\"status\":\"success\""
'

run_test "GET /v1/status" bash -c '
  curl -fsSL --max-time '"$CURL_TIMEOUT"' '"$ENDPOINT"'/v1/status | grep -q "\"status\":\"success\""
'

# ---------- Image ----------

echo ""
echo "[Image]"

run_test "GET /v1/image/models" bash -c '
  curl -fsSL --max-time '"$CURL_TIMEOUT"' '"$ENDPOINT"'/v1/image/models | grep -q "\"status\":\"success\""
'

# ---------- Capabilities: Presign ----------

echo ""
echo "[Capabilities - Presign]"

run_test "POST presign (success)" bash -c '
  body=$(curl -fsSL --max-time '"$CURL_TIMEOUT"' -X POST '"$ENDPOINT"'/v1/capabilities/presign \
    -H "Content-Type: application/json" \
    -d "{\"filename\":\"test.png\",\"content_type\":\"image/png\"}")
  echo "$body" | grep -q "\"upload_url\"" && echo "$body" | grep -q "\"object_url\""
'

run_test "POST presign (no object_key leaked)" bash -c '
  body=$(curl -fsSL --max-time '"$CURL_TIMEOUT"' -X POST '"$ENDPOINT"'/v1/capabilities/presign \
    -H "Content-Type: application/json" \
    -d "{\"filename\":\"test.png\",\"content_type\":\"image/png\"}")
  ! echo "$body" | grep -q "\"object_key\""
'

run_test "POST presign (missing filename -> 400)" bash -c '
  code=$(curl -sS --max-time '"$CURL_TIMEOUT"' -o /dev/null -w "%{http_code}" -X POST '"$ENDPOINT"'/v1/capabilities/presign \
    -H "Content-Type: application/json" \
    -d "{\"content_type\":\"image/png\"}")
  [ "$code" = "400" ]
'

run_test "POST presign (bad content_type -> 400)" bash -c '
  code=$(curl -sS --max-time '"$CURL_TIMEOUT"' -o /dev/null -w "%{http_code}" -X POST '"$ENDPOINT"'/v1/capabilities/presign \
    -H "Content-Type: application/json" \
    -d "{\"filename\":\"t.txt\",\"content_type\":\"text/plain\"}")
  [ "$code" = "400" ]
'

# ---------- Capabilities: Image Understand ----------

echo ""
echo "[Capabilities - Image Understand]"

# Success test: accepts 200 (stub/real) or 502 (upstream unavailable).
# Either way, the response must be a valid JSON envelope.
run_test "POST image/understand (url, envelope ok)" bash -c '
  body=$(curl -sS --max-time '"$CURL_TIMEOUT"' -X POST '"$ENDPOINT"'/v1/capabilities/image/understand \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"https://example.com/photo.jpg\",\"instruction\":\"Describe this\"}")
  echo "$body" | grep -q "\"status\""
'

run_test "POST image/understand (missing input -> 422)" bash -c '
  code=$(curl -sS --max-time '"$CURL_TIMEOUT"' -o /dev/null -w "%{http_code}" -X POST '"$ENDPOINT"'/v1/capabilities/image/understand \
    -H "Content-Type: application/json" \
    -d "{}")
  [ "$code" = "422" ]
'

run_test "POST image/understand (ambiguous -> 422)" bash -c '
  code=$(curl -sS --max-time '"$CURL_TIMEOUT"' -o /dev/null -w "%{http_code}" -X POST '"$ENDPOINT"'/v1/capabilities/image/understand \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"https://example.com/i.jpg\",\"data\":\"abc\",\"mime_type\":\"image/png\"}")
  [ "$code" = "422" ]
'

# ---------- Capabilities: Video Read ----------

echo ""
echo "[Capabilities - Video Read]"

run_test "POST video/read (url, envelope ok)" bash -c '
  body=$(curl -sS --max-time '"$CURL_TIMEOUT"' -X POST '"$ENDPOINT"'/v1/capabilities/video/read \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"https://example.com/video.mp4\",\"instruction\":\"What happens?\"}")
  echo "$body" | grep -q "\"status\""
'

run_test "POST video/read (missing url -> 422)" bash -c '
  code=$(curl -sS --max-time '"$CURL_TIMEOUT"' -o /dev/null -w "%{http_code}" -X POST '"$ENDPOINT"'/v1/capabilities/video/read \
    -H "Content-Type: application/json" \
    -d "{}")
  [ "$code" = "422" ]
'

# ---------- Summary ----------

echo ""
echo "----------------------------------------"
TOTAL=$((PASS + FAIL))
echo "Results: $PASS/$TOTAL passed"

if [ "$FAIL" -gt 0 ]; then
  echo "FAILED ($FAIL failures)"
  exit 1
fi

echo "ALL PASSED"
