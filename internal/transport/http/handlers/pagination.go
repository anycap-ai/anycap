package handlers

import "strconv"

const (
	DefaultLimit = 50
	MaxLimit     = 200
)

// ParseLimitOffset extracts limit and offset from query params with defaults.
func ParseLimitOffset(rawLimit, rawOffset string) (limit, offset int) {
	limit = DefaultLimit
	if v, err := strconv.Atoi(rawLimit); err == nil && v > 0 {
		limit = v
	}
	if limit > MaxLimit {
		limit = MaxLimit
	}

	offset = 0
	if v, err := strconv.Atoi(rawOffset); err == nil && v >= 0 {
		offset = v
	}
	return limit, offset
}
