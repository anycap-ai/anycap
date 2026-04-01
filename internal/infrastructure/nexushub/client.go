package nexushub

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
)

const (
	defaultExecuteTimeout    = 30 * time.Minute
	defaultNexusHubBizID     = "anycap"
	defaultNexusHubEnterFrom = "anycap_api"
	submitAtomicProcessPath  = "/v1/submit_atomic_process"
	getSubmitResultPath      = "/v1/get_submit_result/"
)

type ClientConfig struct {
	BaseURL        string
	Token          string
	RequestTimeout time.Duration
}

type Client struct {
	baseURL    string
	token      string
	httpClient *http.Client
}

func NewClient(cfg ClientConfig) *Client {
	timeout := cfg.RequestTimeout
	if timeout == 0 {
		timeout = defaultExecuteTimeout
	}

	return &Client{
		baseURL: strings.TrimRight(cfg.BaseURL, "/"),
		token:   cfg.Token,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *Client) GenerateImage(ctx context.Context, req model.GenerateImageRequest, route model.RouteBinding) (model.GenerateImageResult, error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		return model.GenerateImageResult{}, model.ErrImageExecutionNotConfigured
	}
	if route.AbilityKey == "" {
		return model.GenerateImageResult{}, fmt.Errorf("%w: missing ability_key", model.ErrModelRouteNotConfigured)
	}

	uid, err := parseNexusHubUID(req.UserID)
	if err != nil {
		return model.GenerateImageResult{}, err
	}

	payload := atomicProcessPayload{
		GenType: route.GenType,
		Prompt:  req.Prompt,
		ImageOption: &atomicImageOption{
			Type:           route.AlgoType,
			Ratio:          req.Ratio,
			Resolution:     req.Resolution,
			NegativePrompt: req.NegativePrompt,
			ReferImageURLs: append([]string(nil), req.ReferenceImageURLs...),
		},
		MetaOption: map[string]any{
			"request_id": req.RequestID,
			"model_id":   req.Model,
		},
	}

	reqPayload, err := json.Marshal(payload)
	if err != nil {
		return model.GenerateImageResult{}, fmt.Errorf("marshal req_payload: %w", err)
	}

	body := submitAtomicProcessRequest{
		AbilityKey: route.AbilityKey,
		ReqPayload: string(reqPayload),
		Token:      c.token,
		BizInfo: submitBizInfo{
			BizID:     defaultNexusHubBizID,
			EnterFrom: defaultNexusHubEnterFrom,
		},
		UserInfo: submitUserInfo{
			UID: uid,
		},
		Extra: map[string]any{
			"model_id":   req.Model,
			"capability": string(model.CapabilityImage),
			"operation":  string(model.OperationGenerate),
			"request_id": req.RequestID,
		},
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return model.GenerateImageResult{}, fmt.Errorf("marshal submit request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+submitAtomicProcessPath, bytes.NewReader(bodyBytes))
	if err != nil {
		return model.GenerateImageResult{}, fmt.Errorf("build request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	if requestID := middleware.RequestIDFromContext(ctx); requestID != "" {
		httpReq.Header.Set("X-Request-Id", requestID)
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return model.GenerateImageResult{}, fmt.Errorf("submit atomic process: %w", err)
	}
	defer resp.Body.Close()

	var parsed submitAtomicProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return model.GenerateImageResult{}, fmt.Errorf("decode submit response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return model.GenerateImageResult{}, mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message)
	}

	result := model.GenerateImageResult{
		ID:     parsed.TaskID,
		Status: normalizeNexusHubStatus(parsed.Status),
		Model:  req.Model,
		Usage:  parsed.NexusUsage,
	}

	if parsed.RespPayload != "" {
		var respPayload atomicRespPayload
		if err := json.Unmarshal([]byte(parsed.RespPayload), &respPayload); err != nil {
			return model.GenerateImageResult{}, fmt.Errorf("decode resp_payload: %w", err)
		}

		outputs := make([]model.Artifact, 0, len(respPayload.Resources))
		for _, resource := range respPayload.Resources {
			resourceURL := resource.URL
			if resourceURL == "" {
				resourceURL = resource.Path
			}

			outputs = append(outputs, model.Artifact{
				Type:     "image",
				URL:      resourceURL,
				MIMEType: guessMIMEType(resourceURL),
			})
			if result.CreditCost == 0 && resource.CreditCost > 0 {
				result.CreditCost = resource.CreditCost
			}
		}
		result.Outputs = outputs
	}

	return result, nil
}

func (c *Client) GenerateVideo(ctx context.Context, req model.GenerateVideoRequest, route model.RouteBinding) (model.GenerateVideoResult, error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		return model.GenerateVideoResult{}, model.ErrVideoExecutionNotConfigured
	}
	if route.AbilityKey == "" {
		return model.GenerateVideoResult{}, fmt.Errorf("%w: missing ability_key", model.ErrModelRouteNotConfigured)
	}

	uid, err := parseNexusHubUID(req.UserID)
	if err != nil {
		return model.GenerateVideoResult{}, err
	}

	payload := atomicProcessPayload{
		GenType:     route.GenType,
		Prompt:      req.Prompt,
		ResourceURL: firstString(req.ReferenceImageURLs),
		VideoOption: &atomicVideoOption{
			Type:           route.AlgoType,
			Ratio:          req.Ratio,
			Resolution:     req.Resolution,
			Duration:       req.Duration,
			NegativePrompt: req.NegativePrompt,
		},
		MetaOption: map[string]any{
			"request_id": req.RequestID,
			"model_id":   req.Model,
		},
	}

	reqPayload, err := json.Marshal(payload)
	if err != nil {
		return model.GenerateVideoResult{}, fmt.Errorf("marshal req_payload: %w", err)
	}

	body := submitAtomicProcessRequest{
		AbilityKey: route.AbilityKey,
		ReqPayload: string(reqPayload),
		Token:      c.token,
		BizInfo: submitBizInfo{
			BizID:     defaultNexusHubBizID,
			EnterFrom: defaultNexusHubEnterFrom,
		},
		UserInfo: submitUserInfo{
			UID: uid,
		},
		Extra: map[string]any{
			"model_id":   req.Model,
			"capability": string(model.CapabilityVideo),
			"operation":  string(model.OperationGenerate),
			"request_id": req.RequestID,
		},
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return model.GenerateVideoResult{}, fmt.Errorf("marshal submit request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+submitAtomicProcessPath, bytes.NewReader(bodyBytes))
	if err != nil {
		return model.GenerateVideoResult{}, fmt.Errorf("build request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	if requestID := middleware.RequestIDFromContext(ctx); requestID != "" {
		httpReq.Header.Set("X-Request-Id", requestID)
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return model.GenerateVideoResult{}, fmt.Errorf("submit atomic process: %w", err)
	}
	defer resp.Body.Close()

	var parsed submitAtomicProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return model.GenerateVideoResult{}, fmt.Errorf("decode submit response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return model.GenerateVideoResult{}, mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message)
	}

	result := model.GenerateVideoResult{
		ID:     parsed.TaskID,
		Status: normalizeNexusHubStatus(parsed.Status),
		Model:  req.Model,
		Usage:  parsed.NexusUsage,
	}

	if parsed.RespPayload != "" {
		var respPayload atomicRespPayload
		if err := json.Unmarshal([]byte(parsed.RespPayload), &respPayload); err != nil {
			return model.GenerateVideoResult{}, fmt.Errorf("decode resp_payload: %w", err)
		}

		outputs := make([]model.Artifact, 0, len(respPayload.Resources))
		for _, resource := range respPayload.Resources {
			resourceURL := resource.URL
			if resourceURL == "" {
				resourceURL = resource.Path
			}

			outputs = append(outputs, model.Artifact{
				Type:     "video",
				URL:      resourceURL,
				MIMEType: guessMIMEType(resourceURL),
			})
			if result.CreditCost == 0 && resource.CreditCost > 0 {
				result.CreditCost = resource.CreditCost
			}
		}
		result.Outputs = outputs
	}

	return result, nil
}

func (c *Client) GenerateMusic(ctx context.Context, req model.GenerateMusicRequest, route model.RouteBinding) (model.GenerateMusicResult, error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		return model.GenerateMusicResult{}, model.ErrMusicExecutionNotConfigured
	}
	if route.AbilityKey == "" {
		return model.GenerateMusicResult{}, fmt.Errorf("%w: missing ability_key", model.ErrModelRouteNotConfigured)
	}

	uid, err := parseNexusHubUID(req.UserID)
	if err != nil {
		return model.GenerateMusicResult{}, err
	}

	payload := atomicProcessPayload{
		GenType: route.GenType,
		Prompt:  req.Prompt,
		MusicOption: &atomicMusicOption{
			MakeInstrumental: req.MakeInstrumental,
			CustomMode:       req.CustomMode,
			Tags:             req.Tags,
			Title:            req.Title,
			Lyrics:           req.Lyrics,
			ContinueAt:       req.ContinueAt,
			ContinueClipID:   req.ContinueClipID,
			VocalGender:      req.VocalGender,
		},
		MetaOption: map[string]any{
			"request_id": req.RequestID,
			"model_id":   req.Model,
		},
	}

	reqPayload, err := json.Marshal(payload)
	if err != nil {
		return model.GenerateMusicResult{}, fmt.Errorf("marshal req_payload: %w", err)
	}

	body := submitAtomicProcessRequest{
		AbilityKey: route.AbilityKey,
		ReqPayload: string(reqPayload),
		Token:      c.token,
		BizInfo: submitBizInfo{
			BizID:     defaultNexusHubBizID,
			EnterFrom: defaultNexusHubEnterFrom,
		},
		UserInfo: submitUserInfo{
			UID: uid,
		},
		Extra: map[string]any{
			"model_id":   req.Model,
			"capability": string(model.CapabilityMusic),
			"operation":  string(model.OperationGenerate),
			"request_id": req.RequestID,
		},
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return model.GenerateMusicResult{}, fmt.Errorf("marshal submit request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+submitAtomicProcessPath, bytes.NewReader(bodyBytes))
	if err != nil {
		return model.GenerateMusicResult{}, fmt.Errorf("build request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	if requestID := middleware.RequestIDFromContext(ctx); requestID != "" {
		httpReq.Header.Set("X-Request-Id", requestID)
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return model.GenerateMusicResult{}, fmt.Errorf("submit atomic process: %w", err)
	}
	defer resp.Body.Close()

	var parsed submitAtomicProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return model.GenerateMusicResult{}, fmt.Errorf("decode submit response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return model.GenerateMusicResult{}, mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message)
	}

	result := model.GenerateMusicResult{
		ID:     parsed.TaskID,
		Status: normalizeNexusHubStatus(parsed.Status),
		Model:  req.Model,
		Usage:  parsed.NexusUsage,
	}

	if parsed.RespPayload != "" {
		var respPayload atomicRespPayload
		if err := json.Unmarshal([]byte(parsed.RespPayload), &respPayload); err != nil {
			return model.GenerateMusicResult{}, fmt.Errorf("decode resp_payload: %w", err)
		}

		outputs := make([]model.Artifact, 0, len(respPayload.Resources))
		for _, resource := range respPayload.Resources {
			resourceURL := resource.URL
			if resourceURL == "" {
				resourceURL = resource.Path
			}

			outputs = append(outputs, model.Artifact{
				Type:     "music",
				URL:      resourceURL,
				MIMEType: guessMIMEType(resourceURL),
			})
			if result.CreditCost == 0 && resource.CreditCost > 0 {
				result.CreditCost = resource.CreditCost
			}
		}
		result.Outputs = outputs
	}

	return result, nil
}

func (c *Client) GetSubmitResult(ctx context.Context, taskID string) (model.ProviderTaskResult, error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		return model.ProviderTaskResult{}, model.ErrInternal
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+getSubmitResultPath+taskID, nil)
	if err != nil {
		return model.ProviderTaskResult{}, fmt.Errorf("build request: %w", err)
	}
	httpReq.Header.Set("X-Token", c.token)
	if requestID := middleware.RequestIDFromContext(ctx); requestID != "" {
		httpReq.Header.Set("X-Request-Id", requestID)
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return model.ProviderTaskResult{}, fmt.Errorf("get submit result: %w", err)
	}
	defer resp.Body.Close()

	var parsed submitAtomicProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return model.ProviderTaskResult{}, fmt.Errorf("decode submit result response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return model.ProviderTaskResult{}, mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message)
	}

	result := model.ProviderTaskResult{
		TaskID:       parsed.TaskID,
		Status:       normalizeNexusHubTaskStatus(parsed.Status),
		Progress:     parsed.Progress,
		AbilityKey:   parsed.AbilityKey,
		Usage:        parsed.NexusUsage,
		NexusCost:    parsed.NexusCost,
		ErrorCode:    parsed.ErrCode,
		ErrorMessage: parsed.ErrMsg,
		RawResult: map[string]any{
			"task_id":      parsed.TaskID,
			"status":       parsed.Status,
			"progress":     parsed.Progress,
			"ability_key":  parsed.AbilityKey,
			"nexus_usage":  parsed.NexusUsage,
			"nexus_cost":   parsed.NexusCost,
			"err_code":     parsed.ErrCode,
			"err_msg":      parsed.ErrMsg,
			"resp_payload": parsed.RespPayload,
		},
	}

	if parsed.RespPayload != "" {
		var respPayload atomicRespPayload
		if err := json.Unmarshal([]byte(parsed.RespPayload), &respPayload); err != nil {
			return model.ProviderTaskResult{}, fmt.Errorf("decode resp_payload: %w", err)
		}
		for _, resource := range respPayload.Resources {
			if result.CreditCost == 0 && resource.CreditCost > 0 {
				result.CreditCost = resource.CreditCost
			}
		}
	}

	return result, nil
}

type submitAtomicProcessRequest struct {
	AbilityKey string         `json:"ability_key"`
	ReqPayload string         `json:"req_payload"`
	Token      string         `json:"token"`
	BizInfo    submitBizInfo  `json:"biz_info"`
	UserInfo   submitUserInfo `json:"user_info"`
	Extra      map[string]any `json:"extra,omitempty"`
}

type submitBizInfo struct {
	BizID     string `json:"biz_id,omitempty"`
	BizToken  string `json:"biz_token,omitempty"`
	EnterFrom string `json:"enter_from,omitempty"`
}

type submitUserInfo struct {
	UID int64 `json:"uid"`
}

type atomicProcessPayload struct {
	GenType     string             `json:"gen_type"`
	Prompt      string             `json:"prompt,omitempty"`
	ResourceURL string             `json:"resource_url,omitempty"`
	ImageOption *atomicImageOption `json:"image_option,omitempty"`
	VideoOption *atomicVideoOption `json:"video_option,omitempty"`
	MusicOption *atomicMusicOption `json:"music_option,omitempty"`
	MetaOption  map[string]any     `json:"meta_option,omitempty"`
}

type atomicImageOption struct {
	Type           string   `json:"type,omitempty"`
	Ratio          string   `json:"ratio,omitempty"`
	Resolution     string   `json:"resolution,omitempty"`
	NegativePrompt string   `json:"negative_prompt,omitempty"`
	ReferImageURLs []string `json:"refer_image_urls,omitempty"`
}

type atomicVideoOption struct {
	Type           string `json:"type,omitempty"`
	Ratio          string `json:"ratio,omitempty"`
	Resolution     string `json:"resolution,omitempty"`
	Duration       int    `json:"duration,omitempty"`
	NegativePrompt string `json:"negative_prompt,omitempty"`
}

type atomicMusicOption struct {
	MakeInstrumental bool   `json:"make_instrumental,omitempty"`
	CustomMode       bool   `json:"custom_mode,omitempty"`
	Tags             string `json:"tags,omitempty"`
	Title            string `json:"title,omitempty"`
	Lyrics           string `json:"lyrics,omitempty"`
	ContinueAt       int    `json:"continue_at,omitempty"`
	ContinueClipID   string `json:"continue_clip_id,omitempty"`
	VocalGender      string `json:"vocal_gender,omitempty"`
}

type submitAtomicProcessResponse struct {
	Base        submitBaseResponse `json:"base"`
	TaskID      string             `json:"task_id"`
	RespPayload string             `json:"resp_payload,omitempty"`
	Status      string             `json:"status,omitempty"`
	Progress    float64            `json:"progress,omitempty"`
	AbilityKey  string             `json:"ability_key,omitempty"`
	ErrCode     int                `json:"err_code,omitempty"`
	ErrMsg      string             `json:"err_msg,omitempty"`
	NexusCost   float64            `json:"nexus_cost,omitempty"`
	NexusUsage  map[string]any     `json:"nexus_usage,omitempty"`
}

type submitBaseResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type atomicRespPayload struct {
	Resources []atomicResource `json:"resources"`
}

type atomicResource struct {
	URL        string `json:"url,omitempty"`
	Path       string `json:"path,omitempty"`
	CreditCost int64  `json:"credit_cost,omitempty"`
}

func parseNexusHubUID(userID string) (int64, error) {
	if userID == "" {
		return 0, fmt.Errorf("%w: user_id is required", model.ErrInvalidParam)
	}

	if uid, err := strconv.ParseInt(userID, 10, 64); err == nil {
		return uid, nil
	}

	end := len(userID)
	start := end
	for start > 0 && userID[start-1] >= '0' && userID[start-1] <= '9' {
		start--
	}
	if start < end {
		uid, err := strconv.ParseInt(userID[start:end], 10, 64)
		if err == nil {
			return uid, nil
		}
	}

	return 0, fmt.Errorf("%w: nexushub requires a numeric user id, got %q", model.ErrInvalidParam, userID)
}

func normalizeNexusHubStatus(status string) string {
	return normalizeNexusHubTaskStatus(status)
}

func normalizeNexusHubTaskStatus(status string) string {
	switch strings.ToLower(status) {
	case "succeeded", "success", "completed":
		return "success"
	case "failed", "failure", "error":
		return "failed"
	case "cancelled", "canceled":
		return "canceled"
	case "running", "pending", "queued":
		return "processing"
	default:
		return strings.ToLower(status)
	}
}

func guessMIMEType(resourceURL string) string {
	if resourceURL == "" {
		return ""
	}
	return mime.TypeByExtension(filepath.Ext(resourceURL))
}

func firstString(values []string) string {
	if len(values) == 0 {
		return ""
	}
	return values[0]
}

// mapSubmitError maps NexusHub submit_atomic_process errors to domain errors.
//
// NexusHub always returns HTTP 500 for task processing failures, embedding the
// real error semantics in base.code (the responseCode). We use base.code for
// structured mapping instead of relying on HTTP status alone.
//
// Known NexusHub base.code values:
//
//	  0 = success
//	400 = invalid request (ResponseCodeInvalidRequest)
//	422 = validation failed (ResponseCodeValidationFailed)
//	429 = rate limit / provider quota exhausted (ResponseCodeRateLimit)
//	500 = internal error (ResponseCodeInternalError)
//	5003 = rate limit (TaskErrCodeRateLimit)
//	5005 = invalid request params (TaskErrCodeInvalidRequest)
func mapSubmitError(httpStatus, baseCode int, message string) error {
	message = strings.TrimSpace(message)
	if message == "" {
		message = "nexushub request failed"
	}

	// 1. Provider 429 means the upstream is temporarily unavailable due to
	// quota/rate exhaustion, not that the caller hit AnyCap's local limiter.
	if httpStatus == http.StatusTooManyRequests {
		return fmt.Errorf("%w: %s", model.ErrUpstreamUnavailable, message)
	}

	// 2. Remaining HTTP 4xx are client errors.
	if httpStatus >= http.StatusBadRequest && httpStatus < http.StatusInternalServerError {
		return fmt.Errorf("%w: %s", model.ErrInvalidParam, message)
	}

	// 3. Map by NexusHub base.code (responseCode / TaskErrCode).
	switch baseCode {
	case 400, 422, 5005: // invalid request / validation failed / TaskErrCodeInvalidRequest
		return fmt.Errorf("%w: %s", model.ErrInvalidParam, message)
	case 429, 5003: // provider-side rate limit / TaskErrCodeRateLimit
		return fmt.Errorf("%w: %s", model.ErrUpstreamUnavailable, message)
	case 5001: // TaskErrCodeReview (content moderation)
		return fmt.Errorf("%w: %s", model.ErrInvalidParam, message)
	}

	return fmt.Errorf("nexushub request failed: %s", message)
}
