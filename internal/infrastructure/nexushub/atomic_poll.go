package nexushub

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"gitlab.knoffice.tech/open/common-go/logging"
)

const (
	// defaultResultPollInterval is the delay between get_submit_result polls.
	defaultResultPollInterval = 2 * time.Second
	// defaultResultPollMaxAttempts caps how many times we poll before giving up.
	defaultResultPollMaxAttempts = 30
)

// resultPoller fetches an atomic task result via get_submit_result, retrying
// while the payload is still empty. It is a generic fallback for abilities that
// complete synchronously but return the payload out-of-band (the submit
// response carries an empty resp_payload and only a task_id).
//
// It is provider-agnostic within NexusHub: any caller holding the shared HTTP
// client, base URL, and token can reuse it.
type resultPoller struct {
	httpClient  *http.Client
	baseURL     string
	token       string
	interval    time.Duration
	maxAttempts int
}

// newResultPoller builds a poller with sane defaults. interval<=0 and
// maxAttempts<=0 fall back to package defaults.
func newResultPoller(httpClient *http.Client, baseURL, token string, interval time.Duration, maxAttempts int) resultPoller {
	if interval <= 0 {
		interval = defaultResultPollInterval
	}
	if maxAttempts <= 0 {
		maxAttempts = defaultResultPollMaxAttempts
	}
	return resultPoller{
		httpClient:  httpClient,
		baseURL:     baseURL,
		token:       token,
		interval:    interval,
		maxAttempts: maxAttempts,
	}
}

// resolve returns the submit response as-is when it already carries a
// resp_payload (or has no task to poll). Otherwise it polls get_submit_result
// until the payload is populated or the task reaches a terminal failure.
//
// capability and abilityKey are used only for structured logging.
func (p resultPoller) resolve(ctx context.Context, capability, abilityKey string, submitted submitAtomicProcessResponse) (submitAtomicProcessResponse, error) {
	if strings.TrimSpace(submitted.RespPayload) != "" || submitted.TaskID == "" {
		return submitted, nil
	}
	return p.poll(ctx, capability, abilityKey, submitted.TaskID)
}

func (p resultPoller) poll(ctx context.Context, capability, abilityKey, taskID string) (submitAtomicProcessResponse, error) {
	for attempt := 0; attempt < p.maxAttempts; attempt++ {
		httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, p.baseURL+getSubmitResultPath+taskID, nil)
		if err != nil {
			logNexusHubCapabilityError(ctx, capability, "", abilityKey, "build_result_request", err, "build nexushub result request failed")
			return submitAtomicProcessResponse{}, fmt.Errorf("build result request: %w", err)
		}
		httpReq.Header.Set("X-Token", p.token)

		resp, err := p.httpClient.Do(httpReq)
		if err != nil {
			logNexusHubCapabilityError(ctx, capability, "", abilityKey, "result_http_request", err, "get nexushub result failed")
			return submitAtomicProcessResponse{}, fmt.Errorf("get submit result: %w", err)
		}

		var parsed submitAtomicProcessResponse
		decodeErr := json.NewDecoder(resp.Body).Decode(&parsed)
		statusCode := resp.StatusCode
		resp.Body.Close()
		if decodeErr != nil {
			logNexusHubCapabilityError(ctx, capability, "", abilityKey, "decode_result_response", decodeErr, "decode nexushub result response failed")
			return submitAtomicProcessResponse{}, fmt.Errorf("decode result response: %w", decodeErr)
		}

		if statusCode != http.StatusOK || parsed.Base.Code != 0 {
			mapped := mapSubmitError(statusCode, parsed.Base.Code, parsed.Base.Message)
			logNexusHubCapabilityError(ctx, capability, "", abilityKey, "result_status", mapped, "nexushub result returned error", logging.Fields{
				"status_code": statusCode,
				"base_code":   parsed.Base.Code,
			})
			return submitAtomicProcessResponse{}, mapped
		}

		status := normalizeNexusHubTaskStatus(parsed.Status)
		if status == "failed" || status == "canceled" {
			mapped := mapSubmitError(statusCode, parsed.ErrCode, firstNonEmpty(parsed.ErrMsg, parsed.Base.Message))
			return submitAtomicProcessResponse{}, mapped
		}

		if strings.TrimSpace(parsed.RespPayload) != "" {
			return parsed, nil
		}

		select {
		case <-ctx.Done():
			return submitAtomicProcessResponse{}, ctx.Err()
		case <-time.After(p.interval):
		}
	}
	return submitAtomicProcessResponse{}, fmt.Errorf("nexushub result not ready after polling task %s", taskID)
}
