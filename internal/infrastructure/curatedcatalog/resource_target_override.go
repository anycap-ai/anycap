package curatedcatalog

import "gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

const (
	videoReferImageURLsTargetKey = "video_option.refer_image_urls"
	videoReferVideoURLTargetKey  = "video_option.refer_video_url"
)

var videoReferImageURLArrayOverrideKeys = map[string]struct{}{
	"cloudsway_kling_3.0|img_2_video":        {},
	"cloudsway_kling_3.0|multi_shot_video":   {},
	"tengda_kling_3.0_omni|multi_shot_video": {},
	"ark-doubao-seedance-2|img_2_video":      {},
	"ark-doubao-seedance-2-fast|img_2_video": {},
}

var videoReferVideoURLOverrideKeys = map[string]struct{}{
	"cloudsway_kling_3.0|img_2_video":        {},
	"ark-doubao-seedance-2|img_2_video":      {},
	"ark-doubao-seedance-2-fast|img_2_video": {},
}

func applyResourceTargetOverrides(abilityKey, algo string, schema map[string]any, targets []model.ResourceTarget) []model.ResourceTarget {
	key := abilityKey + "|" + algo
	_, addImages := videoReferImageURLArrayOverrideKeys[key]
	_, addVideos := videoReferVideoURLOverrideKeys[key]
	if !addImages && !addVideos {
		return targets
	}

	out := make([]model.ResourceTarget, 0, len(targets)+2)
	if addImages && !hasResourceTarget(targets, videoReferImageURLsTargetKey, model.ResourceKindURLArray) {
		out = append(out, model.ResourceTarget{
			Key:  videoReferImageURLsTargetKey,
			Kind: model.ResourceKindURLArray,
		})
	}
	out = append(out, targets...)
	// The production UI/docs expose reference videos for these algos, but
	// Discovery can omit the corresponding annotation/schema entry. Keep the
	// target available on the AnyCap side so local validation can exercise the
	// real Core payload.
	if addVideos && !hasResourceTarget(out, videoReferVideoURLTargetKey, model.ResourceKindURL) {
		out = append(out, model.ResourceTarget{
			Key:  videoReferVideoURLTargetKey,
			Kind: model.ResourceKindURL,
		})
	}
	if len(out) == len(targets) {
		return targets
	}
	return out
}

func hasResourceTarget(targets []model.ResourceTarget, key string, kind model.ResourceKind) bool {
	for _, target := range targets {
		if target.Key == key && target.Kind == kind {
			return true
		}
	}
	return false
}
