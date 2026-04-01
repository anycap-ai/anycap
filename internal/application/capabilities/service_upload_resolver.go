package capabilities

import (
	"context"
	"slices"
)

// ResolveReferenceURLs resolves anycap://upload/ references in the given URL
// list to presigned HTTP URLs. Non-upload URLs are passed through unchanged.
// When audit is disabled (stub mode), all URLs are returned as-is.
func (s *Service) ResolveReferenceURLs(ctx context.Context, urls []string) ([]string, error) {
	if len(urls) == 0 {
		return urls, nil
	}
	if !s.auditEnabled() {
		return urls, nil
	}

	// Quick check: skip if no URLs need resolution.
	if !slices.ContainsFunc(urls, looksLikeAnyCapRef) {
		return urls, nil
	}

	actor, err := s.resolveActor(ctx)
	if err != nil {
		return nil, err
	}

	resolved := make([]string, len(urls))
	for i, u := range urls {
		resolvedURL, _, err := s.resolveInputURL(ctx, actor.Space.ID, actor.UserID, u)
		if err != nil {
			return nil, err
		}
		resolved[i] = resolvedURL
	}
	return resolved, nil
}
