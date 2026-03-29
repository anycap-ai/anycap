package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

func parseOptionalIDRaw(raw json.RawMessage) (*string, error) {
	if len(raw) == 0 {
		return nil, nil
	}
	if string(raw) == "null" {
		return nil, nil
	}

	var idString string
	if err := json.Unmarshal(raw, &idString); err != nil {
		return nil, fmt.Errorf("id must be a string or null")
	}
	idString = strings.TrimSpace(idString)
	if idString == "" {
		return nil, nil
	}
	return &idString, nil
}

func parseRequiredIDRaw(raw json.RawMessage, fieldName string) (string, error) {
	value, err := parseOptionalIDRaw(raw)
	if err != nil {
		return "", fmt.Errorf("%s: %w", fieldName, err)
	}
	if value == nil || strings.TrimSpace(*value) == "" {
		return "", fmt.Errorf("%s is required", fieldName)
	}
	return strings.TrimSpace(*value), nil
}

func isExternalIDInvalidError(err error) bool {
	return errors.Is(err, ErrExternalIDInvalid)
}

func isExternalIDNotFoundError(err error) bool {
	return errors.Is(err, ErrExternalIDNotFound)
}
