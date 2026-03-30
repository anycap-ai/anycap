package page

import (
	"context"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakePageSpaceService struct {
	space *model.Space
}

func (s *fakePageSpaceService) GetOrCreatePersonalSpace(_ context.Context, _ string) (*model.Space, error) {
	return s.space, nil
}

type fakePageSiteRepo struct {
	sites      map[int64]*model.PageSite
	nextID     int64
	byPageName map[string]int64
}

func (r *fakePageSiteRepo) Create(_ context.Context, input model.CreatePageSiteInput) (*model.PageSite, error) {
	if r.sites == nil {
		r.sites = map[int64]*model.PageSite{}
	}
	if r.byPageName == nil {
		r.byPageName = map[string]int64{}
	}
	if _, exists := r.byPageName[input.PageName]; exists {
		return nil, errDuplicate
	}

	r.nextID++
	now := time.Now().UTC()
	site := &model.PageSite{
		ID:           r.nextID,
		SpaceID:      input.SpaceID,
		Name:         input.Name,
		PageName:     input.PageName,
		AccessMode:   input.AccessMode,
		PasswordHash: input.PasswordHash,
		PasswordSalt: input.PasswordSalt,
		SPAFallback:  input.SPAFallback,
		EdgeVersion:  1,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	r.sites[site.ID] = site
	r.byPageName[site.PageName] = site.ID
	return clonePageSite(site), nil
}

func (r *fakePageSiteRepo) ListBySpace(_ context.Context, filter model.ListPageSitesFilter) ([]model.PageSite, int, error) {
	items := make([]model.PageSite, 0)
	for _, site := range r.sites {
		if site.SpaceID != filter.SpaceID || site.DeletedAt != nil {
			continue
		}
		if filter.Name != nil && site.Name != *filter.Name {
			continue
		}
		items = append(items, *clonePageSite(site))
	}
	total := len(items)
	// Apply offset/limit
	if filter.Offset >= len(items) {
		return []model.PageSite{}, total, nil
	}
	end := filter.Offset + filter.Limit
	if end > len(items) {
		end = len(items)
	}
	return items[filter.Offset:end], total, nil
}

func (r *fakePageSiteRepo) GetByID(_ context.Context, id int64) (*model.PageSite, error) {
	site, ok := r.sites[id]
	if !ok || site.DeletedAt != nil {
		return nil, nil
	}
	return clonePageSite(site), nil
}

func (r *fakePageSiteRepo) Update(_ context.Context, input model.UpdatePageSiteInput) (*model.PageSite, error) {
	site, ok := r.sites[input.ID]
	if !ok || site.DeletedAt != nil || site.SpaceID != input.SpaceID {
		return nil, nil
	}

	if input.Name != nil {
		site.Name = *input.Name
	}
	if input.AccessMode != nil {
		site.AccessMode = *input.AccessMode
	}
	if input.SPAFallback != nil {
		site.SPAFallback = *input.SPAFallback
	}
	if input.ShowBadge != nil {
		site.ShowBadge = *input.ShowBadge
	}
	if input.UpdatePassword {
		site.PasswordHash = input.PasswordHash
		site.PasswordSalt = input.PasswordSalt
	}
	site.EdgeVersion++
	site.UpdatedAt = time.Now().UTC()
	return clonePageSite(site), nil
}

func (r *fakePageSiteRepo) SetCurrentVersion(_ context.Context, spaceID, id int64, versionID *int64) (*model.PageSite, error) {
	site, ok := r.sites[id]
	if !ok || site.DeletedAt != nil || site.SpaceID != spaceID {
		return nil, nil
	}
	if versionID == nil {
		site.CurrentVersionID = nil
	} else {
		value := *versionID
		site.CurrentVersionID = &value
	}
	site.EdgeVersion++
	site.UpdatedAt = time.Now().UTC()
	return clonePageSite(site), nil
}

func (r *fakePageSiteRepo) SoftDelete(_ context.Context, spaceID, id int64) error {
	site, ok := r.sites[id]
	if !ok || site.SpaceID != spaceID || site.DeletedAt != nil {
		return nil
	}
	now := time.Now().UTC()
	site.DeletedAt = &now
	site.UpdatedAt = now
	site.EdgeVersion++
	return nil
}

type fakePageSlugRepo struct {
	slugs map[string]int64
}

func (r *fakePageSlugRepo) Create(_ context.Context, slug string, pageID int64) error {
	if r.slugs == nil {
		r.slugs = map[string]int64{}
	}
	if _, exists := r.slugs[slug]; exists {
		return errDuplicate
	}
	r.slugs[slug] = pageID
	return nil
}

func (r *fakePageSlugRepo) MarkTombstone(_ context.Context, _ string, _ int64) error {
	return nil
}

type fakePageKVSyncJobRepo struct {
	nextID int64
	jobs   []model.KVSyncJob
}

func (r *fakePageKVSyncJobRepo) Create(_ context.Context, job model.KVSyncJob) (*model.KVSyncJob, error) {
	r.nextID++
	created := job
	created.ID = r.nextID
	r.jobs = append(r.jobs, created)
	return &created, nil
}

func (r *fakePageKVSyncJobRepo) GetByID(_ context.Context, id int64) (*model.KVSyncJob, error) {
	for i := range r.jobs {
		if r.jobs[i].ID == id {
			job := r.jobs[i]
			return &job, nil
		}
	}
	return nil, nil
}

type fakePageKVSyncWaiter struct {
	waited [][]int64
}

func (w *fakePageKVSyncWaiter) Wait(_ context.Context, jobIDs []int64) error {
	cloned := make([]int64, len(jobIDs))
	copy(cloned, jobIDs)
	w.waited = append(w.waited, cloned)
	return nil
}

var errDuplicate = &duplicateError{}

type duplicateError struct{}

func (e *duplicateError) Error() string { return "duplicate value" }

func TestCreateSite_GeneratesPageNameAndSlug(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: "u-1"}
	siteRepo := &fakePageSiteRepo{}
	slugRepo := &fakePageSlugRepo{}
	service := NewService(&fakePageSpaceService{space: space}, siteRepo, slugRepo, "")

	site, err := service.CreateSite(context.Background(), "u-1", "Docs Center")
	if err != nil {
		t.Fatalf("CreateSite() error = %v", err)
	}

	if !strings.HasPrefix(site.PageName, "docs-center-") {
		t.Fatalf("expected page name prefix docs-center-, got %q", site.PageName)
	}
	if len(site.PageName) < minPageNameLength {
		t.Fatalf("expected page name length >= %d, got %d (%q)", minPageNameLength, len(site.PageName), site.PageName)
	}
	if slugRepo.slugs[site.PageName] != site.ID {
		t.Fatalf("expected slug registry to include %q -> %d", site.PageName, site.ID)
	}
}

func TestUpdateSite_SetPasswordHashesWithPepper(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: "u-1"}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {
				ID:         1,
				SpaceID:    200,
				Name:       "My Site",
				PageName:   "my-site-abc12345",
				AccessMode: model.PageAccessModePublic,
			},
		},
	}
	slugRepo := &fakePageSlugRepo{}
	service := NewService(&fakePageSpaceService{space: space}, siteRepo, slugRepo, "pepper-xyz")

	mode := model.PageAccessModePassword
	password := "secret-123"
	updated, err := service.UpdateSite(context.Background(), "u-1", model.UpdatePageSiteInput{
		ID:             1,
		AccessMode:     &mode,
		UpdatePassword: true,
		PasswordHash:   &password,
	})
	if err != nil {
		t.Fatalf("UpdateSite() error = %v", err)
	}
	if updated.AccessMode != model.PageAccessModePassword {
		t.Fatalf("expected access mode password, got %s", updated.AccessMode)
	}
	if updated.PasswordHash == nil || updated.PasswordSalt == nil {
		t.Fatal("expected password hash and salt to be set")
	}
	if strings.Contains(*updated.PasswordHash, password) {
		t.Fatalf("expected password hash not to contain raw password, got %q", *updated.PasswordHash)
	}
	if !strings.HasPrefix(*updated.PasswordHash, "pbkdf2_sha256$100000$v1$") {
		t.Fatalf("expected hash format prefix, got %q", *updated.PasswordHash)
	}
}

func TestUpdateSite_PublicModeClearsPassword(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: "u-1"}
	hash := "pbkdf2_sha256$100000$v1$abc"
	salt := "salt"
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {
				ID:           1,
				SpaceID:      200,
				Name:         "My Site",
				PageName:     "my-site-abc12345",
				AccessMode:   model.PageAccessModePassword,
				PasswordHash: &hash,
				PasswordSalt: &salt,
			},
		},
	}
	slugRepo := &fakePageSlugRepo{}
	service := NewService(&fakePageSpaceService{space: space}, siteRepo, slugRepo, "pepper-xyz")

	mode := model.PageAccessModePublic
	updated, err := service.UpdateSite(context.Background(), "u-1", model.UpdatePageSiteInput{
		ID:         1,
		AccessMode: &mode,
	})
	if err != nil {
		t.Fatalf("UpdateSite() error = %v", err)
	}
	if updated.AccessMode != model.PageAccessModePublic {
		t.Fatalf("expected access mode public, got %s", updated.AccessMode)
	}
	if updated.PasswordHash != nil || updated.PasswordSalt != nil {
		t.Fatal("expected password hash/salt to be cleared in public mode")
	}
}

func TestUpdateSite_PasswordModeRequiresPasswordWhenUnset(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: "u-1"}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {
				ID:         1,
				SpaceID:    200,
				Name:       "My Site",
				PageName:   "my-site-abc12345",
				AccessMode: model.PageAccessModePublic,
			},
		},
	}
	slugRepo := &fakePageSlugRepo{}
	service := NewService(&fakePageSpaceService{space: space}, siteRepo, slugRepo, "pepper-xyz")

	mode := model.PageAccessModePassword
	_, err := service.UpdateSite(context.Background(), "u-1", model.UpdatePageSiteInput{
		ID:         1,
		AccessMode: &mode,
	})
	if err == nil || !strings.Contains(err.Error(), "password is required") {
		t.Fatalf("expected password required error, got %v", err)
	}
}

func TestUpdateSite_EnqueuePageHostSyncJob(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: "u-1"}
	versionID := int64(10)
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {
				ID:               1,
				SpaceID:          200,
				Name:             "My Site",
				PageName:         "my-site-abc12345",
				AccessMode:       model.PageAccessModePublic,
				CurrentVersionID: &versionID,
			},
		},
	}
	jobRepo := &fakePageKVSyncJobRepo{}
	waiter := &fakePageKVSyncWaiter{}
	service := NewService(
		&fakePageSpaceService{space: space},
		siteRepo,
		&fakePageSlugRepo{},
		"pepper-xyz",
		WithKVSync(jobRepo, waiter, true),
	)

	spaFallback := true
	updated, err := service.UpdateSite(context.Background(), "u-1", model.UpdatePageSiteInput{
		ID:          1,
		SPAFallback: &spaFallback,
	})
	if err != nil {
		t.Fatalf("UpdateSite() error = %v", err)
	}
	if !updated.SPAFallback {
		t.Fatal("expected spa_fallback=true after update")
	}

	if len(jobRepo.jobs) != 1 {
		t.Fatalf("expected one kvsync job, got %d", len(jobRepo.jobs))
	}
	job := jobRepo.jobs[0]
	if job.JobType != model.KVSyncJobTypePageHostSync {
		t.Fatalf("expected job type %q, got %q", model.KVSyncJobTypePageHostSync, job.JobType)
	}
	if job.TargetID != "1" {
		t.Fatalf("expected target id 1, got %q", job.TargetID)
	}
	if job.EdgeVersion != updated.EdgeVersion {
		t.Fatalf("expected edge version %d, got %d", updated.EdgeVersion, job.EdgeVersion)
	}

	if len(waiter.waited) != 1 {
		t.Fatalf("expected waiter called once, got %d", len(waiter.waited))
	}
	if len(waiter.waited[0]) != 1 || waiter.waited[0][0] != job.ID {
		t.Fatalf("expected waiter job ids [%d], got %+v", job.ID, waiter.waited[0])
	}
}

func clonePageSite(site *model.PageSite) *model.PageSite {
	if site == nil {
		return nil
	}
	cloned := *site
	if site.CurrentVersionID != nil {
		v := *site.CurrentVersionID
		cloned.CurrentVersionID = &v
	}
	if site.PasswordHash != nil {
		v := *site.PasswordHash
		cloned.PasswordHash = &v
	}
	if site.PasswordSalt != nil {
		v := *site.PasswordSalt
		cloned.PasswordSalt = &v
	}
	if site.DeletedAt != nil {
		v := *site.DeletedAt
		cloned.DeletedAt = &v
	}
	return &cloned
}
