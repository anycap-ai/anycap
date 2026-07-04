package curatedcatalog

import (
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type referenceMediaParams struct {
	Images bool
	Videos bool
	Audios bool
}

func referenceMediaParamsFromTargets(targets []model.ResourceTarget) referenceMediaParams {
	var media referenceMediaParams
	for _, target := range targets {
		switch target.Media {
		case model.ResourceMediaAudio:
			media.Audios = true
			continue
		case model.ResourceMediaVideo:
			media.Videos = true
			continue
		case model.ResourceMediaImage:
			media.Images = true
			continue
		}
		if targetLooksLikeAudioReference(target.Key) {
			media.Audios = true
			continue
		}
		if targetLooksLikeVideoReference(target.Key) {
			media.Videos = true
			continue
		}
		if targetLooksLikeImageReference(target.Key) {
			media.Images = true
		}
	}
	return media
}

func targetLooksLikeVideoReference(key string) bool {
	key = strings.ToLower(key)
	return strings.Contains(key, "refer_video") ||
		strings.Contains(key, "reference_video")
}

func targetLooksLikeAudioReference(key string) bool {
	key = strings.ToLower(key)
	return strings.Contains(key, "refer_audio") ||
		strings.Contains(key, "reference_audio")
}

func targetLooksLikeImageReference(key string) bool {
	key = strings.ToLower(key)
	if key == "resource_url" || key == "resource_path" {
		return true
	}
	return strings.Contains(key, "image") ||
		strings.Contains(key, "first_frame") ||
		strings.Contains(key, "last_frame")
}
