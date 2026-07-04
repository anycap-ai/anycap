package curatedcatalog

import (
	"context"
	"errors"
	"reflect"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
)

type fakeCuration struct {
	cfg *config.ModelCurationConfig
}

func (f fakeCuration) Snapshot() *config.ModelCurationConfig { return f.cfg }

type fakeDiscovery struct {
	nodes map[string]*nexushub.DiscoveryNode
	calls int
}

func (f *fakeDiscovery) GetNode(_ context.Context, abilityKey, algo string) (*nexushub.DiscoveryNode, error) {
	f.calls++
	if node, ok := f.nodes[abilityKey]; ok {
		return node, nil
	}
	return nil, errors.New("not found")
}

func sampleCuration() *config.ModelCurationConfig {
	return &config.ModelCurationConfig{
		Models: []config.ModelCurationModelConfig{
			{
				ModelID:          "seedream-5",
				Capability:       "image",
				DisplayName:      "Seedream 5",
				ModelDescription: "test description",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "text-to-image", AbilityKey: "ark-doubao-seedream-5", AlgoType: "txt_2_img", ModeDescription: "Text to image."},
					{Operation: "edit", Mode: "image-to-image", AbilityKey: "ark-doubao-seedream-5", AlgoType: "img_2_img"},
				},
			},
			{
				ModelID:    "veo-3.1",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "text-to-video", AbilityKey: "veo3.1", AlgoType: "txt_2_video"},
				},
			},
		},
	}
}

func sampleDiscoveryNodes() map[string]*nexushub.DiscoveryNode {
	mkSchema := func(algo string) map[string]any {
		return map[string]any{
			"properties": map[string]any{
				"prompt": map[string]any{"type": "string"},
				"image_option": map[string]any{
					"properties": map[string]any{
						"type":  map[string]any{"type": "string", "enum": []any{algo}},
						"ratio": map[string]any{"type": "string", "enum": []any{"1:1"}},
					},
				},
			},
		}
	}
	mkVideoSchema := func(algo string) map[string]any {
		return map[string]any{
			"properties": map[string]any{
				"prompt": map[string]any{"type": "string"},
				"video_option": map[string]any{
					"properties": map[string]any{
						"type":     map[string]any{"type": "string", "enum": []any{algo}},
						"duration": map[string]any{"type": "integer", "enum": []any{5}},
					},
				},
			},
		}
	}
	return map[string]*nexushub.DiscoveryNode{
		"ark-doubao-seedream-5": {
			AbilityKey: "ark-doubao-seedream-5",
			State:      "active",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"txt_2_img": {Schema: mkSchema("txt_2_img"), AlgoDescription: nexushub.DiscoveryAlgoDescription{Description: "discovery-described txt_2_img"}},
				"img_2_img": {Schema: mkSchema("img_2_img"), AlgoDescription: nexushub.DiscoveryAlgoDescription{Description: "fallback mode description"}},
			},
		},
		"veo3.1": {
			AbilityKey: "veo3.1",
			State:      "active",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"txt_2_video": {Schema: mkVideoSchema("txt_2_video")},
			},
		},
	}
}

func TestCatalog_ListModels_Image(t *testing.T) {
	cat := New(fakeCuration{cfg: sampleCuration()}, &fakeDiscovery{nodes: sampleDiscoveryNodes()})

	specs, err := cat.ListModels(context.Background(), model.CapabilityImage)
	if err != nil {
		t.Fatalf("ListModels error: %v", err)
	}
	if len(specs) != 1 {
		t.Fatalf("want 1 image model, got %d", len(specs))
	}
	spec := specs[0]
	if spec.ModelID != "seedream-5" {
		t.Fatalf("unexpected model_id: %s", spec.ModelID)
	}

	gen, ok := spec.Operations[model.OperationGenerate]
	if !ok {
		t.Fatalf("expected generate operation present")
	}
	if len(gen.Routes) != 1 || gen.Routes[0].AbilityKey != "ark-doubao-seedream-5" || gen.Routes[0].AlgoType != "txt_2_img" {
		t.Fatalf("unexpected generate route: %+v", gen.Routes)
	}
	if len(gen.Modes) != 1 || gen.Modes[0].Mode != model.ModeTextToImage || gen.Modes[0].Description != "Text to image." {
		t.Fatalf("unexpected modes: %+v", gen.Modes)
	}
	if _, ok := gen.ModeSchemas[model.ModeTextToImage]; !ok {
		t.Fatalf("expected mode schema for text-to-image")
	}
	if len(gen.RequestHints) == 0 {
		t.Fatalf("expected fallback RequestHints to be populated")
	}

	edit, ok := spec.Operations[model.OperationEdit]
	if !ok {
		t.Fatalf("expected edit operation present")
	}
	if len(edit.Routes) != 1 || edit.Routes[0].AlgoType != "img_2_img" {
		t.Fatalf("unexpected edit route: %+v", edit.Routes)
	}
	if edit.Modes[0].Description != "fallback mode description" {
		t.Fatalf("expected discovery-derived mode description, got %q", edit.Modes[0].Description)
	}
}

func TestCatalog_ListModels_Video(t *testing.T) {
	cat := New(fakeCuration{cfg: sampleCuration()}, &fakeDiscovery{nodes: sampleDiscoveryNodes()})
	specs, err := cat.ListModels(context.Background(), model.CapabilityVideo)
	if err != nil {
		t.Fatalf("ListModels error: %v", err)
	}
	if len(specs) != 1 || specs[0].ModelID != "veo-3.1" {
		t.Fatalf("unexpected video result: %+v", specs)
	}
}

func TestCatalog_GetModel_NotFound(t *testing.T) {
	cat := New(fakeCuration{cfg: sampleCuration()}, &fakeDiscovery{nodes: sampleDiscoveryNodes()})
	if _, err := cat.GetModel(context.Background(), model.CapabilityImage, "missing"); err == nil {
		t.Fatal("expected error for missing model")
	}
}

func TestCatalog_SkipsOperationsMissingFromDiscovery(t *testing.T) {
	cur := sampleCuration()
	// Add an operation that points to an ability_key absent from discovery.
	cur.Models[0].Operations = append(cur.Models[0].Operations, config.ModelCurationOperationConfig{
		Operation: "upscale", AbilityKey: "missing-node", AlgoType: "ultra_img",
	})
	cat := New(fakeCuration{cfg: cur}, &fakeDiscovery{nodes: sampleDiscoveryNodes()})

	spec, err := cat.GetModel(context.Background(), model.CapabilityImage, "seedream-5")
	if err != nil {
		t.Fatalf("GetModel error: %v", err)
	}
	if _, ok := spec.Operations[model.OperationUpscale]; ok {
		t.Fatal("expected upscale operation to be skipped (missing in discovery)")
	}
}

func TestCatalog_CuratedAbilityKeysDeduplicates(t *testing.T) {
	cat := New(fakeCuration{cfg: sampleCuration()}, &fakeDiscovery{nodes: sampleDiscoveryNodes()})
	keys := cat.CuratedAbilityKeys()
	// (ark-doubao-seedream-5, txt_2_img), (ark-doubao-seedream-5, img_2_img), (veo3.1, txt_2_video)
	if len(keys) != 3 {
		t.Fatalf("expected 3 unique ability keys, got %d: %+v", len(keys), keys)
	}
}

func TestCatalog_AnnotatedRouteExposesImagesAndResourceTargets(t *testing.T) {
	curation := &config.ModelCurationConfig{
		Models: []config.ModelCurationModelConfig{{
			ModelID:    "nano-banana-pro",
			Capability: "image",
			Operations: []config.ModelCurationOperationConfig{
				{Operation: "generate", Mode: "text-to-image", AbilityKey: "nano_banana_pro", AlgoType: "txt_2_img"},
				{Operation: "generate", Mode: "image-to-image", AbilityKey: "nano_banana_pro", AlgoType: "img_2_img"},
			},
		}},
	}

	annotation := map[string]any{
		"resource": map[string]any{
			"oneOf": []any{
				map[string]any{"key": "image_option.refer_image_urls", "type": "url_array"},
				map[string]any{"key": "resource_url", "type": "url"},
			},
		},
	}
	imageSchema := func(algo string) map[string]any {
		return map[string]any{
			"properties": map[string]any{
				"prompt": map[string]any{"type": "string"},
				"image_option": map[string]any{
					"properties": map[string]any{
						"type":             map[string]any{"type": "string", "enum": []any{algo}},
						"ratio":            map[string]any{"type": "string", "enum": []any{"1:1"}},
						"refer_image_urls": map[string]any{"type": "array"},
					},
				},
			},
		}
	}
	nodes := map[string]*nexushub.DiscoveryNode{
		"nano_banana_pro": {
			AbilityKey: "nano_banana_pro",
			State:      "active",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"txt_2_img": {Schema: imageSchema("txt_2_img")},
				"img_2_img": {Schema: imageSchema("img_2_img"), Annotation: annotation},
			},
		},
	}

	cat := New(fakeCuration{cfg: curation}, &fakeDiscovery{nodes: nodes})
	spec, err := cat.GetModel(context.Background(), model.CapabilityImage, "nano-banana-pro")
	if err != nil {
		t.Fatalf("GetModel error: %v", err)
	}

	gen, ok := spec.Operations[model.OperationGenerate]
	if !ok {
		t.Fatalf("expected generate operation present")
	}

	var t2i, i2i model.RouteBinding
	for _, route := range gen.Routes {
		switch route.Mode {
		case model.ModeTextToImage:
			t2i = route
		case model.ModeImageToImage:
			i2i = route
		}
	}
	if t2i.AbilityKey == "" || i2i.AbilityKey == "" {
		t.Fatalf("expected both modes routed: %+v", gen.Routes)
	}

	// text-to-image has no annotation -> no targets, no synthetic images.
	if t2i.HasReferenceMedia() {
		t.Fatalf("text-to-image route should not declare resource targets: %+v", t2i.ResourceTargets)
	}
	if t2iSchema, ok := gen.ModeSchemas[model.ModeTextToImage]; ok {
		params, _ := t2iSchema["model_params"].(map[string]any)
		if _, exists := params["images"]; exists {
			t.Fatalf("text-to-image schema must not expose images: %+v", params)
		}
	}

	// image-to-image has annotation -> targets propagated, images synthesized.
	wantTargets := []model.ResourceTarget{
		{Key: "image_option.refer_image_urls", Kind: model.ResourceKindURLArray},
		{Key: "resource_url", Kind: model.ResourceKindURL},
	}
	if !reflect.DeepEqual(i2i.ResourceTargets, wantTargets) {
		t.Fatalf("image-to-image targets mismatch:\n got:  %+v\n want: %+v", i2i.ResourceTargets, wantTargets)
	}
	i2iSchema, ok := gen.ModeSchemas[model.ModeImageToImage]
	if !ok {
		t.Fatalf("expected mode schema for image-to-image")
	}
	params, _ := i2iSchema["model_params"].(map[string]any)
	images, ok := params["images"].(map[string]any)
	if !ok {
		t.Fatalf("expected images in image-to-image schema, got %+v", params)
	}
	items, _ := images["items"].(map[string]any)
	if items["format"] != "file-or-url" {
		t.Fatalf("expected images.items.format=file-or-url, got %v", items["format"])
	}
	if _, exists := params["refer_image_urls"]; exists {
		t.Fatalf("wire field refer_image_urls must stay hidden")
	}
}

func TestCatalog_ExposesNanoBananaLite(t *testing.T) {
	curation := &config.ModelCurationConfig{
		Models: []config.ModelCurationModelConfig{{
			ModelID:          "nano-banana-lite",
			Capability:       "image",
			DisplayName:      "Nano Banana 2 Lite",
			ModelDescription: "Lite image model",
			Operations: []config.ModelCurationOperationConfig{
				{Operation: "generate", Mode: "text-to-image", AbilityKey: "nano_banana_lite", AlgoType: "txt_2_img", ModeDescription: "Generate images directly from text prompts."},
				{Operation: "generate", Mode: "image-to-image", AbilityKey: "nano_banana_lite", AlgoType: "img_2_img", ModeDescription: "Edit or transform images using prompts."},
			},
		}},
	}

	imageSchema := func(algo string) map[string]any {
		return map[string]any{
			"properties": map[string]any{
				"prompt": map[string]any{"type": "string"},
				"image_option": map[string]any{
					"properties": map[string]any{
						"type":  map[string]any{"type": "string", "enum": []any{algo}},
						"ratio": map[string]any{"type": "string", "enum": []any{"1:1", "16:9"}},
					},
				},
			},
		}
	}
	nodes := map[string]*nexushub.DiscoveryNode{
		"nano_banana_lite": {
			AbilityKey: "nano_banana_lite",
			State:      "active",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"txt_2_img": {Schema: imageSchema("txt_2_img")},
				"img_2_img": {Schema: imageSchema("img_2_img")},
			},
		},
	}

	cat := New(fakeCuration{cfg: curation}, &fakeDiscovery{nodes: nodes})
	spec, err := cat.GetModel(context.Background(), model.CapabilityImage, "nano-banana-lite")
	if err != nil {
		t.Fatalf("GetModel error: %v", err)
	}
	if spec.DisplayName != "Nano Banana 2 Lite" {
		t.Fatalf("unexpected display name: %s", spec.DisplayName)
	}

	gen, ok := spec.Operations[model.OperationGenerate]
	if !ok {
		t.Fatalf("expected generate operation present")
	}
	if len(gen.Routes) != 2 {
		t.Fatalf("expected two generate routes, got %+v", gen.Routes)
	}
	if len(gen.Modes) != 2 {
		t.Fatalf("expected two generate modes, got %+v", gen.Modes)
	}

	var sawText, sawImage bool
	for _, route := range gen.Routes {
		if route.AbilityKey != "nano_banana_lite" {
			t.Fatalf("unexpected ability key: %+v", route)
		}
		switch route.Mode {
		case model.ModeTextToImage:
			sawText = route.AlgoType == "txt_2_img"
		case model.ModeImageToImage:
			sawImage = route.AlgoType == "img_2_img"
		}
	}
	if !sawText || !sawImage {
		t.Fatalf("expected text-to-image and image-to-image routes, got %+v", gen.Routes)
	}
	if _, ok := gen.ModeSchemas[model.ModeTextToImage]; !ok {
		t.Fatalf("expected text-to-image schema")
	}
	if _, ok := gen.ModeSchemas[model.ModeImageToImage]; !ok {
		t.Fatalf("expected image-to-image schema")
	}
}

func TestCatalog_OverridesVideoReferImagesForSeedanceAndKling(t *testing.T) {
	curation := &config.ModelCurationConfig{
		Models: []config.ModelCurationModelConfig{
			{
				ModelID:    "kling-3.0",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "image-to-video", AbilityKey: "kling-3-0", AlgoType: "img_2_video"},
				},
			},
			{
				ModelID:    "seedance-2",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "image-to-video", AbilityKey: "oversea-seedance-2", AlgoType: "img_2_video"},
				},
			},
			{
				ModelID:    "seedance-2-fast",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "image-to-video", AbilityKey: "ark-doubao-seedance-2-fast", AlgoType: "img_2_video"},
				},
			},
			{
				ModelID:    "hailuo-2.3",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "image-to-video", AbilityKey: "cloudsway_hailuo_2.3", AlgoType: "img_2_video"},
				},
			},
		},
	}

	productionAnnotation := map[string]any{
		"resource": map[string]any{
			"oneOf": []any{
				map[string]any{"key": "resource_url", "type": "url"},
				map[string]any{"key": "resource_path", "type": "storage"},
				map[string]any{"key": "video_option.first_frame_url", "type": "url"},
				map[string]any{"key": "video_option.first_frame_resource_path", "type": "storage"},
			},
		},
	}
	videoSchema := map[string]any{
		"properties": map[string]any{
			"prompt":       map[string]any{"type": "string"},
			"resource_url": map[string]any{"type": "string"},
			"video_option": map[string]any{
				"properties": map[string]any{
					"type":             map[string]any{"type": "string", "enum": []any{"img_2_video"}},
					"duration":         map[string]any{"type": "integer", "enum": []any{5}},
					"refer_image_urls": map[string]any{"type": "array"},
					"refer_video_url":  map[string]any{"type": "string"},
				},
			},
		},
	}
	nodes := map[string]*nexushub.DiscoveryNode{
		"kling-3-0": {
			AbilityKey: "kling-3-0",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"img_2_video": {Schema: videoSchema, Annotation: productionAnnotation},
			},
		},
		"oversea-seedance-2": {
			AbilityKey: "oversea-seedance-2",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"img_2_video": {Schema: videoSchema, Annotation: productionAnnotation},
			},
		},
		"ark-doubao-seedance-2-fast": {
			AbilityKey: "ark-doubao-seedance-2-fast",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"img_2_video": {Schema: videoSchema, Annotation: productionAnnotation},
			},
		},
		"cloudsway_hailuo_2.3": {
			AbilityKey: "cloudsway_hailuo_2.3",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"img_2_video": {Schema: videoSchema, Annotation: productionAnnotation},
			},
		},
	}

	cat := New(fakeCuration{cfg: curation}, &fakeDiscovery{nodes: nodes})

	for _, modelID := range []string{"kling-3.0", "seedance-2", "seedance-2-fast"} {
		spec, err := cat.GetModel(context.Background(), model.CapabilityVideo, modelID)
		if err != nil {
			t.Fatalf("GetModel %s error: %v", modelID, err)
		}
		route := spec.Operations[model.OperationGenerate].Routes[0]
		if len(route.ResourceTargets) == 0 {
			t.Fatalf("expected %s resource targets", modelID)
		}
		if got := route.ResourceTargets[0]; got.Key != "video_option.refer_image_urls" || got.Kind != model.ResourceKindURLArray {
			t.Fatalf("expected %s override to prepend refer_image_urls url_array, got %+v", modelID, route.ResourceTargets)
		}
		if !hasResourceTarget(route.ResourceTargets, "video_option.refer_video_url", model.ResourceKindURL) {
			t.Fatalf("expected %s override to include refer_video_url target, got %+v", modelID, route.ResourceTargets)
		}
		modeSchema := spec.Operations[model.OperationGenerate].ModeSchemas[model.ModeImageToVideo]
		params, _ := modeSchema["model_params"].(map[string]any)
		images, _ := params["images"].(map[string]any)
		if images == nil {
			t.Fatalf("expected %s schema to expose synthetic images, got %+v", modelID, params)
		}
		if images["maxItems"] != 9 {
			t.Fatalf("expected %s images.maxItems=9, got %v", modelID, images["maxItems"])
		}
		videos, _ := params["videos"].(map[string]any)
		if videos == nil {
			t.Fatalf("expected %s schema to expose synthetic videos, got %+v", modelID, params)
		}
		if videos["maxItems"] != 3 {
			t.Fatalf("expected %s videos.maxItems=3, got %v", modelID, videos["maxItems"])
		}
	}

	hailuo, err := cat.GetModel(context.Background(), model.CapabilityVideo, "hailuo-2.3")
	if err != nil {
		t.Fatalf("GetModel hailuo error: %v", err)
	}
	hailuoRoute := hailuo.Operations[model.OperationGenerate].Routes[0]
	if got := hailuoRoute.ResourceTargets[0]; got.Key != "resource_url" || got.Kind != model.ResourceKindURL {
		t.Fatalf("non-overridden model should preserve production annotation order, got %+v", hailuoRoute.ResourceTargets)
	}
}

func TestCatalog_OverridesSeedance2Resolution1080p(t *testing.T) {
	curation := &config.ModelCurationConfig{
		Models: []config.ModelCurationModelConfig{
			{
				ModelID:    "seedance-2",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "text-to-video", AbilityKey: "oversea-seedance-2", AlgoType: "txt_2_video"},
					{Operation: "generate", Mode: "image-to-video", AbilityKey: "oversea-seedance-2", AlgoType: "img_2_video"},
				},
			},
			{
				ModelID:    "seedance-2-fast",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "text-to-video", AbilityKey: "ark-doubao-seedance-2-fast", AlgoType: "txt_2_video"},
					{Operation: "generate", Mode: "image-to-video", AbilityKey: "ark-doubao-seedance-2-fast", AlgoType: "img_2_video"},
				},
			},
		},
	}

	videoSchema := func(algo string) map[string]any {
		return map[string]any{
			"properties": map[string]any{
				"prompt": map[string]any{"type": "string"},
				"video_option": map[string]any{
					"properties": map[string]any{
						"type":       map[string]any{"type": "string", "enum": []any{algo}},
						"resolution": map[string]any{"type": "string", "enum": []any{"480p", "720p"}},
					},
				},
			},
		}
	}
	nodes := map[string]*nexushub.DiscoveryNode{
		"oversea-seedance-2": {
			AbilityKey: "oversea-seedance-2",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"txt_2_video": {Schema: videoSchema("txt_2_video")},
				"img_2_video": {Schema: videoSchema("img_2_video")},
			},
		},
		"ark-doubao-seedance-2-fast": {
			AbilityKey: "ark-doubao-seedance-2-fast",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"txt_2_video": {Schema: videoSchema("txt_2_video")},
				"img_2_video": {Schema: videoSchema("img_2_video")},
			},
		},
	}

	cat := New(fakeCuration{cfg: curation}, &fakeDiscovery{nodes: nodes})

	for _, tc := range []struct {
		modelID       string
		mode          model.Mode
		expect1080p   bool
		assertMessage string
	}{
		{modelID: "seedance-2", mode: model.ModeTextToVideo, expect1080p: true, assertMessage: "to include"},
		{modelID: "seedance-2", mode: model.ModeImageToVideo, expect1080p: true, assertMessage: "to include"},
		{modelID: "seedance-2-fast", mode: model.ModeTextToVideo, assertMessage: "not to include"},
		{modelID: "seedance-2-fast", mode: model.ModeImageToVideo, assertMessage: "not to include"},
	} {
		spec, err := cat.GetModel(context.Background(), model.CapabilityVideo, tc.modelID)
		if err != nil {
			t.Fatalf("GetModel %s error: %v", tc.modelID, err)
		}
		modeSchema := spec.Operations[model.OperationGenerate].ModeSchemas[tc.mode]
		params, _ := modeSchema["model_params"].(map[string]any)
		resolution, _ := params["resolution"].(map[string]any)
		has1080p := enumContains(resolution["enum"], "1080p")
		if has1080p != tc.expect1080p {
			t.Fatalf("expected %s %s resolution enum %s 1080p, got %+v", tc.modelID, tc.mode, tc.assertMessage, resolution["enum"])
		}
	}
}

func TestCatalog_ExposesSeedanceMultiModalReferenceVideo(t *testing.T) {
	curation := &config.ModelCurationConfig{
		Models: []config.ModelCurationModelConfig{
			{
				ModelID:    "seedance-2",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "multi-modal-reference", AbilityKey: "oversea-seedance-2", AlgoType: "multi_modal_ref_2_video"},
				},
			},
			{
				ModelID:    "seedance-2-fast",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "multi-modal-reference", AbilityKey: "ark-doubao-seedance-2-fast", AlgoType: "multi_modal_ref_2_video"},
				},
			},
		},
	}
	multiModalSchema := map[string]any{
		"properties": map[string]any{
			"prompt": map[string]any{"type": "string"},
			"video_option": map[string]any{
				"properties": map[string]any{
					"type":                      map[string]any{"type": "string", "enum": []any{"multi_modal_ref_2_video"}},
					"duration":                  map[string]any{"type": "integer", "enum": []any{4, 5, 6}},
					"ratio":                     map[string]any{"type": "string", "enum": []any{"9:16", "16:9"}},
					"resolution":                map[string]any{"type": "string", "enum": []any{"480p", "720p"}},
					"refer_image_resource_path": map[string]any{"type": "array"},
					"refer_image_urls":          map[string]any{"type": "array"},
					"refer_video_urls":          map[string]any{"type": "array"},
					"refer_audio_urls":          map[string]any{"type": "array"},
				},
			},
		},
	}
	nodes := map[string]*nexushub.DiscoveryNode{
		"oversea-seedance-2": {
			AbilityKey: "oversea-seedance-2",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"multi_modal_ref_2_video": {Schema: multiModalSchema, Annotation: map[string]any{}},
			},
		},
		"ark-doubao-seedance-2-fast": {
			AbilityKey: "ark-doubao-seedance-2-fast",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"multi_modal_ref_2_video": {Schema: multiModalSchema, Annotation: map[string]any{}},
			},
		},
	}
	cat := New(fakeCuration{cfg: curation}, &fakeDiscovery{nodes: nodes})

	for _, modelID := range []string{"seedance-2", "seedance-2-fast"} {
		spec, err := cat.GetModel(context.Background(), model.CapabilityVideo, modelID)
		if err != nil {
			t.Fatalf("GetModel %s error: %v", modelID, err)
		}
		route := spec.Operations[model.OperationGenerate].Routes[0]
		if route.Mode != model.ModeMultiModalRef || route.AlgoType != "multi_modal_ref_2_video" {
			t.Fatalf("expected multi-modal route for %s, got %+v", modelID, route)
		}
		for _, target := range []model.ResourceTarget{
			{Key: "video_option.refer_image_urls", Kind: model.ResourceKindURLArray},
			{Key: "video_option.refer_video_urls", Kind: model.ResourceKindURLArray},
			{Key: "video_option.refer_audio_urls", Kind: model.ResourceKindURLArray},
		} {
			if !hasResourceTarget(route.ResourceTargets, target.Key, target.Kind) {
				t.Fatalf("expected %s route to include target %+v, got %+v", modelID, target, route.ResourceTargets)
			}
		}
		modeSchema := spec.Operations[model.OperationGenerate].ModeSchemas[model.ModeMultiModalRef]
		params, _ := modeSchema["model_params"].(map[string]any)
		for key, maxItems := range map[string]any{"images": 9, "videos": 3, "audios": 3} {
			field, _ := params[key].(map[string]any)
			if field == nil || field["maxItems"] != maxItems {
				t.Fatalf("expected %s %s maxItems=%v, got %+v", modelID, key, maxItems, field)
			}
		}
		for _, wireKey := range []string{"refer_image_urls", "refer_video_urls", "refer_audio_urls"} {
			if _, exists := params[wireKey]; exists {
				t.Fatalf("wire field %s must stay hidden in %s schema: %+v", wireKey, modelID, params)
			}
		}
	}
}

func TestCatalog_ExposesKlingMultiShotVideo(t *testing.T) {
	curation := &config.ModelCurationConfig{
		Models: []config.ModelCurationModelConfig{
			{
				ModelID:    "kling-3.0",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "multi-shot-video", AbilityKey: "kling-3-0", AlgoType: "multi_shot_video"},
				},
			},
			{
				ModelID:    "kling-3.0-omni",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "multi-shot-video", AbilityKey: "tengda_kling_3.0_omni", AlgoType: "multi_shot_video"},
				},
			},
		},
	}
	multiShotSchema := map[string]any{
		"properties": map[string]any{
			"prompt": map[string]any{"type": "string"},
			"video_option": map[string]any{
				"properties": map[string]any{
					"type": map[string]any{"type": "string", "enum": []any{"multi_shot_video"}},
					"duration": map[string]any{
						"type": "integer",
						"enum": []any{3, 4, 5},
					},
					"multi_shot_clips": map[string]any{
						"type": "array",
						"items": map[string]any{
							"type": "object",
							"properties": map[string]any{
								"prompt":   map[string]any{"type": "string"},
								"duration": map[string]any{"type": "integer", "minimum": 1},
								"index":    map[string]any{"type": "integer"},
							},
						},
					},
					"ratio": map[string]any{"type": "string"},
				},
			},
		},
	}
	nodes := map[string]*nexushub.DiscoveryNode{
		"kling-3-0": {
			AbilityKey: "kling-3-0",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"multi_shot_video": {Schema: multiShotSchema, Annotation: map[string]any{}},
			},
		},
		"tengda_kling_3.0_omni": {
			AbilityKey: "tengda_kling_3.0_omni",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"multi_shot_video": {Schema: multiShotSchema, Annotation: map[string]any{}},
			},
		},
	}
	cat := New(fakeCuration{cfg: curation}, &fakeDiscovery{nodes: nodes})

	for _, modelID := range []string{"kling-3.0", "kling-3.0-omni"} {
		spec, err := cat.GetModel(context.Background(), model.CapabilityVideo, modelID)
		if err != nil {
			t.Fatalf("GetModel %s error: %v", modelID, err)
		}
		route := spec.Operations[model.OperationGenerate].Routes[0]
		if route.Mode != model.ModeMultiShotVideo || route.AlgoType != "multi_shot_video" {
			t.Fatalf("expected multi-shot route for %s, got %+v", modelID, route)
		}
		if !hasResourceTarget(route.ResourceTargets, "video_option.refer_image_urls", model.ResourceKindURLArray) {
			t.Fatalf("expected %s multi-shot route to accept reference images, got %+v", modelID, route.ResourceTargets)
		}
		modeSchema := spec.Operations[model.OperationGenerate].ModeSchemas[model.ModeMultiShotVideo]
		params, _ := modeSchema["model_params"].(map[string]any)
		if _, ok := params["multi_shot_clips"].(map[string]any); !ok {
			t.Fatalf("expected %s schema to expose multi_shot_clips, got %+v", modelID, params)
		}
		images, _ := params["images"].(map[string]any)
		if images == nil || images["maxItems"] != 9 {
			t.Fatalf("expected %s schema images maxItems=9, got %+v", modelID, images)
		}
	}
}

func TestCatalog_ExposesGeminiOmniFlashEditVideo(t *testing.T) {
	curation := &config.ModelCurationConfig{
		Models: []config.ModelCurationModelConfig{
			{
				ModelID:    "gemini-omni-flash-preview",
				Capability: "video",
				Operations: []config.ModelCurationOperationConfig{
					{Operation: "generate", Mode: "edit-video", AbilityKey: "gemini-omni-flash-preview", AlgoType: "edit_video"},
				},
			},
		},
	}
	editVideoSchema := map[string]any{
		"properties": map[string]any{
			"prompt":       map[string]any{"type": "string"},
			"resource_url": map[string]any{"type": "string"},
			"video_option": map[string]any{
				"properties": map[string]any{
					"type": map[string]any{"type": "string", "enum": []any{"edit_video"}},
				},
			},
		},
	}
	editVideoAnnotation := map[string]any{
		"video_resource": map[string]any{
			"description": "Input video resource for video editing.",
			"oneOf": []any{
				map[string]any{"description": "Input video URL.", "key": "resource_url", "type": "url"},
				map[string]any{"description": "Stored input video resource path.", "key": "resource_path", "type": "storage"},
			},
		},
	}
	nodes := map[string]*nexushub.DiscoveryNode{
		"gemini-omni-flash-preview": {
			AbilityKey: "gemini-omni-flash-preview",
			ToolDefinition: map[string]nexushub.DiscoveryToolDefEntry{
				"edit_video": {Schema: editVideoSchema, Annotation: editVideoAnnotation},
			},
		},
	}
	cat := New(fakeCuration{cfg: curation}, &fakeDiscovery{nodes: nodes})

	spec, err := cat.GetModel(context.Background(), model.CapabilityVideo, "gemini-omni-flash-preview")
	if err != nil {
		t.Fatalf("GetModel error: %v", err)
	}
	route := spec.Operations[model.OperationGenerate].Routes[0]
	if route.Mode != model.ModeEditVideo || route.AlgoType != "edit_video" {
		t.Fatalf("expected edit-video route, got %+v", route)
	}
	if !hasResourceTarget(route.ResourceTargets, "resource_url", model.ResourceKindURL) {
		t.Fatalf("expected route to include resource_url target, got %+v", route.ResourceTargets)
	}
	for _, target := range route.ResourceTargets {
		if target.Key == "resource_url" && target.Media != model.ResourceMediaVideo {
			t.Fatalf("expected resource_url target media=video, got %+v", target)
		}
	}
	modeSchema := spec.Operations[model.OperationGenerate].ModeSchemas[model.ModeEditVideo]
	params, _ := modeSchema["model_params"].(map[string]any)
	videos, _ := params["videos"].(map[string]any)
	if videos == nil {
		t.Fatalf("expected schema to expose synthetic videos param, got %+v", params)
	}
	if _, exists := params["images"]; exists {
		t.Fatalf("edit-video schema must not expose images param when only a video input is declared: %+v", params)
	}
	if _, exists := params["resource_url"]; exists {
		t.Fatalf("wire field resource_url must stay hidden: %+v", params)
	}
}

func enumContains(raw any, want string) bool {
	items, ok := raw.([]any)
	if !ok {
		return false
	}
	for _, item := range items {
		if item == want {
			return true
		}
	}
	return false
}
