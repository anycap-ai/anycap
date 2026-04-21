package extension

type Config struct {
	DefaultPrompt string `json:"default_prompt"`
	DefaultModel  string `json:"default_model"`
	MinImageDim   int    `json:"min_image_dim"`
}

type ConfigService struct{ cfg Config }

func NewConfigService() *ConfigService {
	return &ConfigService{cfg: Config{
		DefaultPrompt: "create a stylistic variation of this image",
		DefaultModel:  "nano-banana-2",
		MinImageDim:   256,
	}}
}

func (s *ConfigService) Current() Config { return s.cfg }
