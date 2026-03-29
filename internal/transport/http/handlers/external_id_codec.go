package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
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
	if err := json.Unmarshal(raw, &idString); err == nil {
		idString = strings.TrimSpace(idString)
		if idString == "" {
			return nil, nil
		}
		return &idString, nil
	}

	var idNumber int64
	if err := json.Unmarshal(raw, &idNumber); err == nil {
		if idNumber <= 0 {
			return nil, fmt.Errorf("id must be a positive integer")
		}
		idText := strconv.FormatInt(idNumber, 10)
		return &idText, nil
	}

	return nil, fmt.Errorf("id must be string, number, or null")
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
