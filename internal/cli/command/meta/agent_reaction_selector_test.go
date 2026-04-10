package meta

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/im"
)

func TestCodexReactionSelectorReturnsAllowlistedReaction(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "codex-stub.sh")
	argsPath := filepath.Join(tmpDir, "codex-args.txt")
	script := `#!/bin/sh
args_log="` + argsPath + `"
printf '%s\n' "$@" > "$args_log"
out=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    exec|resume)
      shift
      ;;
    --output-last-message)
      out="$2"
      shift 2
      ;;
    --json|--skip-git-repo-check|--full-auto)
      shift
      ;;
    -C)
      shift 2
      ;;
    -)
      shift
      break
      ;;
    *)
      shift
      ;;
  esac
done
cat >/dev/null
printf '` + "`OnIt`" + `' > "$out"
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	selector := newCodexReactionSelector(newCodexExecExecutor(scriptPath, tmpDir, "safe"))
	reaction, err := selector(context.Background(), im.NormalizedInboundEvent{
		Platform: model.IMPlatformFeishu,
		Message:  "麻烦帮我看下这个报错",
	})
	if err != nil {
		t.Fatalf("selector() error = %v", err)
	}
	if reaction != "OnIt" {
		t.Fatalf("expected OnIt, got %q", reaction)
	}

	argsBody, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	if !strings.Contains(string(argsBody), "--full-auto\n") {
		t.Fatalf("expected selector to use full-auto, got %q", string(argsBody))
	}
}

func TestCodexReactionSelectorRejectsUnsupportedReaction(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "codex-stub.sh")
	script := `#!/bin/sh
out=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    exec|resume)
      shift
      ;;
    --output-last-message)
      out="$2"
      shift 2
      ;;
    --json|--skip-git-repo-check|--full-auto)
      shift
      ;;
    -C)
      shift 2
      ;;
    -)
      shift
      break
      ;;
    *)
      shift
      ;;
  esac
done
cat >/dev/null
printf 'PARTY' > "$out"
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	selector := newCodexReactionSelector(newCodexExecExecutor(scriptPath, tmpDir, "safe"))
	_, err := selector(context.Background(), im.NormalizedInboundEvent{Message: "太棒了"})
	if err == nil {
		t.Fatal("expected selector to reject unsupported reaction")
	}
}
