package curatedcatalog

import (
	"reflect"
	"sort"
	"testing"
)

func TestFlattenDiscoverySchema_ImageTextToImage(t *testing.T) {
	schema := map[string]any{
		"type":     "object",
		"required": []any{"gen_type", "prompt", "image_option"},
		"properties": map[string]any{
			"gen_type": map[string]any{"type": "string", "enum": []any{"image"}},
			"prompt":   map[string]any{"type": "string", "description": "Text prompt describing the desired output."},
			"image_option": map[string]any{
				"type":     "object",
				"required": []any{"type"},
				"properties": map[string]any{
					"type":       map[string]any{"type": "string", "enum": []any{"txt_2_img"}},
					"ratio":      map[string]any{"type": "string", "enum": []any{"1:1", "16:9"}, "description": "Output aspect ratio."},
					"resolution": map[string]any{"type": "string", "enum": []any{"1k", "2k", "4k"}, "description": "Output resolution."},
					"format":     map[string]any{"type": "string", "enum": []any{"jpg", "png"}},
				},
			},
		},
	}

	got := flattenDiscoverySchema(schema, false)
	mustMapKeys(t, got, []string{"model_params"})

	params, ok := got["model_params"].(map[string]any)
	if !ok {
		t.Fatalf("expected model_params object, got %T", got["model_params"])
	}
	mustMapKeys(t, params, []string{"prompt", "aspect_ratio", "resolution", "format"})

	ratio, ok := params["aspect_ratio"].(map[string]any)
	if !ok {
		t.Fatalf("expected aspect_ratio map, got %T", params["aspect_ratio"])
	}
	if desc, _ := ratio["description"].(string); desc == "" {
		t.Fatalf("expected aspect_ratio description preserved, got empty")
	}
}

func TestFlattenDiscoverySchema_VideoImageToVideoIncludesResource(t *testing.T) {
	schema := map[string]any{
		"properties": map[string]any{
			"gen_type":      map[string]any{"type": "string", "enum": []any{"video"}},
			"model":         map[string]any{"type": "string"},
			"prompt":        map[string]any{"type": "string"},
			"resource_id":   map[string]any{"type": "string"},
			"resource_url":  map[string]any{"type": "string"},
			"resource_path": map[string]any{"type": "string"},
			"video_option": map[string]any{
				"properties": map[string]any{
					"type":                      map[string]any{"type": "string", "enum": []any{"img_2_video"}},
					"duration":                  map[string]any{"type": "integer", "enum": []any{5, 10}},
					"ratio":                     map[string]any{"type": "string", "enum": []any{"16:9"}},
					"resolution":                map[string]any{"type": "string", "enum": []any{"720p", "1080p"}},
					"first_frame_resource_path": map[string]any{"type": "string"},
					"first_frame_url":           map[string]any{"type": "string"},
					"last_frame_resource_path":  map[string]any{"type": "string"},
					"last_frame_url":            map[string]any{"type": "string"},
					"refer_video_resource_path": map[string]any{"type": "string"},
					"refer_video_url":           map[string]any{"type": "string"},
					"refer_image_urls":          map[string]any{"type": "array"},
				},
			},
		},
	}

	got := flattenDiscoverySchema(schema, false)
	params, _ := got["model_params"].(map[string]any)
	wantKeys := []string{"prompt", "duration", "aspect_ratio", "resolution"}
	mustMapKeys(t, params, wantKeys)

	if _, exists := params["resource_url"]; exists {
		t.Fatalf("resource_url should not appear in flattened params: %v", params)
	}
	if _, exists := params["resource_id"]; exists {
		t.Fatalf("resource_id should not appear in flattened params: %v", params)
	}
	if _, exists := params["model"]; exists {
		t.Fatalf("internal req_payload model should not appear in flattened params: %v", params)
	}
	if _, exists := params["gen_type"]; exists {
		t.Fatalf("gen_type should not appear in flattened params: %v", params)
	}
	for _, key := range []string{
		"first_frame_resource_path",
		"first_frame_url",
		"last_frame_resource_path",
		"last_frame_url",
		"refer_video_resource_path",
		"refer_video_url",
		"refer_image_urls",
	} {
		if _, exists := params[key]; exists {
			t.Fatalf("%s should not appear in flattened params: %v", key, params)
		}
	}
}

func TestFlattenDiscoverySchema_MusicTextToMusic(t *testing.T) {
	schema := map[string]any{
		"properties": map[string]any{
			"prompt": map[string]any{"type": "string"},
			"music_option": map[string]any{
				"properties": map[string]any{
					"type":     map[string]any{"type": "string", "enum": []any{"text_2_music"}},
					"duration": map[string]any{"type": "integer"},
					"format":   map[string]any{"type": "string", "enum": []any{"mp3"}},
				},
			},
		},
	}

	got := flattenDiscoverySchema(schema, false)
	params, _ := got["model_params"].(map[string]any)
	mustMapKeys(t, params, []string{"prompt", "duration", "format"})
}

func TestFlattenDiscoverySchema_MusicRenamesUpstreamModel(t *testing.T) {
	// music_option.model is the upstream provider variant. It must be
	// surfaced to AnyCap callers as "model_variant" so it does not
	// shadow the AnyCap top-level "model" parameter.
	schema := map[string]any{
		"properties": map[string]any{
			"prompt": map[string]any{"type": "string"},
			"music_option": map[string]any{
				"properties": map[string]any{
					"model":    map[string]any{"type": "string", "description": "Upstream model variant."},
					"duration": map[string]any{"type": "integer"},
				},
			},
		},
	}
	got := flattenDiscoverySchema(schema, false)
	params, _ := got["model_params"].(map[string]any)
	mustMapKeys(t, params, []string{"prompt", "duration", "model_variant"})
	mv, ok := params["model_variant"].(map[string]any)
	if !ok || mv["description"] != "Upstream model variant." {
		t.Fatalf("expected model_variant to retain description, got %+v", params["model_variant"])
	}
	if _, exists := params["model"]; exists {
		t.Fatalf("nested upstream model must not collide with top-level model")
	}
}

func TestFlattenDiscoverySchema_ForwardCompatPassesUnknownKeys(t *testing.T) {
	schema := map[string]any{
		"properties": map[string]any{
			"prompt":            map[string]any{"type": "string"},
			"future_top_field":  map[string]any{"type": "string"},
			"future_top_object": map[string]any{"type": "object"},
		},
	}
	got := flattenDiscoverySchema(schema, false)
	params, _ := got["model_params"].(map[string]any)
	mustMapKeys(t, params, []string{"prompt", "future_top_field", "future_top_object"})
}

func TestFlattenDiscoverySchema_NilOrEmptyReturnsNil(t *testing.T) {
	if flattenDiscoverySchema(nil, false) != nil {
		t.Fatal("expected nil for nil input")
	}
	if flattenDiscoverySchema(map[string]any{}, false) != nil {
		t.Fatal("expected nil for empty input")
	}
	if flattenDiscoverySchema(map[string]any{"properties": map[string]any{}}, false) != nil {
		t.Fatal("expected nil for empty properties")
	}
}

func TestFlattenDiscoverySchema_SkipsNonDictPropertyValues(t *testing.T) {
	// Real NexusHub schemas occasionally include a stray "description" string
	// inside *_option.properties. We should not promote it as a model param.
	schema := map[string]any{
		"properties": map[string]any{
			"prompt": map[string]any{"type": "string"},
			"image_option": map[string]any{
				"description": "Image generation options.",
				"properties": map[string]any{
					"description": "Image generation options.",
					"ratio":       map[string]any{"type": "string"},
				},
			},
		},
	}
	got := flattenDiscoverySchema(schema, false)
	params, _ := got["model_params"].(map[string]any)
	mustMapKeys(t, params, []string{"prompt", "aspect_ratio"})
}

func TestFlattenDiscoverySchema_DropsReferenceImageWireFields(t *testing.T) {
	// Wire-format reference fields must never reach the agent surface,
	// regardless of whether withImages is requested.
	schema := map[string]any{
		"properties": map[string]any{
			"prompt": map[string]any{"type": "string"},
			"image_option": map[string]any{
				"properties": map[string]any{
					"refer_image_urls":          map[string]any{"type": "array"},
					"refer_image_resource_path": map[string]any{"type": "array"},
					"ratio":                     map[string]any{"type": "string"},
				},
			},
		},
	}
	got := flattenDiscoverySchema(schema, false)
	params, _ := got["model_params"].(map[string]any)
	mustMapKeys(t, params, []string{"prompt", "aspect_ratio"})
}

func TestFlattenDiscoverySchema_WithImagesSynthesizesField(t *testing.T) {
	schema := map[string]any{
		"properties": map[string]any{
			"prompt":       map[string]any{"type": "string"},
			"resource_url": map[string]any{"type": "string"},
			"image_option": map[string]any{
				"properties": map[string]any{
					"refer_image_urls": map[string]any{"type": "array"},
					"ratio":            map[string]any{"type": "string"},
				},
			},
		},
	}
	got := flattenDiscoverySchema(schema, true)
	params, _ := got["model_params"].(map[string]any)
	mustMapKeys(t, params, []string{"prompt", "aspect_ratio", "images"})

	images, ok := params["images"].(map[string]any)
	if !ok {
		t.Fatalf("expected images object, got %T", params["images"])
	}
	if images["type"] != "array" {
		t.Fatalf("expected images.type=array, got %v", images["type"])
	}
	if images["maxItems"] != 9 {
		t.Fatalf("expected images.maxItems=9, got %v", images["maxItems"])
	}
	items, _ := images["items"].(map[string]any)
	if items["format"] != "file-or-url" {
		t.Fatalf("expected images.items.format=file-or-url, got %v", items["format"])
	}
	if _, exists := params["refer_image_urls"]; exists {
		t.Fatalf("wire field refer_image_urls must stay hidden")
	}
	if _, exists := params["resource_url"]; exists {
		t.Fatalf("wire field resource_url must stay hidden")
	}
}

func TestFlattenDiscoverySchema_WithVideosSynthesizesField(t *testing.T) {
	schema := map[string]any{
		"properties": map[string]any{
			"prompt": map[string]any{"type": "string"},
			"video_option": map[string]any{
				"properties": map[string]any{
					"refer_video_url": map[string]any{"type": "string"},
					"ratio":           map[string]any{"type": "string"},
				},
			},
		},
	}
	got := flattenDiscoverySchemaWithMedia(schema, referenceMediaParams{Videos: true})
	params, _ := got["model_params"].(map[string]any)
	mustMapKeys(t, params, []string{"prompt", "aspect_ratio", "videos"})

	videos, ok := params["videos"].(map[string]any)
	if !ok {
		t.Fatalf("expected videos object, got %T", params["videos"])
	}
	if videos["type"] != "array" {
		t.Fatalf("expected videos.type=array, got %v", videos["type"])
	}
	if videos["maxItems"] != 3 {
		t.Fatalf("expected videos.maxItems=3, got %v", videos["maxItems"])
	}
	items, _ := videos["items"].(map[string]any)
	if items["format"] != "file-or-url" {
		t.Fatalf("expected videos.items.format=file-or-url, got %v", items["format"])
	}
	if _, exists := params["refer_video_url"]; exists {
		t.Fatalf("wire field refer_video_url must stay hidden")
	}
}

func TestFlattenDiscoverySchema_WithImagesPreservesRealImagesField(t *testing.T) {
	// Defensive: if Discovery one day exposes a real "images" field at
	// the top level, we should not clobber it with the synthetic schema.
	realImages := map[string]any{"type": "string", "description": "real upstream field"}
	schema := map[string]any{
		"properties": map[string]any{
			"prompt": map[string]any{"type": "string"},
			"images": realImages,
		},
	}
	got := flattenDiscoverySchema(schema, true)
	params, _ := got["model_params"].(map[string]any)
	if got, ok := params["images"].(map[string]any); !ok || got["description"] != "real upstream field" {
		t.Fatalf("expected real images field preserved, got %v", params["images"])
	}
}

func mustMapKeys(t *testing.T, got map[string]any, want []string) {
	t.Helper()
	if got == nil {
		t.Fatalf("expected non-nil map, got nil; want keys %v", want)
	}
	gotKeys := make([]string, 0, len(got))
	for k := range got {
		gotKeys = append(gotKeys, k)
	}
	sort.Strings(gotKeys)
	wantSorted := append([]string(nil), want...)
	sort.Strings(wantSorted)
	if !reflect.DeepEqual(gotKeys, wantSorted) {
		t.Fatalf("map keys mismatch:\n got:  %v\n want: %v", gotKeys, wantSorted)
	}
}
