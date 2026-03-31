package nexushub

import (
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestNodeToModelSpec_ImageModesGroupedUnderGenerate(t *testing.T) {
	node := &atomicNodeDTO{
		AbilityKey:   "google_nano_banana_2",
		Name:         "Nano Banana 2",
		Description:  "google nano banana 2 model",
		State:        atomicNodeStateActive,
		Category:     "image",
		BaseModel:    "nano_banana_2",
		Region:       "global",
		Capabilities: &nodeCapabilitiesDTO{Image: &imageCapabilitiesDTO{SupportsText2Img: true, SupportsImg2Img: true}},
	}

	spec := nodeToModelSpec(node, model.CapabilityImage)
	if spec == nil {
		t.Fatal("nodeToModelSpec() = nil")
	}
	if spec.ModelID != "nano_banana_2" {
		t.Fatalf("ModelID = %q, want %q", spec.ModelID, "nano_banana_2")
	}
	if spec.DisplayName != "Nano Banana 2" {
		t.Fatalf("DisplayName = %q, want %q", spec.DisplayName, "Nano Banana 2")
	}
	if spec.ModelDescription != "google nano banana 2 model" {
		t.Fatalf("ModelDescription = %q, want %q", spec.ModelDescription, "google nano banana 2 model")
	}

	generate, ok := spec.Operations[model.OperationGenerate]
	if !ok {
		t.Fatalf("expected %q operation, got %#v", model.OperationGenerate, spec.Operations)
	}
	if len(generate.Modes) != 2 {
		t.Fatalf("len(generate.Modes) = %d, want %d", len(generate.Modes), 2)
	}
	if generate.Modes[0].Mode != model.ModeTextToImage || generate.Modes[0].Description != "Text to Image" {
		t.Fatalf("first mode = %#v, want text-to-image / Text to Image", generate.Modes[0])
	}
	if generate.Modes[1].Mode != model.ModeImageToImage || generate.Modes[1].Description != "Image to Image" {
		t.Fatalf("second mode = %#v, want image-to-image / Image to Image", generate.Modes[1])
	}
	if len(generate.Routes) != 2 {
		t.Fatalf("len(generate.Routes) = %d, want %d", len(generate.Routes), 2)
	}
	if generate.Routes[0].AlgoType != "txt_2_img" || generate.Routes[0].Mode != model.ModeTextToImage {
		t.Fatalf("first route = %#v, want txt_2_img / text-to-image", generate.Routes[0])
	}
	if generate.Routes[1].AlgoType != "img_2_img" || generate.Routes[1].Mode != model.ModeImageToImage {
		t.Fatalf("second route = %#v, want img_2_img / image-to-image", generate.Routes[1])
	}
}

func TestNodeToModelSpec_VideoModesGroupedUnderGenerate(t *testing.T) {
	node := &atomicNodeDTO{
		AbilityKey: "veo_3_1",
		State:      atomicNodeStateActive,
		Category:   "video",
		BaseModel:  "veo-3.1",
		Capabilities: &nodeCapabilitiesDTO{Video: &videoCapabilitiesDTO{
			SupportsText2Video: true,
			SupportsImg2Video:  true,
		}},
	}

	spec := nodeToModelSpec(node, model.CapabilityVideo)
	if spec == nil {
		t.Fatal("nodeToModelSpec() = nil")
	}

	generate, ok := spec.Operations[model.OperationGenerate]
	if !ok {
		t.Fatalf("expected %q operation, got %#v", model.OperationGenerate, spec.Operations)
	}
	if len(generate.Modes) != 2 {
		t.Fatalf("len(generate.Modes) = %d, want %d", len(generate.Modes), 2)
	}
	if generate.Modes[0].Mode != model.ModeTextToVideo || generate.Modes[1].Mode != model.ModeImageToVideo {
		t.Fatalf("unexpected modes: %#v", generate.Modes)
	}
	if len(generate.Routes) != 2 {
		t.Fatalf("len(generate.Routes) = %d, want %d", len(generate.Routes), 2)
	}
	if generate.Routes[0].AlgoType != "txt_2_video" || generate.Routes[1].AlgoType != "img_2_video" {
		t.Fatalf("unexpected routes: %#v", generate.Routes)
	}
}
