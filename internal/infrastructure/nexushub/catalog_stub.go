package nexushub

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// CatalogStub 是 CatalogRepository 的空实现，仅用于单元测试。
// 生产环境必须配置 NEXUSHUB_BASE_URL 使用 PlatformClient。
type CatalogStub struct {
	models []model.ModelSpec
}

// NewCatalogStub 返回空的 CatalogStub（无预置数据）。
func NewCatalogStub() *CatalogStub {
	return &CatalogStub{}
}

// NewCatalogStubWith 返回携带指定数据的 CatalogStub，供测试用。
func NewCatalogStubWith(models []model.ModelSpec) *CatalogStub {
	return &CatalogStub{models: models}
}

func (s *CatalogStub) ListModels(_ context.Context, capability model.Capability) ([]model.ModelSpec, error) {
	var result []model.ModelSpec
	for i := range s.models {
		if s.models[i].Capability == capability {
			result = append(result, s.models[i])
		}
	}
	return result, nil
}

func (s *CatalogStub) GetModel(_ context.Context, capability model.Capability, modelID string) (*model.ModelSpec, error) {
	for i := range s.models {
		if s.models[i].Capability == capability && s.models[i].ModelID == modelID {
			return &s.models[i], nil
		}
	}
	return nil, fmt.Errorf("model %q not found in capability %s", modelID, capability)
}
