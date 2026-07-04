package curatedcatalog

import (
	"reflect"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestParseResourceTargets_NanoBananaPro(t *testing.T) {
	annotation := map[string]any{
		"resource": map[string]any{
			"description": "Input or reference resource for this generation mode.",
			"oneOf": []any{
				map[string]any{"description": "Reference image URL.", "key": "resource_url", "type": "url"},
				map[string]any{"description": "Stored reference image resource path.", "key": "resource_path", "type": "storage"},
				map[string]any{"description": "Reference image URLs.", "key": "image_option.refer_image_urls", "type": "url_array"},
				map[string]any{"description": "Stored reference image resource paths.", "key": "image_option.refer_image_resource_path", "type": "storage_array"},
			},
		},
	}

	got := parseResourceTargets(annotation)
	want := []model.ResourceTarget{
		{Key: "resource_url", Kind: model.ResourceKindURL},
		{Key: "resource_path", Kind: model.ResourceKindStorage},
		{Key: "image_option.refer_image_urls", Kind: model.ResourceKindURLArray},
		{Key: "image_option.refer_image_resource_path", Kind: model.ResourceKindStorageArray},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("parseResourceTargets mismatch:\n got:  %+v\n want: %+v", got, want)
	}
}

func TestParseResourceTargets_EmptyAnnotation(t *testing.T) {
	if got := parseResourceTargets(nil); got != nil {
		t.Fatalf("expected nil for nil annotation, got %+v", got)
	}
	if got := parseResourceTargets(map[string]any{}); got != nil {
		t.Fatalf("expected nil for empty annotation, got %+v", got)
	}
	if got := parseResourceTargets(map[string]any{"resource": map[string]any{}}); got != nil {
		t.Fatalf("expected nil when oneOf missing, got %+v", got)
	}
}

func TestParseResourceTargets_SkipsUnknownKindsAndMissingKeys(t *testing.T) {
	annotation := map[string]any{
		"resource": map[string]any{
			"oneOf": []any{
				map[string]any{"key": "good", "type": "url"},
				map[string]any{"key": "missing-type"},
				map[string]any{"type": "url"},                    // missing key
				map[string]any{"key": "weird", "type": "binary"}, // unknown kind
				"not-an-object",
			},
		},
	}

	got := parseResourceTargets(annotation)
	want := []model.ResourceTarget{{Key: "good", Kind: model.ResourceKindURL}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("parseResourceTargets mismatch:\n got:  %+v\n want: %+v", got, want)
	}
}

func TestParseResourceTargets_MediaTypedBlocks(t *testing.T) {
	annotation := map[string]any{
		"video_resource": map[string]any{
			"description": "Input video resource for video editing.",
			"oneOf": []any{
				map[string]any{"description": "Input video URL.", "key": "resource_url", "type": "url"},
				map[string]any{"description": "Stored input video resource path.", "key": "resource_path", "type": "storage"},
			},
		},
		"audio_resource": map[string]any{
			"oneOf": []any{
				map[string]any{"key": "video_option.refer_audio_urls", "type": "url_array"},
			},
		},
	}

	got := parseResourceTargets(annotation)
	want := []model.ResourceTarget{
		{Key: "resource_url", Kind: model.ResourceKindURL, Media: model.ResourceMediaVideo},
		{Key: "resource_path", Kind: model.ResourceKindStorage, Media: model.ResourceMediaVideo},
		{Key: "video_option.refer_audio_urls", Kind: model.ResourceKindURLArray, Media: model.ResourceMediaAudio},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("parseResourceTargets mismatch:\n got:  %+v\n want: %+v", got, want)
	}
}
