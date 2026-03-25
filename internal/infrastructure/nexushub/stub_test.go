package nexushub

import (
	"context"
	"testing"
)

func TestStub_ListImageModels(t *testing.T) {
	client := NewStubClient()

	models, err := client.ListImageModels(context.Background())
	if err != nil {
		t.Fatalf("ListImageModels() error = %v", err)
	}
	if len(models) == 0 {
		t.Fatal("expected image models")
	}
}

func TestStub_GetImageModelSchema(t *testing.T) {
	client := NewStubClient()

	schema, err := client.GetImageModelSchema(context.Background(), "flux-dev")
	if err != nil {
		t.Fatalf("GetImageModelSchema() error = %v", err)
	}

	properties, ok := schema["properties"].(map[string]any)
	if !ok {
		t.Fatalf("expected schema properties, got %#v", schema)
	}
	if _, ok := properties["prompt"]; !ok {
		t.Fatalf("expected prompt field in schema, got %#v", properties)
	}
}
