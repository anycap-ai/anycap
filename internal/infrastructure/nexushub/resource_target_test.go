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

func TestApplyResourceTargets_UnknownKeyLogsAndDrops(t *testing.T) {
	buf := captureLogs(t)
	payload := &atomicProcessPayload{}
	targets := []model.ResourceTarget{
		{Key: "video_option.refer_image_urls", Kind: model.ResourceKindURLArray},
	}
	urls := []string{"https://cdn/a.png"}

	applyResourceTargets(context.Background(), payload, "ability-y", targets, urls)

	if payload.ImageOption != nil || payload.ResourceURL != "" {
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
