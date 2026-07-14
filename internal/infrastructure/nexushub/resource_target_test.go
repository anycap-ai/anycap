package nexushub

import (
	"context"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestApplyResourceTargets_PrefersURLArrayOverURL(t *testing.T) {
	payload := &atomicProcessPayload{ImageOption: &atomicImageOption{Type: "img_2_img"}}
	targets := []model.ResourceTarget{
		{Key: "image_option.refer_image_urls", Kind: model.ResourceKindURLArray},
		{Key: "resource_url", Kind: model.ResourceKindURL},
	}
	urls := []string{"https://cdn/a.png", "https://cdn/b.png"}

	applyResourceTargets(context.Background(), payload, "ability-x", targets, urls)

	if got := payload.ImageOption.ReferImageURLs; len(got) != 2 || got[0] != urls[0] {
		t.Fatalf("expected refer_image_urls=%v, got %v", urls, got)
	}
	if payload.ResourceURL != "" {
		t.Fatalf("expected resource_url to remain empty, got %q", payload.ResourceURL)
	}
}

func TestApplyResourceTargets_FallsBackToURLWhenNoArrayKey(t *testing.T) {
	payload := &atomicProcessPayload{}
	targets := []model.ResourceTarget{
		{Key: "resource_url", Kind: model.ResourceKindURL},
	}
	urls := []string{"https://cdn/frame.png", "https://cdn/extra.png"}

	applyResourceTargets(context.Background(), payload, "veo", targets, urls)

	if payload.ResourceURL != urls[0] {
		t.Fatalf("expected resource_url=%q, got %q", urls[0], payload.ResourceURL)
	}
}

func TestApplyResourceTargets_NoTargetsLogsAndDrops(t *testing.T) {
	buf := captureLogs(t)
	payload := &atomicProcessPayload{}
	urls := []string{"https://cdn/a.png"}

	applyResourceTargets(context.Background(), payload, "ability-x", nil, urls)

	if payload.ImageOption != nil || payload.ResourceURL != "" {
		t.Fatalf("expected payload untouched, got %+v", payload)
	}
	if !strings.Contains(buf.String(), "no resource targets") {
		t.Fatalf("expected warning about missing targets, got: %s", buf.String())
	}
}

func TestApplyResourceTargets_WritesVideoReferImageURLs(t *testing.T) {
	payload := &atomicProcessPayload{VideoOption: &atomicVideoOption{Type: "ref_2_video"}}
	targets := []model.ResourceTarget{
		{Key: "video_option.refer_image_urls", Kind: model.ResourceKindURLArray},
	}
	urls := []string{"https://cdn/a.png", "https://cdn/b.png"}

	applyResourceTargets(context.Background(), payload, "ability-y", targets, urls)

	if got := payload.VideoOption.ReferImageURLs; len(got) != 2 || got[0] != urls[0] || got[1] != urls[1] {
		t.Fatalf("expected video refer_image_urls=%v, got %v", urls, got)
	}
	if payload.ResourceURL != urls[0] {
		t.Fatalf("expected first reference to satisfy resource_url=%q, got %q", urls[0], payload.ResourceURL)
	}
	if payload.ImageOption != nil {
		t.Fatalf("expected image/resource targets untouched, got %+v", payload)
	}
}

func TestApplyResourceTargets_WritesVideoSingleURLTargets(t *testing.T) {
	payload := &atomicProcessPayload{VideoOption: &atomicVideoOption{Type: "first_last_2_video"}}

	applyResourceTargets(context.Background(), payload, "ability-first", []model.ResourceTarget{
		{Key: "video_option.first_frame_url", Kind: model.ResourceKindURL},
	}, []string{"https://cdn/first.png"})
	applyResourceTargets(context.Background(), payload, "ability-last", []model.ResourceTarget{
		{Key: "video_option.last_frame_url", Kind: model.ResourceKindURL},
	}, []string{"https://cdn/last.png"})
	applyResourceTargets(context.Background(), payload, "ability-ref", []model.ResourceTarget{
		{Key: "video_option.refer_video_url", Kind: model.ResourceKindURL},
	}, []string{"https://cdn/ref.mp4"})

	if payload.VideoOption.FirstFrameURL != "https://cdn/first.png" {
		t.Fatalf("expected first_frame_url to be written, got %q", payload.VideoOption.FirstFrameURL)
	}
	if payload.VideoOption.LastFrameURL != "https://cdn/last.png" {
		t.Fatalf("expected last_frame_url to be written, got %q", payload.VideoOption.LastFrameURL)
	}
	if payload.VideoOption.ReferVideoURL != "https://cdn/ref.mp4" {
		t.Fatalf("expected refer_video_url to be written, got %q", payload.VideoOption.ReferVideoURL)
	}
}

func TestApplyNamedFrameResourceTargets_PrefersRoleSpecificVideoOption(t *testing.T) {
	payload := &atomicProcessPayload{VideoOption: &atomicVideoOption{Type: "first_last_2_video"}}
	firstURL := "https://cdn/first.png"
	lastURL := "https://cdn/last.png"
	targets := []model.ResourceTarget{
		{Key: "resource_url", Kind: model.ResourceKindURL, Media: model.ResourceMediaImage, Role: model.ResourceRoleFirstFrame},
		{Key: "video_option.first_frame_url", Kind: model.ResourceKindURL, Media: model.ResourceMediaImage, Role: model.ResourceRoleFirstFrame},
		{Key: "resource_url", Kind: model.ResourceKindURL, Media: model.ResourceMediaImage, Role: model.ResourceRoleLastFrame},
		{Key: "video_option.last_frame_url", Kind: model.ResourceKindURL, Media: model.ResourceMediaImage, Role: model.ResourceRoleLastFrame},
	}

	applyFirstFrameResourceTargets(context.Background(), payload, "ability-first-last", targets, firstURL)
	applyLastFrameResourceTargets(context.Background(), payload, "ability-first-last", targets, lastURL)

	if payload.VideoOption.FirstFrameURL != firstURL {
		t.Fatalf("expected first_frame_url=%q, got %q", firstURL, payload.VideoOption.FirstFrameURL)
	}
	if payload.VideoOption.LastFrameURL != lastURL {
		t.Fatalf("expected last_frame_url=%q, got %q", lastURL, payload.VideoOption.LastFrameURL)
	}
	if payload.ResourceURL != "" {
		t.Fatalf("expected generic resource_url to remain empty, got %q", payload.ResourceURL)
	}
}

func TestApplyMediaResourceTargets_WritesImagesAndVideosSeparately(t *testing.T) {
	payload := &atomicProcessPayload{VideoOption: &atomicVideoOption{Type: "img_2_video"}}
	targets := []model.ResourceTarget{
		{Key: "video_option.refer_image_urls", Kind: model.ResourceKindURLArray},
		{Key: "video_option.refer_video_url", Kind: model.ResourceKindURL},
	}
	images := []string{"https://cdn/a.png", "https://cdn/b.png"}
	videos := []string{"https://cdn/ref.mp4"}

	applyImageResourceTargets(context.Background(), payload, "ability-media", targets, images)
	applyVideoResourceTargets(context.Background(), payload, "ability-media", targets, videos)

	if got := payload.VideoOption.ReferImageURLs; len(got) != 2 || got[0] != images[0] || got[1] != images[1] {
		t.Fatalf("expected image references=%v, got %v", images, got)
	}
	if payload.VideoOption.ReferVideoURL != videos[0] {
		t.Fatalf("expected video reference=%q, got %q", videos[0], payload.VideoOption.ReferVideoURL)
	}
	if payload.ResourceURL != images[0] {
		t.Fatalf("expected first image to satisfy resource_url=%q, got %q", images[0], payload.ResourceURL)
	}
}

func TestApplyMediaResourceTargets_WritesImagesVideosAndAudiosSeparately(t *testing.T) {
	payload := &atomicProcessPayload{VideoOption: &atomicVideoOption{Type: "multi_modal_ref_2_video"}}
	targets := []model.ResourceTarget{
		{Key: "video_option.refer_image_urls", Kind: model.ResourceKindURLArray},
		{Key: "video_option.refer_video_urls", Kind: model.ResourceKindURLArray},
		{Key: "video_option.refer_audio_urls", Kind: model.ResourceKindURLArray},
	}
	images := []string{"https://cdn/a.png", "https://cdn/b.png"}
	videos := []string{"https://cdn/ref.mp4", "https://cdn/ref-2.mp4"}
	audios := []string{"https://cdn/ref.wav"}

	applyImageResourceTargets(context.Background(), payload, "ability-media", targets, images)
	applyVideoResourceTargets(context.Background(), payload, "ability-media", targets, videos)
	applyAudioResourceTargets(context.Background(), payload, "ability-media", targets, audios)

	if got := payload.VideoOption.ReferImageURLs; len(got) != 2 || got[0] != images[0] || got[1] != images[1] {
		t.Fatalf("expected image references=%v, got %v", images, got)
	}
	if got := payload.VideoOption.ReferVideoURLs; len(got) != 2 || got[0] != videos[0] || got[1] != videos[1] {
		t.Fatalf("expected video references=%v, got %v", videos, got)
	}
	if got := payload.VideoOption.ReferAudioURLs; len(got) != 1 || got[0] != audios[0] {
		t.Fatalf("expected audio references=%v, got %v", audios, got)
	}
}

func TestApplyMediaResourceTargets_EditVideoResourceURLTaggedAsVideo(t *testing.T) {
	payload := &atomicProcessPayload{VideoOption: &atomicVideoOption{Type: "edit_video"}}
	targets := []model.ResourceTarget{
		{Key: "resource_url", Kind: model.ResourceKindURL, Media: model.ResourceMediaVideo},
		{Key: "resource_path", Kind: model.ResourceKindStorage, Media: model.ResourceMediaVideo},
	}
	videos := []string{"https://cdn/source.mp4"}

	// resource_url is media-tagged as video, so it must NOT accept images.
	applyImageResourceTargets(context.Background(), payload, "gemini-omni-flash-preview", targets, []string{"https://cdn/a.png"})
	if payload.ResourceURL != "" {
		t.Fatalf("expected image references to be rejected by video-tagged resource_url, got %q", payload.ResourceURL)
	}

	applyVideoResourceTargets(context.Background(), payload, "gemini-omni-flash-preview", targets, videos)
	if payload.ResourceURL != videos[0] {
		t.Fatalf("expected input video to land in resource_url=%q, got %q", videos[0], payload.ResourceURL)
	}
}

func TestApplyResourceTargets_UnknownKeyLogsAndDrops(t *testing.T) {
	buf := captureLogs(t)
	payload := &atomicProcessPayload{}
	targets := []model.ResourceTarget{
		{Key: "video_option.future_reference_urls", Kind: model.ResourceKindURLArray},
	}
	urls := []string{"https://cdn/a.png"}

	applyResourceTargets(context.Background(), payload, "ability-y", targets, urls)

	if payload.ImageOption != nil || payload.VideoOption != nil || payload.ResourceURL != "" {
		t.Fatalf("expected payload untouched, got %+v", payload)
	}
	if !strings.Contains(buf.String(), "no resource target accepted") {
		t.Fatalf("expected warning about no accepted target, got: %s", buf.String())
	}
}

func TestApplyResourceTargets_StorageKindIgnored(t *testing.T) {
	payload := &atomicProcessPayload{}
	targets := []model.ResourceTarget{
		{Key: "image_option.refer_image_resource_path", Kind: model.ResourceKindStorageArray},
		{Key: "resource_path", Kind: model.ResourceKindStorage},
	}
	applyResourceTargets(context.Background(), payload, "ability", targets, []string{"https://cdn/a.png"})
	if payload.ImageOption != nil || payload.ResourceURL != "" {
		t.Fatalf("expected storage kinds to be ignored when only URLs available, got %+v", payload)
	}
}

func TestApplyResourceTargets_EmptyURLsNoOp(t *testing.T) {
	payload := &atomicProcessPayload{ImageOption: &atomicImageOption{Type: "txt_2_img"}}
	applyResourceTargets(context.Background(), payload, "ability", []model.ResourceTarget{
		{Key: "image_option.refer_image_urls", Kind: model.ResourceKindURLArray},
	}, nil)
	if len(payload.ImageOption.ReferImageURLs) != 0 {
		t.Fatalf("expected no urls written, got %v", payload.ImageOption.ReferImageURLs)
	}
}
