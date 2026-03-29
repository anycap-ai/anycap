package handlers

import (
	"fmt"
	"strconv"
	"strings"
)

func ParsePathID(raw string) (int64, error) {
	id, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || id <= 0 {
		return 0, fmt.Errorf("id must be a positive integer")
	}
	return id, nil
}

func ContainsAny(input string, keywords ...string) bool {
	for _, keyword := range keywords {
		if keyword != "" && input != "" && strings.Contains(input, keyword) {
			return true
		}
	}
	return false
}
