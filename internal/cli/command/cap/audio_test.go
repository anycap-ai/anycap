package cap

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

func TestParseAndWriteAudioResponsePreservesMetadata(t *testing.T) {
	body := []byte(`{"status":"success","data":{"id":"audio_data","model":"doubao-seed-audio-1-0","outputs":[{"type":"audio","url":"https://cdn.test/output.mp3","mime_type":"audio/mpeg","duration_seconds":10.5,"original_duration_seconds":11,"size_bytes":84524,"subtitle":{"segments":[{"text":"wind"}]}}],"usage":{"audio_second":10.5},"credit_cost":2},"diagnostics":{"trace_id":"trc_1","task_id":"audio_diag","stage":"decode_result"}}`)
	result, err := parseAudioResponse(body)
	if err != nil {
		t.Fatal(err)
	}
	if result.TaskID != "audio_diag" || len(result.Outputs) != 1 {
		t.Fatalf("result = %+v", result)
	}
	output := result.Outputs[0]
	if output.DurationSeconds != 10.5 || output.OriginalDurationSeconds != 11 || output.SizeBytes != 84524 || string(output.Subtitle) != `{"segments":[{"text":"wind"}]}` {
		t.Fatalf("audio metadata was not parsed: %+v", output)
	}

	var stdout bytes.Buffer
	if err := writeAudioResult(&stdout, result, "header_request"); err != nil {
		t.Fatal(err)
	}
	var written map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &written); err != nil {
		t.Fatal(err)
	}
	writtenOutputs, _ := written["outputs"].([]any)
	writtenOutput, _ := writtenOutputs[0].(map[string]any)
	if written["task_id"] != "audio_diag" || writtenOutput["duration_seconds"] != 10.5 || writtenOutput["size_bytes"] != float64(84524) {
		t.Fatalf("written result lost metadata: %+v", written)
	}
}

func TestAudioGenerateUsesSchemaResolutionAndDownloadsOutput(t *testing.T) {
	var requestBody map[string]any
	referencePath := filepath.Join(t.TempDir(), "reference.wav")
	if err := os.WriteFile(referencePath, []byte("reference-audio"), 0o600); err != nil {
		t.Fatal(err)
	}
	presignCalls := 0
	mux := http.NewServeMux()
	mux.HandleFunc("GET /v1/audio/models/doubao-seed-audio-1-0/schema", func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status": "success",
			"schemas": []map[string]any{{
				"operation": "generate", "mode": "audio-to-audio",
				"schema": map[string]any{"model_params": map[string]any{
					"audios": map[string]any{"type": "array", "items": map[string]any{"type": "string", "format": "file-or-url"}},
				}},
			}},
		})
	})
	mux.HandleFunc("POST /v1/capabilities/presign", func(w http.ResponseWriter, _ *http.Request) {
		presignCalls++
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status": "success",
			"data": map[string]any{
				"object_url": "anycap://upload/cu_A1b2C3d4E5f6G7h8", "reused": true,
			},
		})
	})
	mux.HandleFunc("POST /v1/audio/generate", func(w http.ResponseWriter, r *http.Request) {
		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		outputURL := "http://" + r.Host + "/generated/output.mp3"
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status": "success",
			"data": map[string]any{
				"id": "audio_task_1", "status": "success", "model": "doubao-seed-audio-1-0", "credit_cost": 2,
				"usage": map[string]any{"audio_second": 10.5},
				"outputs": []map[string]any{{
					"type": "audio", "url": outputURL, "mime_type": "audio/mpeg", "duration_seconds": 10.5, "size_bytes": 84524,
				}},
			},
			"diagnostics": map[string]any{"task_id": "audio_task_1", "stage": "decode_result"},
		})
	})
	mux.HandleFunc("GET /generated/output.mp3", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("audio-bytes"))
	})
	srv := httptest.NewServer(mux)
	defer srv.Close()

	var stdout, stderr bytes.Buffer
	outputPath := filepath.Join(t.TempDir(), "result.mp3")
	cmd := NewAudioCmd(func() *httpclient.Client { return httpclient.New(srv.URL) }, &stdout)
	cmd.SetOut(&stdout)
	cmd.SetErr(&stderr)
	cmd.SetArgs([]string{
		"generate", "--prompt", "make this warmer", "--model", "doubao-seed-audio-1-0", "--mode", "audio-to-audio",
		"--param", "audios=" + referencePath, "--param", "speech_rate=10", "-o", outputPath,
	})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("audio generate failed: %v\nstderr: %s", err, stderr.String())
	}

	audios, ok := requestBody["audios"].([]any)
	if !ok || len(audios) != 1 || audios[0] != "anycap://upload/cu_A1b2C3d4E5f6G7h8" || requestBody["speech_rate"] != float64(10) {
		t.Fatalf("unexpected request body: %+v", requestBody)
	}
	if presignCalls != 1 {
		t.Fatalf("presign calls = %d, want 1", presignCalls)
	}
	if data, err := filepath.Abs(outputPath); err != nil || !bytes.Contains(stdout.Bytes(), []byte(data)) {
		t.Fatalf("output JSON does not contain downloaded path %q: %s", data, stdout.String())
	}
	var result map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatalf("stdout is not JSON: %v; %s", err, stdout.String())
	}
	outputs, _ := result["outputs"].([]any)
	first, _ := outputs[0].(map[string]any)
	if first["duration_seconds"] != 10.5 || first["size_bytes"] != float64(84524) {
		t.Fatalf("CLI output lost audio metadata: %+v", result)
	}
}

func TestAudioOutputFallbackExtension(t *testing.T) {
	tests := []struct {
		name            string
		mimeType        string
		requestedFormat any
		want            string
	}{
		{name: "wav MIME", mimeType: "audio/wav", want: ".wav"},
		{name: "mpeg MIME", mimeType: "audio/mpeg", requestedFormat: "wav", want: ".mp3"},
		{name: "requested format", requestedFormat: "flac", want: ".flac"},
		{name: "unknown", mimeType: "application/octet-stream", requestedFormat: 42, want: ".mp3"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := audioOutputFallbackExtension(tt.mimeType, tt.requestedFormat); got != tt.want {
				t.Fatalf("audioOutputFallbackExtension() = %q, want %q", got, tt.want)
			}
		})
	}
}
