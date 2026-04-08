package config

import (
	"encoding/json"
	"fmt"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const (
	defaultAppName               = "anycap-server"
	defaultAppEnv                = "local"
	defaultHTTPAddr              = ":18080"
	defaultRuntimeMode           = "stub"
	defaultLogLevel              = "info"
	defaultLogFormat             = "json"
	defaultLogOutput             = "stdout"
	defaultRateLimitRPM          = 60
	defaultRateLimitDConfGroup   = "anycap"
	defaultRateLimitDConfDataID  = "rate_limit"
	defaultFeatureDConfGroup     = "anycap"
	defaultFeatureDConfDataID    = "feature_access"
	rateLimitEnvPrefix           = "ANYCAP_RATE_LIMIT_"
	rateLimitEnvSuffix           = "_RPM"
	defaultLoginAPIKeyTTL        = 7 * 24 * time.Hour
	defaultAgentPlatformTimeout  = 600 * time.Second
	defaultPresignExpiry         = 600   // seconds (10 minutes)
	defaultPresignGetExpiry      = 3600  // seconds (1 hour)
	maxPresignExpiry             = 3600  // seconds (1 hour hard cap)
	maxPresignGetExpiry          = 86400 // seconds (24 hours hard cap)
	legacyPGConfigEnvKey         = "ANYCAP_PG_CONFIG"
	defaultDriveShareBaseURL     = "https://drive.anycap.cloud/s"
	defaultKVSyncPollInterval    = 1 * time.Second
	defaultKVSyncLockTTL         = 5 * time.Minute
	defaultKVSyncWaitTimeout     = 5 * time.Second
	defaultUsageSyncPollInterval = 1 * time.Minute
	defaultUsageSyncBatchSize    = 50
	defaultCloudflareAPIBaseURL  = "https://api.cloudflare.com/client/v4"
	defaultDriveAccessTTLSeconds = int64(300)
	defaultPagePreviewTTLSeconds = int64(300)
	defaultArtifactLinkTTL       = int64(600)
	minEdgeGrantTTLSeconds       = int64(60)
	maxEdgeGrantTTLSeconds       = int64(3600)
)

type Config struct {
	AppName               string
	AppEnv                string
	HTTPAddr              string
	AdminHTTPAddr         string
	RuntimeMode           string
	LogLevel              string
	LogFormat             string
	LogOutput             string
	PGDSN                 string
	PGHost                string
	PGPort                int
	PGUser                string
	PGPassword            string
	PGDatabase            string
	PGSSLMode             string
	PGTimezone            string
	PGAutoMigrate         bool
	RedisAddr             string
	RedisHost             string
	RedisPort             int
	RedisUsername         string
	RedisPassword         string
	RedisDB               int
	RateLimitRPM          int
	RateLimitOverrides    map[string]int
	RateLimitDConfEnabled bool
	RateLimitDConfGroup   string
	RateLimitDConfDataID  string
	FeatureDConfEnabled   bool
	FeatureDConfGroup     string
	FeatureDConfDataID    string
	LoginAPIKeyTTL        time.Duration
	Auth0Enabled          bool
	Auth0Issuer           string
	Auth0Audience         string
	Auth0RedirectURL      string
	NexusHubBaseURL       string
	NexusHubToken         string
	// Split configuration for NexusHub Platform (catalog/schema) and Core (execution).
	// Legacy NEXUSHUB_BASE_URL / NEXUSHUB_TOKEN remain as fallbacks for backward compatibility.
	NexusHubPlatformBaseURL string
	NexusHubPlatformToken   string
	NexusHubCoreBaseURL     string
	NexusHubCoreToken       string
	Credit                  CreditConfig
	Payment                 PaymentConfig
	PaymentEvents           PaymentEventsConfig
	CreditPacks             []CreditPackConfig
	AgentPlatform           AgentPlatformConfig
	CloudS3                 S3Config
	Lark                    LarkConfig
	PasswordPepper          string
	DriveShareBaseURL       string
	DriveAccessTTLSeconds   int64
	PageHostFormat          string
	PagePreviewHostFormat   string
	PagePreviewTTLSeconds   int64
	CloudflareKV            CloudflareKVConfig
	KVSyncEnabled           bool
	KVSyncWaitEnabled       bool
	KVSyncPollInterval      time.Duration
	KVSyncLockTTL           time.Duration
	KVSyncWaitTimeout       time.Duration
	UsageSyncEnabled        bool
	UsageSyncPollInterval   time.Duration
	UsageSyncBatchSize      int
	Artifact                ArtifactConfig
	Api302                  Api302Config
	// Storage quota
	StorageQuotaDConfEnabled bool
	StorageQuotaDConfGroup   string
	StorageQuotaDConfDataID  string
	StorageQuotaBytes        int64
	MaxDriveFileSizeBytes    int64
	MaxDriveNodes            int
	MaxPageAssetSizeBytes    int64
	MaxPageSites             int
	MaxPageVersionsPerSite   int
	MaxFilesPerPageVersion   int
	MaxPendingDriveSessions  int
	MaxPendingPageSessions   int
}

type CreditConfig struct {
	BaseURL                    string
	BizToken                   string
	Timeout                    time.Duration
	SignupRewardEnabled        bool
	SignupRewardDeadline       time.Time
	SignupRewardPackageID      int64
	SignupRewardPackageType    string
	SignupRewardPackageSubtype string
}

func (c CreditConfig) Enabled() bool {
	return c.BaseURL != "" && c.BizToken != ""
}

type PaymentConfig struct {
	BaseURL  string
	BizToken string
	Timeout  time.Duration
}

func (c PaymentConfig) Enabled() bool {
	return c.BaseURL != "" && c.BizToken != ""
}

type PaymentEventsConfig struct {
	Enabled       bool
	Endpoint      string
	Topic         string
	AccessKey     string
	SecretKey     string
	ConsumerGroup string
	BizID         string
	Tags          []string
}

func (c PaymentEventsConfig) Configured() bool {
	return strings.TrimSpace(c.Endpoint) != "" &&
		strings.TrimSpace(c.Topic) != "" &&
		strings.TrimSpace(c.AccessKey) != "" &&
		strings.TrimSpace(c.SecretKey) != "" &&
		strings.TrimSpace(c.ConsumerGroup) != "" &&
		strings.TrimSpace(c.BizID) != ""
}

type CreditPackConfig struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	PriceCent   int64  `json:"price_cent"`
	Currency    string `json:"currency"`
	Credits     int64  `json:"credits"`
	Featured    bool   `json:"featured,omitempty"`
	Badge       string `json:"badge,omitempty"`
	PriceID     string `json:"price_id"`
}

type AgentPlatformConfig struct {
	BaseURL  string
	APIKey   string
	TenantID string
	Timeout  time.Duration
}

func (c AgentPlatformConfig) Enabled() bool {
	return c.BaseURL != "" && c.APIKey != ""
}

type S3Config struct {
	Endpoint         string
	AccessKeyID      string
	SecretAccessKey  string
	Bucket           string
	Region           string
	PresignExpiry    int
	PresignGetExpiry int
	ForcePathStyle   bool
}

func (c S3Config) Enabled() bool {
	return c.Endpoint != "" && c.AccessKeyID != "" && c.SecretAccessKey != "" && c.Bucket != ""
}

type LarkConfig struct {
	MsgAPI        string
	WebhookURL    string
	WebhookSecret string
}

type CloudflareKVConfig struct {
	AccountID   string
	NamespaceID string
	APIToken    string
	APIBaseURL  string
}

type Api302Config struct {
	APIKey  string
	BaseURL string
}

func (c Api302Config) Enabled() bool {
	return c.APIKey != ""
}

type ArtifactConfig struct {
	PublicBaseURL  string
	IngestBaseURL  string
	IngestToken    string
	LinkTTLSeconds int64
}

func (c ArtifactConfig) Enabled() bool {
	return c.PublicBaseURL != "" && c.IngestBaseURL != "" && c.IngestToken != ""
}

func (c CloudflareKVConfig) Enabled() bool {
	return c.AccountID != "" && c.NamespaceID != "" && c.APIToken != ""
}

func (c LarkConfig) Enabled() bool {
	return c.MsgAPI != "" && c.WebhookURL != "" && c.WebhookSecret != ""
}

func Load() Config {
	cfg, err := LoadFromEnv()
	if err != nil {
		panic(err)
	}
	return cfg
}

func LoadFromEnv() (Config, error) {
	_ = godotenv.Load()

	pageHostFormat := model.NormalizePageHostFormat(getEnv("ANYCAP_PAGE_HOST_FORMAT", ""))
	pagePreviewHostFormat := resolvePagePreviewHostFormat(
		pageHostFormat,
		getEnv("ANYCAP_PAGE_PREVIEW_HOST_FORMAT", ""),
	)

	cfg := Config{
		AppName:                 getEnv("ANYCAP_APP_NAME", defaultAppName),
		AppEnv:                  getEnv("ANYCAP_APP_ENV", defaultAppEnv),
		HTTPAddr:                getEnv("ANYCAP_HTTP_ADDR", defaultHTTPAddr),
		AdminHTTPAddr:           getEnv("ANYCAP_ADMIN_HTTP_ADDR", ""),
		RuntimeMode:             getEnv("ANYCAP_RUNTIME_MODE", defaultRuntimeMode),
		LogLevel:                getEnv("ANYCAP_LOG_LEVEL", defaultLogLevel),
		LogFormat:               getEnv("ANYCAP_LOG_FORMAT", defaultLogFormat),
		LogOutput:               getEnv("ANYCAP_LOG_OUTPUT", defaultLogOutput),
		PGDSN:                   os.Getenv("ANYCAP_PG_DSN"),
		PGHost:                  os.Getenv("ANYCAP_PG_HOST"),
		PGPort:                  getEnvInt("ANYCAP_PG_PORT", 5432),
		PGUser:                  os.Getenv("ANYCAP_PG_USER"),
		PGPassword:              os.Getenv("ANYCAP_PG_PASSWORD"),
		PGDatabase:              getEnv("ANYCAP_PG_DATABASE", "postgres"),
		PGSSLMode:               getEnv("ANYCAP_PG_SSL_MODE", "prefer"),
		PGTimezone:              os.Getenv("ANYCAP_PG_TIMEZONE"),
		PGAutoMigrate:           getEnvBool("ANYCAP_PG_AUTO_MIGRATE", false),
		RedisAddr:               os.Getenv("ANYCAP_REDIS_ADDR"),
		RedisHost:               os.Getenv("ANYCAP_REDIS_HOST"),
		RedisPort:               getEnvInt("ANYCAP_REDIS_PORT", 6379),
		RedisUsername:           getEnv("ANYCAP_REDIS_USERNAME", "default"),
		RedisPassword:           os.Getenv("ANYCAP_REDIS_PASSWORD"),
		RedisDB:                 getEnvInt("ANYCAP_REDIS_DB", 0),
		RateLimitRPM:            getEnvInt("ANYCAP_RATE_LIMIT_RPM", defaultRateLimitRPM),
		RateLimitOverrides:      loadRateLimitOverrides(),
		RateLimitDConfEnabled:   getEnvBool("ANYCAP_RATE_LIMIT_DCONF_ENABLED", false),
		RateLimitDConfGroup:     getEnv("ANYCAP_RATE_LIMIT_DCONF_GROUP", defaultRateLimitDConfGroup),
		RateLimitDConfDataID:    getEnv("ANYCAP_RATE_LIMIT_DCONF_DATA_ID", defaultRateLimitDConfDataID),
		FeatureDConfEnabled:     getEnvBool("ANYCAP_FEATURE_DCONF_ENABLED", false),
		FeatureDConfGroup:       getEnv("ANYCAP_FEATURE_DCONF_GROUP", defaultFeatureDConfGroup),
		FeatureDConfDataID:      getEnv("ANYCAP_FEATURE_DCONF_DATA_ID", defaultFeatureDConfDataID),
		LoginAPIKeyTTL:          getEnvDuration("ANYCAP_LOGIN_API_KEY_TTL", defaultLoginAPIKeyTTL),
		Auth0Enabled:            getEnvBool("ANYCAP_AUTH0_ENABLED", false),
		Auth0Issuer:             os.Getenv("ANYCAP_AUTH0_ISSUER"),
		Auth0Audience:           os.Getenv("ANYCAP_AUTH0_AUDIENCE"),
		Auth0RedirectURL:        os.Getenv("ANYCAP_AUTH0_REDIRECT_URL"),
		NexusHubBaseURL:         getEnv("NEXUSHUB_BASE_URL", ""),
		NexusHubToken:           getEnv("NEXUSHUB_TOKEN", ""),
		NexusHubPlatformBaseURL: getEnv("NEXUSHUB_PLATFORM_BASE_URL", ""),
		NexusHubPlatformToken:   getEnv("NEXUSHUB_PLATFORM_TOKEN", ""),
		NexusHubCoreBaseURL:     getEnv("NEXUSHUB_CORE_BASE_URL", ""),
		NexusHubCoreToken:       getEnv("NEXUSHUB_CORE_TOKEN", ""),
		Payment:                 loadPaymentConfig(),
		PaymentEvents:           loadPaymentEventsConfig(),
		AgentPlatform:           loadAgentPlatformConfig(),
		CloudS3:                 loadCloudS3Config(),
		Lark: LarkConfig{
			MsgAPI:        getEnv("ANYCAP_LARK_MSG_API", "https://lark-msg-wmvfpeppfl.ap-southeast-1-vpc.fcapp.run/v1/send"),
			WebhookURL:    os.Getenv("ANYCAP_LARK_WEBHOOK_URL"),
			WebhookSecret: os.Getenv("ANYCAP_LARK_WEBHOOK_SECRET"),
		},
		PasswordPepper:    os.Getenv("ANYCAP_PASSWORD_PEPPER"),
		DriveShareBaseURL: getEnv("ANYCAP_DRIVE_SHARE_BASE_URL", defaultDriveShareBaseURL),
		DriveAccessTTLSeconds: clampEdgeGrantTTLSeconds(
			getEnvInt64("ANYCAP_DRIVE_ACCESS_TTL_SECONDS", defaultDriveAccessTTLSeconds),
		),
		PageHostFormat:        pageHostFormat,
		PagePreviewHostFormat: pagePreviewHostFormat,
		PagePreviewTTLSeconds: clampEdgeGrantTTLSeconds(
			getEnvInt64("ANYCAP_PAGE_PREVIEW_TTL_SECONDS", defaultPagePreviewTTLSeconds),
		),
		CloudflareKV: CloudflareKVConfig{
			AccountID:   getEnv("ANYCAP_CLOUDFLARE_ACCOUNT_ID", ""),
			NamespaceID: getEnv("ANYCAP_CLOUDFLARE_KV_NAMESPACE_ID", ""),
			APIToken:    getEnv("ANYCAP_CLOUDFLARE_API_TOKEN", ""),
			APIBaseURL:  getEnv("ANYCAP_CLOUDFLARE_API_BASE_URL", defaultCloudflareAPIBaseURL),
		},
		KVSyncEnabled:         getEnvBool("ANYCAP_KVSYNC_ENABLED", false),
		KVSyncWaitEnabled:     getEnvBool("ANYCAP_KVSYNC_WAIT_ENABLED", true),
		KVSyncPollInterval:    getEnvDuration("ANYCAP_KVSYNC_POLL_INTERVAL", defaultKVSyncPollInterval),
		KVSyncLockTTL:         getEnvDuration("ANYCAP_KVSYNC_LOCK_TTL", defaultKVSyncLockTTL),
		KVSyncWaitTimeout:     getEnvDuration("ANYCAP_KVSYNC_WAIT_TIMEOUT", defaultKVSyncWaitTimeout),
		UsageSyncEnabled:      getEnvBool("ANYCAP_USAGE_SYNC_ENABLED", true),
		UsageSyncPollInterval: getEnvDuration("ANYCAP_USAGE_SYNC_POLL_INTERVAL", defaultUsageSyncPollInterval),
		UsageSyncBatchSize:    getEnvInt("ANYCAP_USAGE_SYNC_BATCH_SIZE", defaultUsageSyncBatchSize),
		Artifact: ArtifactConfig{
			PublicBaseURL:  getEnv("ANYCAP_ARTIFACT_PUBLIC_BASE_URL", ""),
			IngestBaseURL:  getEnv("ANYCAP_ARTIFACT_INGEST_BASE_URL", ""),
			IngestToken:    getEnv("ANYCAP_ARTIFACT_INGEST_TOKEN", ""),
			LinkTTLSeconds: getEnvInt64("ANYCAP_ARTIFACT_LINK_TTL_SECONDS", defaultArtifactLinkTTL),
		},
		Api302: Api302Config{
			APIKey:  getEnv("API_302_API_KEY", ""),
			BaseURL: getEnv("API_302_BASE_URL", ""),
		},
		// Storage quota
		StorageQuotaDConfEnabled: getEnvBool("ANYCAP_STORAGE_QUOTA_DCONF_ENABLED", false),
		StorageQuotaDConfGroup:   getEnv("ANYCAP_STORAGE_QUOTA_DCONF_GROUP", defaultStorageQuotaDConfGroup),
		StorageQuotaDConfDataID:  getEnv("ANYCAP_STORAGE_QUOTA_DCONF_DATA_ID", defaultStorageQuotaDConfDataID),
		StorageQuotaBytes:        getEnvInt64("ANYCAP_STORAGE_QUOTA_BYTES", 0),
		MaxDriveFileSizeBytes:    getEnvInt64("ANYCAP_MAX_DRIVE_FILE_SIZE_BYTES", 0),
		MaxDriveNodes:            getEnvInt("ANYCAP_MAX_DRIVE_NODES", 0),
		MaxPageAssetSizeBytes:    getEnvInt64("ANYCAP_MAX_PAGE_ASSET_SIZE_BYTES", 0),
		MaxPageSites:             getEnvInt("ANYCAP_MAX_PAGE_SITES", 0),
		MaxPageVersionsPerSite:   getEnvInt("ANYCAP_MAX_PAGE_VERSIONS_PER_SITE", 0),
		MaxFilesPerPageVersion:   getEnvInt("ANYCAP_MAX_FILES_PER_PAGE_VERSION", 0),
		MaxPendingDriveSessions:  getEnvInt("ANYCAP_MAX_PENDING_DRIVE_SESSIONS", 0),
		MaxPendingPageSessions:   getEnvInt("ANYCAP_MAX_PENDING_PAGE_SESSIONS", 0),
	}

	creditCfg, err := loadCreditConfig()
	if err != nil {
		return Config{}, err
	}
	cfg.Credit = creditCfg

	creditPacks, err := loadCreditPacksConfig()
	if err != nil {
		return Config{}, err
	}
	cfg.CreditPacks = creditPacks

	if cfg.PGDSN == "" && !hasDiscretePostgresEnv() {
		legacyDSN, ok, err := loadLegacyPostgresDSNFromEnv()
		if err != nil {
			return Config{}, err
		}
		if ok {
			cfg.PGDSN = legacyDSN
		}
	}

	if err := cfg.validateInfraConfigExclusivity(); err != nil {
		return Config{}, err
	}
	if cfg.Artifact.LinkTTLSeconds <= 0 {
		cfg.Artifact.LinkTTLSeconds = defaultArtifactLinkTTL
	}

	if cfg.requiresExternalInfra() {
		if cfg.PGDSN == "" {
			if cfg.PGHost == "" || cfg.PGUser == "" || cfg.PGPassword == "" {
				return Config{}, fmt.Errorf("%s mode requires postgres dsn or host/user/password", cfg.RuntimeMode)
			}
			cfg.PGDSN = cfg.postgresDSN()
		}
		if cfg.RedisAddr == "" {
			if cfg.RedisHost == "" || cfg.RedisPassword == "" {
				return Config{}, fmt.Errorf("%s mode requires redis addr or host/password", cfg.RuntimeMode)
			}
			cfg.RedisAddr = net.JoinHostPort(cfg.RedisHost, strconv.Itoa(cfg.RedisPort))
		}
	}

	return cfg, nil
}

type legacyPostgresConfig struct {
	Host     string `json:"Host"`
	Port     string `json:"Port"`
	User     string `json:"User"`
	Password string `json:"Password"`
	DBName   string `json:"DBName"`
	SSLMode  string `json:"SSLMode"`
	TimeZone string `json:"TimeZone"`
}

func hasDiscretePostgresEnv() bool {
	keys := []string{
		"ANYCAP_PG_HOST",
		"ANYCAP_PG_PORT",
		"ANYCAP_PG_USER",
		"ANYCAP_PG_DATABASE",
		"ANYCAP_PG_SSL_MODE",
		"ANYCAP_PG_TIMEZONE",
	}
	for _, key := range keys {
		if strings.TrimSpace(os.Getenv(key)) != "" {
			return true
		}
	}
	return os.Getenv("ANYCAP_PG_PASSWORD") != ""
}

func loadLegacyPostgresDSNFromEnv() (string, bool, error) {
	raw := strings.TrimSpace(os.Getenv(legacyPGConfigEnvKey))
	if raw == "" {
		return "", false, nil
	}

	var legacy legacyPostgresConfig
	if err := json.Unmarshal([]byte(raw), &legacy); err != nil {
		return "", false, fmt.Errorf("parse %s: %w", legacyPGConfigEnvKey, err)
	}

	port := 5432
	if strings.TrimSpace(legacy.Port) != "" {
		parsedPort, err := strconv.Atoi(strings.TrimSpace(legacy.Port))
		if err != nil {
			return "", false, fmt.Errorf("%s Port must be numeric", legacyPGConfigEnvKey)
		}
		port = parsedPort
	}

	cfg := Config{
		PGHost:     strings.TrimSpace(legacy.Host),
		PGPort:     port,
		PGUser:     strings.TrimSpace(legacy.User),
		PGPassword: legacy.Password,
		PGDatabase: strings.TrimSpace(legacy.DBName),
		PGSSLMode:  strings.TrimSpace(legacy.SSLMode),
		PGTimezone: strings.TrimSpace(legacy.TimeZone),
	}

	if cfg.PGHost == "" || cfg.PGUser == "" || cfg.PGDatabase == "" {
		return "", false, fmt.Errorf("%s requires Host, User, and DBName", legacyPGConfigEnvKey)
	}
	if cfg.PGSSLMode == "" {
		cfg.PGSSLMode = "disable"
	}

	return cfg.postgresDSN(), true, nil
}

func (c Config) validateInfraConfigExclusivity() error {
	if c.PGDSN != "" && (c.PGHost != "" || c.PGUser != "" || c.PGPassword != "" || c.PGDatabase != "postgres" || c.PGPort != 5432 || c.PGSSLMode != "prefer" || c.PGTimezone != "") {
		return fmt.Errorf("postgres config is ambiguous: use either ANYCAP_PG_DSN or discrete ANYCAP_PG_* fields, not both")
	}
	if c.RedisAddr != "" && (c.RedisHost != "" || c.RedisPassword != "" || c.RedisUsername != "default" || c.RedisPort != 6379 || c.RedisDB != 0) {
		return fmt.Errorf("redis config is ambiguous: use either ANYCAP_REDIS_ADDR or discrete ANYCAP_REDIS_* fields, not both")
	}
	return nil
}

func loadCreditConfig() (CreditConfig, error) {
	timeout := 10 * time.Second
	if s := os.Getenv("ANYCAP_CREDIT_TIMEOUT_SECONDS"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			timeout = time.Duration(n) * time.Second
		}
	}

	var deadline time.Time
	if raw := strings.TrimSpace(os.Getenv("ANYCAP_CREDIT_SIGNUP_REWARD_DEADLINE")); raw != "" {
		parsed, err := time.Parse(time.RFC3339, raw)
		if err != nil {
			return CreditConfig{}, fmt.Errorf("invalid ANYCAP_CREDIT_SIGNUP_REWARD_DEADLINE: %w", err)
		}
		deadline = parsed.UTC()
	}

	return CreditConfig{
		BaseURL:                    getEnv("ANYCAP_CREDIT_BASE_URL", ""),
		BizToken:                   getEnv("ANYCAP_CREDIT_BIZ_TOKEN", ""),
		Timeout:                    timeout,
		SignupRewardEnabled:        getEnvBool("ANYCAP_CREDIT_SIGNUP_REWARD_ENABLED", false),
		SignupRewardDeadline:       deadline,
		SignupRewardPackageID:      getEnvInt64("ANYCAP_CREDIT_SIGNUP_REWARD_PACKAGE_ID", 0),
		SignupRewardPackageType:    getEnv("ANYCAP_CREDIT_SIGNUP_REWARD_PACKAGE_TYPE", ""),
		SignupRewardPackageSubtype: getEnv("ANYCAP_CREDIT_SIGNUP_REWARD_PACKAGE_SUBTYPE", ""),
	}, nil
}

func loadPaymentConfig() PaymentConfig {
	timeout := 10 * time.Second
	if s := os.Getenv("ANYCAP_PAYMENT_TIMEOUT_SECONDS"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			timeout = time.Duration(n) * time.Second
		}
	}

	return PaymentConfig{
		BaseURL:  getEnv("ANYCAP_PAYMENT_BASE_URL", ""),
		BizToken: getEnv("ANYCAP_PAYMENT_BIZ_TOKEN", ""),
		Timeout:  timeout,
	}
}

func loadPaymentEventsConfig() PaymentEventsConfig {
	return PaymentEventsConfig{
		Enabled:       getEnvBool("ANYCAP_PAYMENT_EVENTS_ENABLED", false),
		Endpoint:      getEnv("ANYCAP_PAYMENT_EVENTS_ENDPOINT", ""),
		Topic:         getEnv("ANYCAP_PAYMENT_EVENTS_TOPIC", ""),
		AccessKey:     getEnv("ANYCAP_PAYMENT_EVENTS_ACCESS_KEY", ""),
		SecretKey:     getEnv("ANYCAP_PAYMENT_EVENTS_SECRET_KEY", ""),
		ConsumerGroup: getEnv("ANYCAP_PAYMENT_EVENTS_CONSUMER_GROUP", ""),
		BizID:         getEnv("ANYCAP_PAYMENT_EVENTS_BIZ_ID", ""),
		Tags:          splitCSVEnv("ANYCAP_PAYMENT_EVENTS_TAGS"),
	}
}

func loadCreditPacksConfig() ([]CreditPackConfig, error) {
	raw := strings.TrimSpace(os.Getenv("ANYCAP_CREDIT_PACKS_JSON"))
	if raw == "" {
		return nil, nil
	}

	var packs []CreditPackConfig
	if err := json.Unmarshal([]byte(raw), &packs); err != nil {
		return nil, fmt.Errorf("parse ANYCAP_CREDIT_PACKS_JSON: %w", err)
	}
	for i := range packs {
		pack := &packs[i]
		switch {
		case strings.TrimSpace(pack.ID) == "":
			return nil, fmt.Errorf("ANYCAP_CREDIT_PACKS_JSON pack id is required")
		case strings.TrimSpace(pack.Name) == "":
			return nil, fmt.Errorf("ANYCAP_CREDIT_PACKS_JSON pack name is required")
		case strings.TrimSpace(pack.PriceID) == "":
			return nil, fmt.Errorf("ANYCAP_CREDIT_PACKS_JSON price_id is required")
		case pack.PriceCent <= 0:
			return nil, fmt.Errorf("ANYCAP_CREDIT_PACKS_JSON price_cent must be positive")
		case pack.Credits <= 0:
			return nil, fmt.Errorf("ANYCAP_CREDIT_PACKS_JSON credits must be positive")
		}
		if strings.TrimSpace(pack.Currency) == "" {
			pack.Currency = "USD"
		}
	}
	return packs, nil
}

func loadRateLimitOverrides() map[string]int {
	overrides := make(map[string]int)
	for _, entry := range os.Environ() {
		key, raw, ok := strings.Cut(entry, "=")
		if !ok {
			continue
		}
		if key == "ANYCAP_RATE_LIMIT_RPM" {
			continue
		}
		if !strings.HasPrefix(key, rateLimitEnvPrefix) || !strings.HasSuffix(key, rateLimitEnvSuffix) {
			continue
		}

		value, err := strconv.Atoi(strings.TrimSpace(raw))
		if err != nil || value <= 0 {
			continue
		}

		name := strings.TrimSuffix(strings.TrimPrefix(key, rateLimitEnvPrefix), rateLimitEnvSuffix)
		if name == "" {
			continue
		}

		capability := strings.ToLower(strings.ReplaceAll(name, "_", "."))
		overrides[capability] = value
	}
	return overrides
}

func splitCSVEnv(key string) []string {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return nil
	}
	parts := strings.Split(raw, ",")
	values := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed == "" {
			continue
		}
		values = append(values, trimmed)
	}
	if len(values) == 0 {
		return nil
	}
	return values
}

func loadAgentPlatformConfig() AgentPlatformConfig {
	timeout := defaultAgentPlatformTimeout
	if s := os.Getenv("AGENT_PLATFORM_TIMEOUT_SECONDS"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			timeout = time.Duration(n) * time.Second
		}
	}

	return AgentPlatformConfig{
		BaseURL:  getEnv("AGENT_PLATFORM_BASE_URL", ""),
		APIKey:   getEnv("AGENT_PLATFORM_API_KEY", ""),
		TenantID: getEnv("AGENT_PLATFORM_TENANT_ID", "anycap"),
		Timeout:  timeout,
	}
}

func loadCloudS3Config() S3Config {
	expiry := defaultPresignExpiry
	if s := os.Getenv("ANYCAP_CLOUD_S3_PRESIGN_EXPIRY_SECONDS"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			expiry = n
		}
	}

	getExpiry := defaultPresignGetExpiry
	if s := os.Getenv("ANYCAP_CLOUD_S3_PRESIGN_GET_EXPIRY_SECONDS"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			getExpiry = n
		}
	}

	forcePathStyle := false
	if s := os.Getenv("ANYCAP_CLOUD_S3_FORCE_PATH_STYLE"); s == "true" || s == "1" {
		forcePathStyle = true
	}

	if expiry > maxPresignExpiry {
		expiry = maxPresignExpiry
	}
	if getExpiry > maxPresignGetExpiry {
		getExpiry = maxPresignGetExpiry
	}

	return S3Config{
		Endpoint:         getEnv("ANYCAP_CLOUD_S3_ENDPOINT", ""),
		AccessKeyID:      getEnv("ANYCAP_CLOUD_S3_ACCESS_KEY_ID", ""),
		SecretAccessKey:  getEnv("ANYCAP_CLOUD_S3_SECRET_ACCESS_KEY", ""),
		Bucket:           getEnv("ANYCAP_CLOUD_S3_BUCKET", "anycap-cloud"),
		Region:           getEnv("ANYCAP_CLOUD_S3_REGION", "auto"),
		PresignExpiry:    expiry,
		PresignGetExpiry: getExpiry,
		ForcePathStyle:   forcePathStyle,
	}
}

func (c Config) requiresExternalInfra() bool {
	switch strings.ToLower(c.RuntimeMode) {
	case "dev", "prod", "integration":
		return true
	default:
		return false
	}
}

func (c Config) postgresDSN() string {
	u := &url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(c.PGUser, c.PGPassword),
		Host:   net.JoinHostPort(c.PGHost, strconv.Itoa(c.PGPort)),
		Path:   c.PGDatabase,
	}
	query := u.Query()
	query.Set("sslmode", c.PGSSLMode)
	if c.PGTimezone != "" {
		query.Set("timezone", c.PGTimezone)
	}
	u.RawQuery = query.Encode()
	return u.String()
}

func (c Config) ResolveCapabilityRateLimitRPM(capability string) int {
	capability = strings.TrimSpace(strings.ToLower(capability))
	if capability != "" {
		if rpm, ok := c.RateLimitOverrides[capability]; ok && rpm > 0 {
			return rpm
		}
	}
	return c.RateLimitRPM
}

func (c Config) ResolvedNexusHubPlatformBaseURL() string {
	if c.NexusHubPlatformBaseURL != "" {
		return c.NexusHubPlatformBaseURL
	}
	return c.NexusHubBaseURL
}

func (c Config) ResolvedNexusHubPlatformToken() string {
	if c.NexusHubPlatformToken != "" {
		return c.NexusHubPlatformToken
	}
	return c.NexusHubToken
}

func (c Config) ResolvedNexusHubCoreBaseURL() string {
	if c.NexusHubCoreBaseURL != "" {
		return c.NexusHubCoreBaseURL
	}
	return c.NexusHubBaseURL
}

func (c Config) ResolvedNexusHubCoreToken() string {
	if c.NexusHubCoreToken != "" {
		return c.NexusHubCoreToken
	}
	return c.NexusHubToken
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func getEnvInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvInt64(key string, fallback int64) int64 {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvBool(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func clampEdgeGrantTTLSeconds(value int64) int64 {
	if value < minEdgeGrantTTLSeconds {
		return minEdgeGrantTTLSeconds
	}
	if value > maxEdgeGrantTTLSeconds {
		return maxEdgeGrantTTLSeconds
	}
	return value
}

func resolvePagePreviewHostFormat(pageHostFormat string, rawPreviewHostFormat string) string {
	if strings.TrimSpace(rawPreviewHostFormat) != "" {
		return model.NormalizePageHostFormat(rawPreviewHostFormat)
	}
	base := strings.TrimSpace(pageHostFormat)
	if base == "" {
		base = model.DefaultPageHostFormat
	}
	return model.NormalizePageHostFormat("preview-" + base)
}
