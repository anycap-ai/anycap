package nexushub

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"mime"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"
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

func invocationFailure[T any](code string, err error, meta model.InvocationMeta) (model.InvocationResult[T], error) {
	return model.InvocationResult[T]{}, model.WrapInvocationError(code, err, meta)
}

func invocationSuccess[T any](value T, meta model.InvocationMeta) (model.InvocationResult[T], error) {
	return model.InvocationResult[T]{Value: value, Meta: meta}, nil
}

func (c *Client) GenerateImage(ctx context.Context, req model.GenerateImageRequest, route model.RouteBinding) (model.InvocationResult[model.GenerateImageResult], error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "configuration", nil, "nexushub image client not configured")
		return invocationFailure[model.GenerateImageResult]("", model.ErrImageExecutionNotConfigured, model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}
	if route.AbilityKey == "" {
		logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "route_validation", nil, "nexushub image route missing ability key")
		return invocationFailure[model.GenerateImageResult]("", fmt.Errorf("%w: missing ability_key", model.ErrModelRouteNotConfigured), model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}

	uid, err := parseNexusHubUID(req.UserID)
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "user_id_parse", err, "invalid nexushub user id")
		return invocationFailure[model.GenerateImageResult]("", err, model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}

	payload := atomicProcessPayload{
		GenType: route.GenType,
		Prompt:  req.Prompt,
		ImageOption: &atomicImageOption{
			Type:           route.AlgoType,
			Ratio:          req.Ratio,
			Resolution:     req.Resolution,
			Format:         req.Format,
			NegativePrompt: req.NegativePrompt,
			MoveForward:    req.MoveForward,
			RotateDegrees:  req.RotateDegrees,
			UseWideAngle:   req.UseWideAngle,
			VerticalTilt:   req.VerticalTilt,
		},
		MetaOption: map[string]any{
			"request_id": req.RequestID,
			"model_id":   req.Model,
		},
	}
	applyImageResourceTargets(ctx, &payload, route.AbilityKey, route.ResourceTargets, req.ReferenceImageURLs)

	reqPayload, err := json.Marshal(payload)
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "marshal_req_payload", err, "marshal nexushub image req_payload failed")
		return invocationFailure[model.GenerateImageResult]("", fmt.Errorf("marshal req_payload: %w", err), model.InvocationMeta{Stage: model.InvocationStagePrepare})
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
		logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "marshal_submit_request", err, "marshal nexushub image submit request failed")
		return invocationFailure[model.GenerateImageResult]("", fmt.Errorf("marshal submit request: %w", err), model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+submitAtomicProcessPath, bytes.NewReader(bodyBytes))
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "build_request", err, "build nexushub image request failed")
		return invocationFailure[model.GenerateImageResult]("", fmt.Errorf("build request: %w", err), model.InvocationMeta{Stage: model.InvocationStageSubmit})
	}
	httpReq.Header.Set("Content-Type", "application/json")
	setNexusExtraHeader(ctx, httpReq)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "http_request", err, "submit nexushub image request failed")
		code := ""
		if errors.Is(err, context.DeadlineExceeded) {
			code = model.InvocationErrorCodeUpstreamTimeout
		}
		return invocationFailure[model.GenerateImageResult](code, fmt.Errorf("submit atomic process: %w", err), model.InvocationMeta{Stage: model.InvocationStageSubmit})
	}
	defer resp.Body.Close()

	var parsed submitAtomicProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "decode_submit_response", err, "decode nexushub image submit response failed")
		return invocationFailure[model.GenerateImageResult]("", fmt.Errorf("decode submit response: %w", err), model.InvocationMeta{Stage: model.InvocationStageSubmit})
	}

	if resp.StatusCode != http.StatusOK {
		logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "submit_status", mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message), "nexushub image submit returned non-200", logging.Fields{
			"status_code": resp.StatusCode,
			"base_code":   parsed.Base.Code,
		})
		return invocationFailure[model.GenerateImageResult]("", mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message), model.InvocationMeta{
			TaskID:         parsed.TaskID,
			ProviderStatus: normalizeNexusHubStatus(parsed.Status),
			Stage:          model.InvocationStageSubmit,
		})
	}

	meta := model.InvocationMeta{
		TaskID:         parsed.TaskID,
		ProviderStatus: normalizeNexusHubStatus(parsed.Status),
		Stage:          model.InvocationStageDecodeResult,
	}

	result := model.GenerateImageResult{
		ID:     parsed.TaskID,
		Status: normalizeNexusHubStatus(parsed.Status),
		Model:  req.Model,
		Usage:  parsed.NexusUsage,
	}
	if parsed.NexusCost > 0 {
		result.CreditCost = model.CreditsFromUSD(parsed.NexusCost)
	}

	if parsed.RespPayload != "" {
		var respPayload atomicRespPayload
		if err := json.Unmarshal([]byte(parsed.RespPayload), &respPayload); err != nil {
			logNexusHubCapabilityError(ctx, string(model.CapabilityImage), req.Model, route.AbilityKey, "decode_resp_payload", err, "decode nexushub image response payload failed")
			return invocationFailure[model.GenerateImageResult]("", fmt.Errorf("decode resp_payload: %w", err), meta)
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

	return invocationSuccess(result, meta)
}

func (c *Client) GenerateVideo(ctx context.Context, req model.GenerateVideoRequest, route model.RouteBinding) (model.InvocationResult[model.GenerateVideoResult], error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "configuration", nil, "nexushub video client not configured")
		return invocationFailure[model.GenerateVideoResult]("", model.ErrVideoExecutionNotConfigured, model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}
	if route.AbilityKey == "" {
		logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "route_validation", nil, "nexushub video route missing ability key")
		return invocationFailure[model.GenerateVideoResult]("", fmt.Errorf("%w: missing ability_key", model.ErrModelRouteNotConfigured), model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}

	uid, err := parseNexusHubUID(req.UserID)
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "user_id_parse", err, "invalid nexushub user id")
		return invocationFailure[model.GenerateVideoResult]("", err, model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}

	payload := atomicProcessPayload{
		GenType: route.GenType,
		Prompt:  req.Prompt,
		VideoOption: &atomicVideoOption{
			Type:           route.AlgoType,
			Ratio:          req.Ratio,
			Resolution:     req.Resolution,
			Duration:       req.Duration,
			Format:         req.Format,
			FPS:            req.FPS,
			GenerateAudio:  req.GenerateAudio,
			NegativePrompt: req.NegativePrompt,
			MultiShotClips: buildAtomicVideoShotClips(req.MultiShotClips),
		},
		MetaOption: map[string]any{
			"request_id": req.RequestID,
			"model_id":   req.Model,
		},
	}
	applyImageResourceTargets(ctx, &payload, route.AbilityKey, route.ResourceTargets, req.ReferenceImageURLs)
	if req.FirstFrameURL != "" {
		applyFirstFrameResourceTargets(ctx, &payload, route.AbilityKey, route.ResourceTargets, req.FirstFrameURL)
	}
	if req.LastFrameURL != "" {
		applyLastFrameResourceTargets(ctx, &payload, route.AbilityKey, route.ResourceTargets, req.LastFrameURL)
	}
	applyVideoResourceTargets(ctx, &payload, route.AbilityKey, route.ResourceTargets, req.ReferenceVideoURLs)
	applyAudioResourceTargets(ctx, &payload, route.AbilityKey, route.ResourceTargets, req.ReferenceAudioURLs)

	reqPayload, err := json.Marshal(payload)
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "marshal_req_payload", err, "marshal nexushub video req_payload failed")
		return invocationFailure[model.GenerateVideoResult]("", fmt.Errorf("marshal req_payload: %w", err), model.InvocationMeta{Stage: model.InvocationStagePrepare})
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
		logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "marshal_submit_request", err, "marshal nexushub video submit request failed")
		return invocationFailure[model.GenerateVideoResult]("", fmt.Errorf("marshal submit request: %w", err), model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+submitAtomicProcessPath, bytes.NewReader(bodyBytes))
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "build_request", err, "build nexushub video request failed")
		return invocationFailure[model.GenerateVideoResult]("", fmt.Errorf("build request: %w", err), model.InvocationMeta{Stage: model.InvocationStageSubmit})
	}
	httpReq.Header.Set("Content-Type", "application/json")
	setNexusExtraHeader(ctx, httpReq)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "http_request", err, "submit nexushub video request failed")
		code := ""
		if errors.Is(err, context.DeadlineExceeded) {
			code = model.InvocationErrorCodeUpstreamTimeout
		}
		return invocationFailure[model.GenerateVideoResult](code, fmt.Errorf("submit atomic process: %w", err), model.InvocationMeta{Stage: model.InvocationStageSubmit})
	}
	defer resp.Body.Close()

	var parsed submitAtomicProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "decode_submit_response", err, "decode nexushub video submit response failed")
		return invocationFailure[model.GenerateVideoResult]("", fmt.Errorf("decode submit response: %w", err), model.InvocationMeta{Stage: model.InvocationStageSubmit})
	}

	if resp.StatusCode != http.StatusOK {
		logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "submit_status", mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message), "nexushub video submit returned non-200", logging.Fields{
			"status_code": resp.StatusCode,
			"base_code":   parsed.Base.Code,
		})
		return invocationFailure[model.GenerateVideoResult]("", mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message), model.InvocationMeta{
			TaskID:         parsed.TaskID,
			ProviderStatus: normalizeNexusHubStatus(parsed.Status),
			Stage:          model.InvocationStageSubmit,
		})
	}

	meta := model.InvocationMeta{
		TaskID:         parsed.TaskID,
		ProviderStatus: normalizeNexusHubStatus(parsed.Status),
		Stage:          model.InvocationStageDecodeResult,
	}

	result := model.GenerateVideoResult{
		ID:     parsed.TaskID,
		Status: normalizeNexusHubStatus(parsed.Status),
		Model:  req.Model,
		Usage:  parsed.NexusUsage,
	}
	if parsed.NexusCost > 0 {
		result.CreditCost = model.CreditsFromUSD(parsed.NexusCost)
	}

	if parsed.RespPayload != "" {
		var respPayload atomicRespPayload
		if err := json.Unmarshal([]byte(parsed.RespPayload), &respPayload); err != nil {
			logNexusHubCapabilityError(ctx, string(model.CapabilityVideo), req.Model, route.AbilityKey, "decode_resp_payload", err, "decode nexushub video response payload failed")
			return invocationFailure[model.GenerateVideoResult]("", fmt.Errorf("decode resp_payload: %w", err), meta)
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

	return invocationSuccess(result, meta)
}

func (c *Client) GenerateMusic(ctx context.Context, req model.GenerateMusicRequest, route model.RouteBinding) (model.InvocationResult[model.GenerateMusicResult], error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "configuration", nil, "nexushub music client not configured")
		return invocationFailure[model.GenerateMusicResult]("", model.ErrMusicExecutionNotConfigured, model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}
	if route.AbilityKey == "" {
		logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "route_validation", nil, "nexushub music route missing ability key")
		return invocationFailure[model.GenerateMusicResult]("", fmt.Errorf("%w: missing ability_key", model.ErrModelRouteNotConfigured), model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}

	uid, err := parseNexusHubUID(req.UserID)
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "user_id_parse", err, "invalid nexushub user id")
		return invocationFailure[model.GenerateMusicResult]("", err, model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}

	payload := atomicProcessPayload{
		GenType:     route.GenType,
		Prompt:      req.Prompt,
		MusicOption: buildMusicOption(req),
		MetaOption: map[string]any{
			"request_id": req.RequestID,
			"model_id":   req.Model,
		},
	}

	reqPayload, err := json.Marshal(payload)
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "marshal_req_payload", err, "marshal nexushub music req_payload failed")
		return invocationFailure[model.GenerateMusicResult]("", fmt.Errorf("marshal req_payload: %w", err), model.InvocationMeta{Stage: model.InvocationStagePrepare})
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
		logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "marshal_submit_request", err, "marshal nexushub music submit request failed")
		return invocationFailure[model.GenerateMusicResult]("", fmt.Errorf("marshal submit request: %w", err), model.InvocationMeta{Stage: model.InvocationStagePrepare})
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+submitAtomicProcessPath, bytes.NewReader(bodyBytes))
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "build_request", err, "build nexushub music request failed")
		return invocationFailure[model.GenerateMusicResult]("", fmt.Errorf("build request: %w", err), model.InvocationMeta{Stage: model.InvocationStageSubmit})
	}
	httpReq.Header.Set("Content-Type", "application/json")
	setNexusExtraHeader(ctx, httpReq)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "http_request", err, "submit nexushub music request failed")
		code := ""
		if errors.Is(err, context.DeadlineExceeded) {
			code = model.InvocationErrorCodeUpstreamTimeout
		}
		return invocationFailure[model.GenerateMusicResult](code, fmt.Errorf("submit atomic process: %w", err), model.InvocationMeta{Stage: model.InvocationStageSubmit})
	}
	defer resp.Body.Close()

	var parsed submitAtomicProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "decode_submit_response", err, "decode nexushub music submit response failed")
		return invocationFailure[model.GenerateMusicResult]("", fmt.Errorf("decode submit response: %w", err), model.InvocationMeta{Stage: model.InvocationStageSubmit})
	}

	if resp.StatusCode != http.StatusOK {
		logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "submit_status", mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message), "nexushub music submit returned non-200", logging.Fields{
			"status_code": resp.StatusCode,
			"base_code":   parsed.Base.Code,
		})
		return invocationFailure[model.GenerateMusicResult]("", mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message), model.InvocationMeta{
			TaskID:         parsed.TaskID,
			ProviderStatus: normalizeNexusHubStatus(parsed.Status),
			Stage:          model.InvocationStageSubmit,
		})
	}

	meta := model.InvocationMeta{
		TaskID:         parsed.TaskID,
		ProviderStatus: normalizeNexusHubStatus(parsed.Status),
		Stage:          model.InvocationStageDecodeResult,
	}

	result := model.GenerateMusicResult{
		ID:     parsed.TaskID,
		Status: normalizeNexusHubStatus(parsed.Status),
		Model:  req.Model,
		Usage:  parsed.NexusUsage,
	}
	if parsed.NexusCost > 0 {
		result.CreditCost = model.CreditsFromUSD(parsed.NexusCost)
	}

	if parsed.RespPayload != "" {
		var respPayload atomicRespPayload
		if err := json.Unmarshal([]byte(parsed.RespPayload), &respPayload); err != nil {
			logNexusHubCapabilityError(ctx, string(model.CapabilityMusic), req.Model, route.AbilityKey, "decode_resp_payload", err, "decode nexushub music response payload failed")
			return invocationFailure[model.GenerateMusicResult]("", fmt.Errorf("decode resp_payload: %w", err), meta)
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

	return invocationSuccess(result, meta)
}

func buildAtomicVideoShotClips(clips []model.VideoShotClip) []atomicVideoShotClip {
	if len(clips) == 0 {
		return nil
	}
	out := make([]atomicVideoShotClip, 0, len(clips))
	for i, clip := range clips {
		index := clip.Index
		if index == 0 && i > 0 {
			index = i
		}
		out = append(out, atomicVideoShotClip{
			Index:    index,
			Prompt:   clip.Prompt,
			Duration: clip.Duration,
		})
	}
	return out
}

// buildMusicOption constructs the NexusHub music_option payload from the
// domain request, including provider-specific nested options when needed.
func buildMusicOption(req model.GenerateMusicRequest) *atomicMusicOption {
	opt := &atomicMusicOption{
		MakeInstrumental: req.MakeInstrumental,
		CustomMode:       req.CustomMode,
		Tags:             req.Tags,
		Title:            req.Title,
		Lyrics:           req.Lyrics,
		ContinueAt:       req.ContinueAt,
		ContinueClipID:   req.ContinueClipID,
		VocalGender:      req.VocalGender,
		Model:            req.ModelVariant,
	}
	if req.Duration > 0 {
		opt.Duration = req.Duration * 1000 // seconds → ms
	}
	return opt
}

func (c *Client) GetSubmitResult(ctx context.Context, taskID string) (model.ProviderTaskResult, error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"provider": "nexushub",
			"task_id":  taskID,
			"stage":    "configuration",
		}).Error("nexushub submit result client not configured")
		return model.ProviderTaskResult{}, model.ErrInternal
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+getSubmitResultPath+taskID, nil)
	if err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"provider": "nexushub",
			"task_id":  taskID,
			"stage":    "build_request",
		}).WithError(err).Error("build nexushub submit result request failed")
		return model.ProviderTaskResult{}, fmt.Errorf("build request: %w", err)
	}
	httpReq.Header.Set("X-Token", c.token)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"provider": "nexushub",
			"task_id":  taskID,
			"stage":    "http_request",
		}).WithError(err).Error("get nexushub submit result failed")
		return model.ProviderTaskResult{}, fmt.Errorf("get submit result: %w", err)
	}
	defer resp.Body.Close()

	var parsed submitAtomicProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"provider": "nexushub",
			"task_id":  taskID,
			"stage":    "decode_submit_result",
		}).WithError(err).Error("decode nexushub submit result failed")
		return model.ProviderTaskResult{}, fmt.Errorf("decode submit result response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"provider":    "nexushub",
			"task_id":     taskID,
			"stage":       "submit_result_status",
			"status_code": resp.StatusCode,
			"base_code":   parsed.Base.Code,
		}).WithError(mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message)).Error("nexushub submit result returned non-200")
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
	if parsed.NexusCost > 0 {
		result.CreditCost = model.CreditsFromUSD(parsed.NexusCost)
	}

	if parsed.RespPayload != "" {
		var respPayload atomicRespPayload
		if err := json.Unmarshal([]byte(parsed.RespPayload), &respPayload); err != nil {
			logging.WithContext(ctx).WithFields(logging.Fields{
				"provider": "nexushub",
				"task_id":  taskID,
				"stage":    "decode_resp_payload",
			}).WithError(err).Error("decode nexushub submit result payload failed")
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

func (c *Client) GetTaskIDByTrace(ctx context.Context, traceID, bizID string) (string, error) {
	if strings.TrimSpace(traceID) == "" {
		return "", model.ErrNotFound("nexushub trace lookup not found")
	}
	if strings.TrimSpace(bizID) == "" {
		bizID = defaultNexusHubBizID
	}
	logging.WithContext(ctx).WithFields(logging.Fields{
		"provider": "nexushub",
		"trace_id": traceID,
		"biz_id":   bizID,
		"stage":    "trace_lookup_not_configured",
	}).Warn("nexushub trace lookup path is not configured")
	return "", model.ErrNotConfigured("nexushub trace lookup is not configured")
}

func logNexusHubCapabilityError(ctx context.Context, capability, modelID, abilityKey, stage string, err error, message string, extra ...logging.Fields) {
	fields := logging.Fields{
		"provider":    "nexushub",
		"capability":  capability,
		"model":       modelID,
		"ability_key": abilityKey,
		"stage":       stage,
	}
	for _, item := range extra {
		for k, v := range item {
			fields[k] = v
		}
	}

	entry := logging.WithContext(ctx).WithFields(fields)
	if err != nil {
		entry = entry.WithError(err)
	}
	entry.Error(message)
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
	GenType      string              `json:"gen_type"`
	Prompt       string              `json:"prompt,omitempty"`
	ResourcePath string              `json:"resource_path,omitempty"`
	ResourceURL  string              `json:"resource_url,omitempty"`
	ImageOption  *atomicImageOption  `json:"image_option,omitempty"`
	VideoOption  *atomicVideoOption  `json:"video_option,omitempty"`
	MusicOption  *atomicMusicOption  `json:"music_option,omitempty"`
	SearchOption *atomicSearchOption `json:"search_option,omitempty"`
	MetaOption   map[string]any      `json:"meta_option,omitempty"`
}

type atomicImageOption struct {
	Type           string   `json:"type,omitempty"`
	Ratio          string   `json:"ratio,omitempty"`
	Resolution     string   `json:"resolution,omitempty"`
	Format         string   `json:"format,omitempty"`
	NegativePrompt string   `json:"negative_prompt,omitempty"`
	ReferImageURLs []string `json:"refer_image_urls,omitempty"`

	// Provider-specific image-edit knobs (gpt-image-2, qwen-image).
	MoveForward   int  `json:"move_forward,omitempty"`
	RotateDegrees int  `json:"rotate_degrees,omitempty"`
	UseWideAngle  bool `json:"use_wide_angle,omitempty"`
	VerticalTilt  int  `json:"vertical_tilt,omitempty"`
}

type atomicVideoOption struct {
	Type                   string                `json:"type,omitempty"`
	Ratio                  string                `json:"ratio,omitempty"`
	Resolution             string                `json:"resolution,omitempty"`
	Duration               int                   `json:"duration,omitempty"`
	Format                 string                `json:"format,omitempty"`
	FPS                    int                   `json:"fps,omitempty"`
	GenerateAudio          *bool                 `json:"generate_audio,omitempty"`
	NegativePrompt         string                `json:"negative_prompt,omitempty"`
	FirstFrameResourcePath string                `json:"first_frame_resource_path,omitempty"`
	FirstFrameURL          string                `json:"first_frame_url,omitempty"`
	LastFrameResourcePath  string                `json:"last_frame_resource_path,omitempty"`
	LastFrameURL           string                `json:"last_frame_url,omitempty"`
	ReferVideoResourcePath string                `json:"refer_video_resource_path,omitempty"`
	ReferVideoURL          string                `json:"refer_video_url,omitempty"`
	ReferVideoURLs         []string              `json:"refer_video_urls,omitempty"`
	ReferAudioURLs         []string              `json:"refer_audio_urls,omitempty"`
	ReferImageURLs         []string              `json:"refer_image_urls,omitempty"`
	MultiShotClips         []atomicVideoShotClip `json:"multi_shot_clips,omitempty"`
}

type atomicVideoShotClip struct {
	Index    int    `json:"index,omitempty"`
	Prompt   string `json:"prompt"`
	Duration int    `json:"duration"`
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
	// Model is the upstream provider variant (e.g. "v5", "v5.5"). It
	// is exposed to AnyCap callers as "model_variant" to avoid
	// colliding with the AnyCap top-level model id.
	Model string `json:"model,omitempty"`
	// Duration in milliseconds. AnyCap API accepts seconds; converted here.
	// TODO: NexusHub will rename this field to "duration_ms" — update json tag when that happens.
	Duration int `json:"duration,omitempty"`
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
	case "succeed", "succeeded", "success", "completed":
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

func setNexusExtraHeader(ctx context.Context, req *http.Request) {
	if req == nil {
		return
	}
	traceID := trace.GetTraceID(ctx)
	if strings.TrimSpace(traceID) == "" {
		return
	}
	extra, err := json.Marshal(map[string]any{
		"trace_id": traceID,
		"biz_id":   defaultNexusHubBizID,
	})
	if err != nil {
		return
	}
	req.Header.Set("X-Nexus-Extra", string(extra))
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
