package middleware

import "testing"

func TestIsModelInvocationCapabilityIncludesAudioGenerate(t *testing.T) {
	if !isModelInvocationCapability("audio.generate") {
		t.Fatal("audio.generate must receive invocation diagnostics")
	}
	if isModelInvocationCapability("audio.models") {
		t.Fatal("audio.models must not be treated as a provider invocation")
	}
}
