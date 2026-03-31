package security

import (
	"regexp"
	"testing"
)

func TestGeneratePrefixedToken(t *testing.T) {
	token, err := GeneratePrefixedToken("drvacc_", 27)
	if err != nil {
		t.Fatalf("GeneratePrefixedToken() error = %v", err)
	}
	if len(token) != len("drvacc_")+27 {
		t.Fatalf("expected token length %d, got %d", len("drvacc_")+27, len(token))
	}

	matched, err := regexp.MatchString(`^drvacc_[0-9A-Za-z]{27}$`, token)
	if err != nil {
		t.Fatalf("regexp error: %v", err)
	}
	if !matched {
		t.Fatalf("unexpected token format: %q", token)
	}
}

func TestGeneratePrefixedToken_RejectsInvalidInput(t *testing.T) {
	if _, err := GeneratePrefixedToken("", 16); err == nil {
		t.Fatal("expected error for empty prefix")
	}
	if _, err := GeneratePrefixedToken("x_", 0); err == nil {
		t.Fatal("expected error for non-positive body length")
	}
}
