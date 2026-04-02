package port

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// StorageQuotaProvider resolves quota limits for a user.
// Implementations: DConfStorageQuotaProvider (prod), StaticStorageQuotaProvider (stub/test).
// The principal parameter is reserved for future tier-based quota lookup.
// For the preview period, all implementations ignore it and return uniform limits.
type StorageQuotaProvider interface {
	ResolveQuota(principal *model.Principal) model.StorageQuota
}
