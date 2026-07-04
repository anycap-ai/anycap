package model

import (
	"fmt"
	"strings"
)

var algoTypeByMode = map[Mode]string{
	ModeTextToImage:    "txt_2_img",
	ModeImageToImage:   "img_2_img",
	ModeTextToVideo:    "txt_2_video",
	ModeImageToVideo:   "img_2_video",
	ModeMultiShotVideo: "multi_shot_video",
	ModeMultiModalRef:  "multi_modal_ref_2_video",
	ModeEditVideo:      "edit_video",
	ModeTextToMusic:    "text_2_music",
}

var modeByAlgoType = map[string]Mode{
	"txt_2_img":               ModeTextToImage,
	"img_2_img":               ModeImageToImage,
	"txt_2_video":             ModeTextToVideo,
	"img_2_video":             ModeImageToVideo,
	"multi_shot_video":        ModeMultiShotVideo,
	"multi_modal_ref_2_video": ModeMultiModalRef,
	"edit_video":              ModeEditVideo,
	"text_2_music":            ModeTextToMusic,
}

func CanonicalAlgoTypeForMode(mode Mode) (string, bool) {
	algoType, ok := algoTypeByMode[Mode(strings.TrimSpace(string(mode)))]
	return algoType, ok
}

func CanonicalModeForAlgoType(algoType string) (Mode, bool) {
	mode, ok := modeByAlgoType[strings.TrimSpace(algoType)]
	return mode, ok
}

func NormalizeModeAlgoTypePair(mode Mode, algoType string) (Mode, string, error) {
	normalizedMode := Mode(strings.TrimSpace(string(mode)))
	normalizedAlgoType := strings.TrimSpace(algoType)

	if normalizedMode == "" && normalizedAlgoType == "" {
		return "", "", nil
	}

	if normalizedMode == "" {
		if mappedMode, ok := CanonicalModeForAlgoType(normalizedAlgoType); ok {
			normalizedMode = mappedMode
		}
		return normalizedMode, normalizedAlgoType, nil
	}

	if normalizedAlgoType == "" {
		if mappedAlgoType, ok := CanonicalAlgoTypeForMode(normalizedMode); ok {
			normalizedAlgoType = mappedAlgoType
		}
		return normalizedMode, normalizedAlgoType, nil
	}

	mappedMode, modeKnown := CanonicalModeForAlgoType(normalizedAlgoType)
	mappedAlgoType, algoKnown := CanonicalAlgoTypeForMode(normalizedMode)
	if modeKnown && algoKnown && (mappedMode != normalizedMode || mappedAlgoType != normalizedAlgoType) {
		return "", "", fmt.Errorf("mode %q does not match algo_type %q", normalizedMode, normalizedAlgoType)
	}

	return normalizedMode, normalizedAlgoType, nil
}
