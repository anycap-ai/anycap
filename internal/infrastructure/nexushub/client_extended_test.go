package nexushub

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/trace"
)

// captureLastSubmit returns an httptest.Server that records the last
// submitAtomicProcessRequest body and replies with a fixed success
// response. Use it to assert what the NexusHub adapter writes upstream.
func captureLastSubmit(t *testing.T) (*httptest.Server, *submitAtomicProcessRequest) {
	t.Helper()
	captured := &submitAtomicProcessRequest{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := json.NewDecoder(r.Body).Decode(captured); err != nil {
			t.Fatalf("decode submit body: %v", err)
		}
		resp := submitAtomicProcessResponse{
			Base:        submitBaseResponse{Code: 0, Message: "success"},
			TaskID:      "task-x",
			Status:      "succeeded",
			RespPayload: `{"resources":[{"url":"https://cdn.anycap.local/out","credit_cost":1}]}`,
			NexusCost:   0.001,
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	t.Cleanup(srv.Close)
	return srv, captured
}

func decodePayload(t *testing.T, raw string) atomicProcessPayload {
	t.Helper()
	var payload atomicProcessPayload
	if err := json.Unmarshal([]byte(raw), &payload); err != nil {
		t.Fatalf("unmarshal payload: %v", err)
	}
	return payload
}

func TestGenerateImage_PropagatesEditKnobs(t *testing.T) {
	srv, captured := captureLastSubmit(t)
	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "tok"})

	ctx := trace.SetTraceID(context.Background(), "req-1")
	_, err := client.GenerateImage(ctx, model.GenerateImageRequest{
		RequestID:     "req-1",
		UserID:        "user-9",
		Prompt:        "edit this",
		Model:         "gpt-image-2",
		Mode:          model.ModeImageToImage,
		Format:        "png",
		MoveForward:   3,
		RotateDegrees: 45,
		UseWideAngle:  true,
		VerticalTilt:  -10,
	}, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: "gpt_image_2",
		GenType:    string(model.CapabilityImage),
		AlgoType:   "img_edit",
		Priority:   100,
		Enabled:    true,
	})
	if err != nil {
		t.Fatalf("GenerateImage error: %v", err)
	}

	payload := decodePayload(t, captured.ReqPayload)
	if payload.ImageOption == nil {
		t.Fatal("expected image_option")
	}
	if payload.ImageOption.Format != "png" {
		t.Fatalf("expected format=png, got %q", payload.ImageOption.Format)
	}
	if payload.ImageOption.MoveForward != 3 {
		t.Fatalf("expected move_forward=3, got %d", payload.ImageOption.MoveForward)
	}
	if payload.ImageOption.RotateDegrees != 45 {
		t.Fatalf("expected rotate_degrees=45, got %d", payload.ImageOption.RotateDegrees)
	}
	if !payload.ImageOption.UseWideAngle {
		t.Fatal("expected use_wide_angle=true")
	}
	if payload.ImageOption.VerticalTilt != -10 {
		t.Fatalf("expected vertical_tilt=-10, got %d", payload.ImageOption.VerticalTilt)
	}
}

func TestGenerateImage_OmitsZeroEditKnobs(t *testing.T) {
	// Zero-valued knobs must not appear in the wire payload at all so
	// that providers without these features do not see noise.
	srv, captured := captureLastSubmit(t)
	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "tok"})

	_, err := client.GenerateImage(context.Background(), model.GenerateImageRequest{
		UserID: "user-9",
		Prompt: "p",
		Model:  "nano-banana-pro",
	}, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: "nano_banana_pro",
		GenType:    string(model.CapabilityImage),
		AlgoType:   "txt_2_img",
		Priority:   100,
		Enabled:    true,
	})
	if err != nil {
		t.Fatalf("GenerateImage error: %v", err)
	}
	if got := captured.ReqPayload; containsAny(got, []string{
		`"format"`, `"move_forward"`, `"rotate_degrees"`,
		`"use_wide_angle"`, `"vertical_tilt"`,
	}) {
		t.Fatalf("expected zero-valued knobs to be omitted, got payload: %s", got)
	}
}

func TestGenerateVideo_PropagatesFormatFPSAndAudio(t *testing.T) {
	srv, captured := captureLastSubmit(t)
	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "tok"})

	genAudio := true
	_, err := client.GenerateVideo(context.Background(), model.GenerateVideoRequest{
		UserID:        "user-9",
		Prompt:        "drone shot",
		Model:         "kling-3.0",
		Mode:          model.ModeTextToVideo,
		Duration:      5,
		Format:        "mp4",
		FPS:           24,
		GenerateAudio: &genAudio,
	}, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: "kling-3-0",
		GenType:    string(model.CapabilityVideo),
		AlgoType:   "txt_2_video",
		Priority:   100,
		Enabled:    true,
	})
	if err != nil {
		t.Fatalf("GenerateVideo error: %v", err)
	}

	payload := decodePayload(t, captured.ReqPayload)
	if payload.VideoOption == nil {
		t.Fatal("expected video_option")
	}
	if payload.VideoOption.Format != "mp4" {
		t.Fatalf("expected format=mp4, got %q", payload.VideoOption.Format)
	}
	if payload.VideoOption.FPS != 24 {
		t.Fatalf("expected fps=24, got %d", payload.VideoOption.FPS)
	}
	if payload.VideoOption.GenerateAudio == nil || !*payload.VideoOption.GenerateAudio {
		t.Fatalf("expected generate_audio=true, got %+v", payload.VideoOption.GenerateAudio)
	}
}

func TestGenerateVideo_GenerateAudioFalseRoundTrips(t *testing.T) {
	// Pointer semantics: an explicit false must be preserved (some
	// providers default to true; AnyCap caller may want to disable).
	srv, captured := captureLastSubmit(t)
	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "tok"})

	off := false
	_, err := client.GenerateVideo(context.Background(), model.GenerateVideoRequest{
		UserID:        "user-9",
		Prompt:        "p",
		Model:         "kling-3.0",
		Mode:          model.ModeTextToVideo,
		GenerateAudio: &off,
	}, model.RouteBinding{
		RouteType: model.RouteTypeDirect, AbilityKey: "k", GenType: "video",
		AlgoType: "txt_2_video", Priority: 100, Enabled: true,
	})
	if err != nil {
		t.Fatalf("GenerateVideo error: %v", err)
	}
	payload := decodePayload(t, captured.ReqPayload)
	if payload.VideoOption == nil || payload.VideoOption.GenerateAudio == nil || *payload.VideoOption.GenerateAudio {
		t.Fatalf("expected generate_audio=false, got %+v", payload.VideoOption)
	}
}

func TestGenerateVideo_GenerateAudioNilOmitted(t *testing.T) {
	// nil pointer means "do not set" -- the field must be absent from
	// the wire payload.
	srv, captured := captureLastSubmit(t)
	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "tok"})

	_, err := client.GenerateVideo(context.Background(), model.GenerateVideoRequest{
		UserID: "user-9", Prompt: "p", Model: "k", Mode: model.ModeTextToVideo,
	}, model.RouteBinding{
		RouteType: model.RouteTypeDirect, AbilityKey: "k", GenType: "video",
		AlgoType: "txt_2_video", Priority: 100, Enabled: true,
	})
	if err != nil {
		t.Fatalf("GenerateVideo error: %v", err)
	}
	if containsAny(captured.ReqPayload, []string{`"generate_audio"`}) {
		t.Fatalf("nil GenerateAudio must be omitted, got: %s", captured.ReqPayload)
	}
}

func TestGenerateVideo_PropagatesImageAndVideoReferences(t *testing.T) {
	srv, captured := captureLastSubmit(t)
	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "tok"})

	_, err := client.GenerateVideo(context.Background(), model.GenerateVideoRequest{
		UserID:             "user-9",
		Prompt:             "p",
		Model:              "seedance-2-fast",
		Mode:               model.ModeImageToVideo,
		ReferenceImageURLs: []string{"https://cdn/a.png", "https://cdn/b.png"},
		ReferenceVideoURLs: []string{"https://cdn/ref.mp4"},
	}, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: "ark-doubao-seedance-2-fast",
		GenType:    string(model.CapabilityVideo),
		AlgoType:   "img_2_video",
		Priority:   100,
		Enabled:    true,
		ResourceTargets: []model.ResourceTarget{
			{Key: "video_option.refer_image_urls", Kind: model.ResourceKindURLArray},
			{Key: "video_option.refer_video_url", Kind: model.ResourceKindURL},
		},
	})
	if err != nil {
		t.Fatalf("GenerateVideo error: %v", err)
	}

	payload := decodePayload(t, captured.ReqPayload)
	if payload.VideoOption == nil {
		t.Fatal("expected video_option")
	}
	if got := payload.VideoOption.ReferImageURLs; len(got) != 2 || got[0] != "https://cdn/a.png" || got[1] != "https://cdn/b.png" {
		t.Fatalf("expected two refer_image_urls, got %v", got)
	}
	if payload.VideoOption.ReferVideoURL != "https://cdn/ref.mp4" {
		t.Fatalf("expected refer_video_url, got %q", payload.VideoOption.ReferVideoURL)
	}
	if payload.ResourceURL != "https://cdn/a.png" {
		t.Fatalf("expected first image in resource_url, got %q", payload.ResourceURL)
	}
}

func TestGenerateVideo_PropagatesMultiModalReferences(t *testing.T) {
	srv, captured := captureLastSubmit(t)
	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "tok"})

	_, err := client.GenerateVideo(context.Background(), model.GenerateVideoRequest{
		UserID:             "user-9",
		Prompt:             "p",
		Model:              "seedance-2",
		Mode:               model.ModeMultiModalRef,
		ReferenceImageURLs: []string{"https://cdn/a.png", "https://cdn/b.png"},
		ReferenceVideoURLs: []string{"https://cdn/ref.mp4"},
		ReferenceAudioURLs: []string{"https://cdn/ref.wav"},
	}, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: "oversea-seedance-2",
		GenType:    string(model.CapabilityVideo),
		AlgoType:   "multi_modal_ref_2_video",
		Priority:   100,
		Enabled:    true,
		ResourceTargets: []model.ResourceTarget{
			{Key: "video_option.refer_image_urls", Kind: model.ResourceKindURLArray},
			{Key: "video_option.refer_video_urls", Kind: model.ResourceKindURLArray},
			{Key: "video_option.refer_audio_urls", Kind: model.ResourceKindURLArray},
		},
	})
	if err != nil {
		t.Fatalf("GenerateVideo error: %v", err)
	}

	payload := decodePayload(t, captured.ReqPayload)
	if payload.VideoOption == nil {
		t.Fatal("expected video_option")
	}
	if payload.VideoOption.Type != "multi_modal_ref_2_video" {
		t.Fatalf("expected multi_modal_ref_2_video, got %q", payload.VideoOption.Type)
	}
	if got := payload.VideoOption.ReferImageURLs; len(got) != 2 || got[0] != "https://cdn/a.png" || got[1] != "https://cdn/b.png" {
		t.Fatalf("expected two refer_image_urls, got %v", got)
	}
	if got := payload.VideoOption.ReferVideoURLs; len(got) != 1 || got[0] != "https://cdn/ref.mp4" {
		t.Fatalf("expected refer_video_urls, got %v", got)
	}
	if got := payload.VideoOption.ReferAudioURLs; len(got) != 1 || got[0] != "https://cdn/ref.wav" {
		t.Fatalf("expected refer_audio_urls, got %v", got)
	}
}

func TestGenerateVideo_PropagatesMultiShotClips(t *testing.T) {
	srv, captured := captureLastSubmit(t)
	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "tok"})

	_, err := client.GenerateVideo(context.Background(), model.GenerateVideoRequest{
		UserID:             "user-9",
		Model:              "kling-3.0",
		Mode:               model.ModeMultiShotVideo,
		Duration:           3,
		ReferenceImageURLs: []string{"https://cdn/ref-a.png", "https://cdn/ref-b.png"},
		MultiShotClips: []model.VideoShotClip{
			{Prompt: "wide establishing shot", Duration: 1},
			{Prompt: "close-up movement", Duration: 2},
		},
	}, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: "kling-3-0",
		GenType:    string(model.CapabilityVideo),
		AlgoType:   "multi_shot_video",
		Priority:   100,
		Enabled:    true,
		ResourceTargets: []model.ResourceTarget{
			{Key: "video_option.refer_image_urls", Kind: model.ResourceKindURLArray},
		},
	})
	if err != nil {
		t.Fatalf("GenerateVideo error: %v", err)
	}

	payload := decodePayload(t, captured.ReqPayload)
	if payload.VideoOption == nil {
		t.Fatal("expected video_option")
	}
	if payload.VideoOption.Type != "multi_shot_video" {
		t.Fatalf("expected multi_shot_video, got %q", payload.VideoOption.Type)
	}
	if got := payload.VideoOption.MultiShotClips; len(got) != 2 || got[0].Prompt != "wide establishing shot" || got[1].Duration != 2 {
		t.Fatalf("unexpected multi_shot_clips: %+v", got)
	}
	if got := payload.VideoOption.ReferImageURLs; len(got) != 2 || got[0] != "https://cdn/ref-a.png" || got[1] != "https://cdn/ref-b.png" {
		t.Fatalf("expected reference images to round trip, got %v", got)
	}
}

func TestGenerateMusic_PropagatesModelVariant(t *testing.T) {
	srv, captured := captureLastSubmit(t)
	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "tok"})

	_, err := client.GenerateMusic(context.Background(), model.GenerateMusicRequest{
		UserID:       "user-9",
		Prompt:       "p",
		Model:        "suno-v5",
		Tags:         "lofi",
		ModelVariant: "v5.5",
	}, model.RouteBinding{
		RouteType: model.RouteTypeDirect, AbilityKey: "302ai-suno-v5",
		GenType: string(model.CapabilityMusic), Priority: 100, Enabled: true,
	})
	if err != nil {
		t.Fatalf("GenerateMusic error: %v", err)
	}
	payload := decodePayload(t, captured.ReqPayload)
	if payload.MusicOption == nil || payload.MusicOption.Model != "v5.5" {
		t.Fatalf("expected music_option.model=v5.5, got %+v", payload.MusicOption)
	}
}

func containsAny(s string, needles []string) bool {
	for _, n := range needles {
		if strings.Contains(s, n) {
			return true
		}
	}
	return false
}
