package page

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/application/security"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const (
	minPageNameLength    = 12
	pageNameRandomLength = 8
)

var slugRegex = regexp.MustCompile(`[^a-z0-9-]+`)

type Service struct {
	spaceService      port.SpaceService
	siteRepo          port.PageSiteRepository
	slugRepo          port.PageSlugRepository
	versionRepo       port.PageVersionRepository
	uploadSessionRepo port.UploadSessionRepository
	storageObjectRepo port.StorageObjectRepository
	objectStore       port.CloudObjectStore
	kvSyncJobRepo     port.KVSyncJobRepository
	kvSyncWaiter      port.KVSyncWaiter
	waitForKVSync     bool
	passwordPepper    string
	pageHostFormat    string
	now               func() time.Time
}

type ServiceOption func(*Service)

func NewService(spaceService port.SpaceService, siteRepo port.PageSiteRepository, slugRepo port.PageSlugRepository, passwordPepper string, options ...ServiceOption) *Service {
	service := &Service{
		spaceService:   spaceService,
		siteRepo:       siteRepo,
		slugRepo:       slugRepo,
		passwordPepper: passwordPepper,
		pageHostFormat: model.DefaultPageHostFormat,
		now: func() time.Time {
			return time.Now().UTC()
		},
	}
	for _, option := range options {
		if option != nil {
			option(service)
		}
	}
	return service
}

func WithVersioning(versionRepo port.PageVersionRepository, uploadSessionRepo port.UploadSessionRepository, storageObjectRepo port.StorageObjectRepository, objectStore port.CloudObjectStore) ServiceOption {
	return func(s *Service) {
		s.versionRepo = versionRepo
		s.uploadSessionRepo = uploadSessionRepo
		s.storageObjectRepo = storageObjectRepo
		s.objectStore = objectStore
	}
}

func WithKVSync(jobRepo port.KVSyncJobRepository, waiter port.KVSyncWaiter, waitForKVSync bool) ServiceOption {
	return func(s *Service) {
		s.kvSyncJobRepo = jobRepo
		s.kvSyncWaiter = waiter
		s.waitForKVSync = waitForKVSync
	}
}

func WithPageHostFormat(hostFormat string) ServiceOption {
	return func(s *Service) {
		s.pageHostFormat = model.NormalizePageHostFormat(hostFormat)
	}
}

func (s *Service) enqueueKVSyncJob(ctx context.Context, jobType string, targetID int64, edgeVersion int64, payload any) (int64, error) {
	if s == nil || s.kvSyncJobRepo == nil {
		return 0, nil
	}
	if targetID <= 0 {
		return 0, fmt.Errorf("kvsync target id must be greater than zero")
	}

	var rawPayload json.RawMessage
	if payload != nil {
		data, err := json.Marshal(payload)
		if err != nil {
			return 0, fmt.Errorf("marshal kvsync payload: %w", err)
		}
		rawPayload = data
	}

	job, err := s.kvSyncJobRepo.Create(ctx, model.KVSyncJob{
		JobType:     jobType,
		TargetID:    fmt.Sprintf("%d", targetID),
		EdgeVersion: edgeVersion,
		Payload:     rawPayload,
		Status:      model.KVSyncJobStatusPending,
		MaxAttempts: model.KVSyncJobDefaultMaxAttempts,
		NextRetryAt: s.now(),
	})
	if err != nil {
		return 0, err
	}
	if job == nil {
		return 0, fmt.Errorf("kvsync job create returned nil")
	}
	return job.ID, nil
}

func (s *Service) waitKVSyncJobs(ctx context.Context, jobIDs ...int64) error {
	if s == nil || !s.waitForKVSync || s.kvSyncWaiter == nil {
		return nil
	}
	filtered := make([]int64, 0, len(jobIDs))
	for _, id := range jobIDs {
		if id > 0 {
			filtered = append(filtered, id)
		}
	}
	if len(filtered) == 0 {
		return nil
	}
	return s.kvSyncWaiter.Wait(ctx, filtered)
}

func (s *Service) fillPageURL(site *model.PageSite) {
	if site != nil {
		site.PageURL = "https://" + model.FormatPageHostname(s.pageHostFormat, site.PageName)
	}
}

func (s *Service) fillPageURLs(sites []model.PageSite) {
	for i := range sites {
		s.fillPageURL(&sites[i])
	}
}

func (s *Service) CreateSite(ctx context.Context, userID, name string) (*model.PageSite, error) {
	if s == nil || s.spaceService == nil || s.siteRepo == nil || s.slugRepo == nil {
		return nil, fmt.Errorf("page service is not configured")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	for i := 0; i < 8; i++ {
		pageName, generateErr := generatePageName(name)
		if generateErr != nil {
			return nil, generateErr
		}

		site, createErr := s.siteRepo.Create(ctx, model.CreatePageSiteInput{
			SpaceID:     space.ID,
			Name:        fallbackSiteName(name),
			PageName:    pageName,
			AccessMode:  model.PageAccessModePublic,
			SPAFallback: false,
		})
		if createErr != nil {
			if isDuplicateError(createErr) {
				continue
			}
			return nil, createErr
		}

		if err := s.slugRepo.Create(ctx, pageName, site.ID); err != nil {
			_ = s.siteRepo.SoftDelete(ctx, space.ID, site.ID)
			if isDuplicateError(err) {
				continue
			}
			return nil, err
		}

		s.fillPageURL(site)
		return site, nil
	}

	return nil, fmt.Errorf("failed to allocate unique page name")
}

func (s *Service) ListSites(ctx context.Context, userID string) ([]model.PageSite, error) {
	if s == nil || s.spaceService == nil || s.siteRepo == nil {
		return nil, fmt.Errorf("page service is not configured")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	sites, err := s.siteRepo.ListBySpace(ctx, space.ID)
	if err != nil {
		return nil, err
	}
	s.fillPageURLs(sites)
	return sites, nil
}

func (s *Service) GetSite(ctx context.Context, userID string, siteID int64) (*model.PageSite, error) {
	if s == nil || s.spaceService == nil || s.siteRepo == nil {
		return nil, fmt.Errorf("page service is not configured")
	}
	if siteID <= 0 {
		return nil, fmt.Errorf("id must be greater than zero")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	site, err := s.siteRepo.GetByID(ctx, siteID)
	if err != nil {
		return nil, err
	}
	if site == nil || site.SpaceID != space.ID {
		return nil, fmt.Errorf("page site not found")
	}

	s.fillPageURL(site)
	return site, nil
}

func (s *Service) UpdateSite(ctx context.Context, userID string, input model.UpdatePageSiteInput) (*model.PageSite, error) {
	if s == nil || s.spaceService == nil || s.siteRepo == nil {
		return nil, fmt.Errorf("page service is not configured")
	}
	if input.ID <= 0 {
		return nil, fmt.Errorf("id must be greater than zero")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	existing, err := s.siteRepo.GetByID(ctx, input.ID)
	if err != nil {
		return nil, err
	}
	if existing == nil || existing.SpaceID != space.ID {
		return nil, fmt.Errorf("page site not found")
	}

	input.SpaceID = space.ID

	if input.Name != nil && strings.TrimSpace(*input.Name) == "" {
		return nil, fmt.Errorf("name is required")
	}
	if input.AccessMode != nil && !isValidAccessMode(*input.AccessMode) {
		return nil, fmt.Errorf("access_mode must be public, password or private_reserved")
	}

	if input.AccessMode != nil && *input.AccessMode == model.PageAccessModePublic {
		input.UpdatePassword = true
		input.PasswordHash = nil
		input.PasswordSalt = nil
	}

	if input.AccessMode != nil && *input.AccessMode == model.PageAccessModePassword && !input.UpdatePassword {
		if existing.PasswordHash == nil || existing.PasswordSalt == nil {
			return nil, fmt.Errorf("password is required when access_mode=password")
		}
	}

	if input.UpdatePassword {
		if input.AccessMode != nil && *input.AccessMode == model.PageAccessModePublic {
			// Explicit clear path.
		} else {
			if input.PasswordHash == nil {
				return nil, fmt.Errorf("password is required")
			}
			password := strings.TrimSpace(*input.PasswordHash)
			if password == "" {
				return nil, fmt.Errorf("password is required")
			}
			hash, salt, hashErr := security.HashPasswordPBKDF2SHA256(password, s.passwordPepper)
			if hashErr != nil {
				return nil, hashErr
			}
			input.PasswordHash = &hash
			input.PasswordSalt = &salt
		}
	}

	updatedSite, err := s.siteRepo.Update(ctx, input)
	if err != nil || updatedSite == nil {
		return updatedSite, err
	}

	jobID, err := s.enqueueKVSyncJob(ctx, model.KVSyncJobTypePageHostSync, updatedSite.ID, updatedSite.EdgeVersion, nil)
	if err != nil {
		return nil, err
	}
	if err := s.waitKVSyncJobs(ctx, jobID); err != nil {
		return nil, err
	}

	s.fillPageURL(updatedSite)
	return updatedSite, nil
}

func fallbackSiteName(name string) string {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return "Untitled Page"
	}
	return trimmed
}

func generatePageName(name string) (string, error) {
	base := normalizeSlug(name)
	if base == "" {
		base = "site"
	}
	if len(base) > 30 {
		base = strings.Trim(base[:30], "-")
	}
	if base == "" {
		base = "site"
	}

	suffix, err := randomString(pageNameRandomLength)
	if err != nil {
		return "", err
	}

	pageName := base + "-" + suffix
	for len(pageName) < minPageNameLength {
		extra, extraErr := randomString(1)
		if extraErr != nil {
			return "", extraErr
		}
		pageName += extra
	}
	return pageName, nil
}

func normalizeSlug(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = strings.ReplaceAll(value, "_", "-")
	value = strings.ReplaceAll(value, " ", "-")
	value = slugRegex.ReplaceAllString(value, "-")
	value = strings.Trim(value, "-")
	for strings.Contains(value, "--") {
		value = strings.ReplaceAll(value, "--", "-")
	}
	return value
}

func randomString(length int) (string, error) {
	if length <= 0 {
		return "", nil
	}

	const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
	buf := make([]byte, length)
	randomBytes := make([]byte, length)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", fmt.Errorf("generate random string: %w", err)
	}

	for i := 0; i < length; i++ {
		buf[i] = alphabet[int(randomBytes[i])%len(alphabet)]
	}
	return string(buf), nil
}

func isDuplicateError(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "duplicate") || strings.Contains(msg, "unique")
}

func isValidAccessMode(mode model.PageAccessMode) bool {
	switch mode {
	case model.PageAccessModePublic, model.PageAccessModePassword, model.PageAccessModePrivateReserved:
		return true
	default:
		return false
	}
}
