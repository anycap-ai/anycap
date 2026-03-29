package capabilities

import (
	"fmt"
	"path"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/google/uuid"
)

func normalizeSHA256(raw string) string {
	return strings.ToLower(strings.TrimSpace(raw))
}

func buildCapsInputObjectKey(spaceID int64, filename string, now time.Time) string {
	date := now.Format("2006-01-02")
	cleanFilename := path.Base(strings.TrimSpace(filename))
	return fmt.Sprintf("caps/inputs/spaces/%d/%s/%s/%s", spaceID, date, uuid.NewString(), cleanFilename)
}

func fallbackMIME(mime string) string {
	trimmed := strings.TrimSpace(mime)
	if trimmed == "" {
		return "application/octet-stream"
	}
	return trimmed
}

func secondsUntil(target, now time.Time) int {
	if target.Before(now) {
		return 0
	}
	return int(target.Sub(now).Seconds())
}

func buildImageRequestMeta(req model.ImageUnderstandRequest, inputCount int) map[string]any {
	meta := map[string]any{
		"input_count": inputCount,
	}
	if req.Model != "" {
		meta["model"] = req.Model
	}
	if req.Instruction != "" {
		meta["instruction_length"] = len(req.Instruction)
	}
	return meta
}

func buildVideoRequestMeta(req model.VideoReadRequest, inputCount int) map[string]any {
	meta := map[string]any{
		"input_count": inputCount,
	}
	if req.Model != "" {
		meta["model"] = req.Model
	}
	if req.Instruction != "" {
		meta["instruction_length"] = len(req.Instruction)
	}
	return meta
}

func buildUnderstandResultMeta(result model.UnderstandResult) map[string]any {
	return map[string]any{
		"model":       result.Model,
		"duration_ms": result.DurationMs,
		"usage":       result.Usage,
	}
}
