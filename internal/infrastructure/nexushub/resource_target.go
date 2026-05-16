package nexushub

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"
)

// applyResourceTargets writes resolved reference URLs into the right
// upstream payload slot, picking the first ResourceTarget whose Kind
// matches a URL list. AnyCap currently only resolves user-supplied
// references to URLs (presigned http(s)), never to storage paths, so
// only url and url_array kinds are honored here. storage and
// storage_array are present in NexusHub annotations for completeness;
// they are reserved for a future flow that lets clients reference cu_*
// objects directly without presign.
//
// urls == nil and len(urls) == 0 are treated as "nothing to set" and
// the payload is returned untouched. When the route declares targets
// but no known key matches, the URLs are dropped and a warning is
// logged: silent success on a route that lost its annotation key would
// mask a real upstream change.
func applyResourceTargets(
	ctx context.Context,
	payload *atomicProcessPayload,
	abilityKey string,
	targets []model.ResourceTarget,
	urls []string,
) {
	if payload == nil || len(urls) == 0 {
		return
	}
	if len(targets) == 0 {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"ability_key":     abilityKey,
			"reference_count": len(urls),
		}).Warn("nexushub: route has no resource targets; reference urls dropped")
		return
	}

	for _, t := range targets {
		switch t.Kind {
		case model.ResourceKindURLArray:
			if writeURLArrayTarget(payload, t.Key, urls) {
				return
			}
		case model.ResourceKindURL:
			if writeURLTarget(payload, t.Key, urls[0]) {
				return
			}
		}
	}

	logging.WithContext(ctx).WithFields(logging.Fields{
		"ability_key":     abilityKey,
		"reference_count": len(urls),
		"targets":         targets,
	}).Warn("nexushub: no resource target accepted reference urls; dropped")
}

// writeURLArrayTarget writes urls into the named slot. Returns true on
// success; returns false (without mutating) when the key is unknown.
//
// Keep this switch in sync with annotation-driven NexusHub keys; a key
// absent from the switch cannot route reference media even if
// Discovery declares it.
func writeURLArrayTarget(payload *atomicProcessPayload, key string, urls []string) bool {
	switch key {
	case "image_option.refer_image_urls":
		opt := ensureImageOption(payload)
		opt.ReferImageURLs = append(opt.ReferImageURLs[:0], urls...)
		return true
	default:
		return false
	}
}

// writeURLTarget writes a single url into the named slot. Returns true
// on success; returns false (without mutating) when the key is unknown.
//
// Keep this switch in sync with annotation-driven NexusHub keys.
func writeURLTarget(payload *atomicProcessPayload, key, url string) bool {
	switch key {
	case "resource_url":
		payload.ResourceURL = url
		return true
	default:
		return false
	}
}

// ensureImageOption guarantees payload.ImageOption is non-nil. Used by
// the resource-target writers so callers do not have to repeat the
// nil-check at every site.
func ensureImageOption(payload *atomicProcessPayload) *atomicImageOption {
	if payload.ImageOption == nil {
		payload.ImageOption = &atomicImageOption{}
	}
	return payload.ImageOption
}
