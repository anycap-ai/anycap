package config

import (
	"os"
	"path/filepath"
	"testing"
)

type fakeModelCurationContainer struct {
	current *ModelCurationConfig
}

func (f fakeModelCurationContainer) Get() *ModelCurationConfig { return f.current }

func TestModelCurationProvider_PrefersDConfWhenContainerHasValue(t *testing.T) {
	embedded := &ModelCurationConfig{Models: []ModelCurationModelConfig{{ModelID: "embedded"}}}
	dconfCfg := &ModelCurationConfig{Models: []ModelCurationModelConfig{{ModelID: "dconf"}}}

	p := NewModelCurationProviderWithContainer(Config{}, fakeModelCurationContainer{current: dconfCfg}, embedded)
	snap := p.Snapshot()
	if snap == nil || len(snap.Models) != 1 || snap.Models[0].ModelID != "dconf" {
		t.Fatalf("expected dconf snapshot, got %+v", snap)
	}
	if got := p.Source(); got != "dconf" {
		t.Fatalf("expected source dconf, got %q", got)
	}
}

func TestModelCurationProvider_FallsBackToEmbeddedWhenContainerEmpty(t *testing.T) {
	embedded := &ModelCurationConfig{Models: []ModelCurationModelConfig{{ModelID: "embedded"}}}
	p := NewModelCurationProviderWithContainer(Config{}, nil, embedded)
	snap := p.Snapshot()
	if snap == nil || len(snap.Models) != 1 || snap.Models[0].ModelID != "embedded" {
		t.Fatalf("expected embedded snapshot, got %+v", snap)
	}
	if got := p.Source(); got != "embedded" {
		t.Fatalf("expected source embedded, got %q", got)
	}
}

func TestModelCurationProvider_FileOverrideTakesEffect(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "curation.json")
	if err := os.WriteFile(path, []byte(`{"models":[{"model_id":"file","capability":"image"}]}`), 0o600); err != nil {
		t.Fatal(err)
	}

	originalLoader := loadModelCurationContainer
	t.Cleanup(func() { loadModelCurationContainer = originalLoader })
	loadModelCurationContainer = func(Config) (ModelCurationContainer, error) {
		t.Fatal("dconf loader should not be called when dconf disabled")
		return nil, nil
	}

	embedded := &ModelCurationConfig{Models: []ModelCurationModelConfig{{ModelID: "embedded"}}}
	SetEmbeddedModelCurationDefault(embedded)
	t.Cleanup(func() { SetEmbeddedModelCurationDefault(nil) })

	p := NewModelCurationProvider(Config{ModelCurationFile: path})
	snap := p.Snapshot()
	if snap == nil || len(snap.Models) != 1 || snap.Models[0].ModelID != "file" {
		t.Fatalf("expected file snapshot, got %+v", snap)
	}
}

func TestModelCurationProvider_DConfLoadFailureFallsThrough(t *testing.T) {
	originalLoader := loadModelCurationContainer
	t.Cleanup(func() { loadModelCurationContainer = originalLoader })
	loadModelCurationContainer = func(Config) (ModelCurationContainer, error) {
		return nil, os.ErrNotExist
	}

	embedded := &ModelCurationConfig{Models: []ModelCurationModelConfig{{ModelID: "embedded"}}}
	SetEmbeddedModelCurationDefault(embedded)
	t.Cleanup(func() { SetEmbeddedModelCurationDefault(nil) })

	p := NewModelCurationProvider(Config{ModelCurationDConfEnabled: true})
	snap := p.Snapshot()
	if snap == nil || len(snap.Models) != 1 || snap.Models[0].ModelID != "embedded" {
		t.Fatalf("expected embedded snapshot, got %+v", snap)
	}
	if p.Source() != "embedded" {
		t.Fatalf("expected source embedded, got %q", p.Source())
	}
}
