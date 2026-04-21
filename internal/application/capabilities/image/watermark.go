package image

type WatermarkConfig struct {
	Enabled bool
}

func ResolveWatermark(userIsPro bool, requested bool) WatermarkConfig {
	if !userIsPro {
		return WatermarkConfig{Enabled: true}
	}
	return WatermarkConfig{Enabled: requested}
}
