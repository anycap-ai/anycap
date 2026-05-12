// Package curatedcatalog turns a curated list of public model entries
// (from internal/config) into a model.ModelSpec graph by joining each
// curation row with the live NexusHub Discovery snapshot for the underlying
// atomic node. The result satisfies port.CatalogRepository.
//
// This implementation never depends on Postgres anycap_model_routes. The
// curated list is the single source of truth for which models the CLI sees;
// Discovery only contributes runtime metadata: schema, descriptions, pricing.
package curatedcatalog

import (
	_ "embed"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
)

// defaultCurationJSON ships with the binary so AnyCap can run with no dconf
// or external file. It is generated from the historical curated CSV.
//
//go:embed default_curation.json
var defaultCurationJSON []byte

func init() {
	var cfg config.ModelCurationConfig
	if err := json.Unmarshal(defaultCurationJSON, &cfg); err != nil {
		// The embedded asset is checked into the repo; an error here is a
		// build-time bug we want to surface loudly.
		panic("curatedcatalog: invalid embedded default_curation.json: " + err.Error())
	}
	config.SetEmbeddedModelCurationDefault(&cfg)
}
