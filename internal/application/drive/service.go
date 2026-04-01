package drive

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const defaultDriveShareBaseURL = "https://drive.anycap.cloud/s"
const defaultDriveAccessBaseURL = "https://drive.anycap.cloud"

type ServiceOption func(*Service)

type Service struct {
	spaceService      port.SpaceService
	nodeRepo          port.DriveNodeRepository
	shareRepo         port.DriveShareRepository
	uploadSessionRepo port.UploadSessionRepository
	storageObjectRepo port.StorageObjectRepository
	objectStore       port.CloudObjectStore
	edgeGrantStore    port.EdgeGrantStore
	kvSyncJobRepo     port.KVSyncJobRepository
	kvSyncWaiter      port.KVSyncWaiter
	waitForKVSync     bool
	passwordPepper    string
	shareBaseURL      string
	accessBaseURL     string
	accessTTLSeconds  int64
	now               func() time.Time
}

func NewService(spaceService port.SpaceService, nodeRepo port.DriveNodeRepository, options ...ServiceOption) *Service {
	svc := &Service{
		spaceService:     spaceService,
		nodeRepo:         nodeRepo,
		shareBaseURL:     defaultDriveShareBaseURL,
		accessBaseURL:    defaultDriveAccessBaseURL,
		accessTTLSeconds: 300,
		now: func() time.Time {
			return time.Now().UTC()
		},
	}
	for _, option := range options {
		if option != nil {
			option(svc)
		}
	}
	return svc
}

func WithShare(repo port.DriveShareRepository, passwordPepper, shareBaseURL string) ServiceOption {
	return func(s *Service) {
		s.shareRepo = repo
		s.passwordPepper = passwordPepper
		if strings.TrimSpace(shareBaseURL) != "" {
			s.shareBaseURL = strings.TrimRight(strings.TrimSpace(shareBaseURL), "/")
		}
	}
}

func WithUpload(uploadSessionRepo port.UploadSessionRepository, storageObjectRepo port.StorageObjectRepository, objectStore port.CloudObjectStore) ServiceOption {
	return func(s *Service) {
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

func WithEdgeAccess(grantStore port.EdgeGrantStore, ttlSeconds int64, accessBaseURL string) ServiceOption {
	return func(s *Service) {
		s.edgeGrantStore = grantStore
		if ttlSeconds > 0 {
			s.accessTTLSeconds = ttlSeconds
		}
		if strings.TrimSpace(accessBaseURL) != "" {
			s.accessBaseURL = strings.TrimRight(strings.TrimSpace(accessBaseURL), "/")
		}
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

func (s *Service) CreateFolder(ctx context.Context, userID int64, parentID *int64, name string) (*model.DriveNode, error) {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil {
		return nil, fmt.Errorf("drive service is not configured")
	}
	if strings.TrimSpace(name) == "" {
		return nil, fmt.Errorf("name is required")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	if err := s.ensureValidParent(ctx, space.ID, parentID, false); err != nil {
		return nil, err
	}

	created, err := s.nodeRepo.CreateFolder(ctx, model.CreateDriveFolderInput{
		SpaceID:   space.ID,
		ParentID:  parentID,
		Name:      name,
		CreatedBy: strconv.FormatInt(userID, 10),
	})
	if err != nil {
		return nil, err
	}

	dirMetaJobID, err := s.enqueueDriveDirMetaSync(ctx, created)
	if err != nil {
		return nil, err
	}
	var childrenJobID int64
	if created.ParentID != nil {
		childrenJobID, err = s.enqueueDriveDirChildrenSync(ctx, *created.ParentID)
		if err != nil {
			return nil, err
		}
	}
	if err := s.waitKVSyncJobs(ctx, dirMetaJobID, childrenJobID); err != nil {
		return nil, err
	}

	return created, nil
}

func (s *Service) ListNodes(ctx context.Context, userID int64, parentID *int64, filter model.ListDriveNodesFilter) ([]model.DriveNode, int, error) {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil {
		return nil, 0, fmt.Errorf("drive service is not configured")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, 0, err
	}

	if err := s.ensureValidParent(ctx, space.ID, parentID, false); err != nil {
		return nil, 0, err
	}

	filter.SpaceID = space.ID
	filter.ParentID = parentID
	return s.nodeRepo.ListByParent(ctx, filter)
}

func (s *Service) UpdateNode(ctx context.Context, userID int64, nodeID int64, name *string, parentID *int64, updateParent bool) (*model.DriveNode, error) {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil {
		return nil, fmt.Errorf("drive service is not configured")
	}
	if nodeID <= 0 {
		return nil, fmt.Errorf("id must be greater than zero")
	}
	if name == nil && !updateParent {
		return nil, fmt.Errorf("at least one field must be updated")
	}
	if name != nil && strings.TrimSpace(*name) == "" {
		return nil, fmt.Errorf("name is required")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	node, err := s.nodeRepo.GetByID(ctx, nodeID)
	if err != nil {
		return nil, err
	}
	if node == nil || node.SpaceID != space.ID {
		return nil, fmt.Errorf("drive node not found")
	}

	if updateParent {
		if err := s.ensureValidDestinationParent(ctx, space.ID, node, parentID); err != nil {
			return nil, err
		}
	}

	updated, err := s.nodeRepo.Update(ctx, model.UpdateDriveNodeInput{
		ID:           nodeID,
		SpaceID:      space.ID,
		Name:         name,
		ParentID:     parentID,
		UpdateParent: updateParent,
	})
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, fmt.Errorf("drive node not found")
	}

	jobIDs := make([]int64, 0, 4)
	if updated.Kind == model.DriveNodeKindFolder {
		jobID, syncErr := s.enqueueDriveDirMetaSync(ctx, updated)
		if syncErr != nil {
			return nil, syncErr
		}
		if jobID > 0 {
			jobIDs = append(jobIDs, jobID)
		}
	} else {
		jobID, syncErr := s.enqueueDriveFileMetaSync(ctx, updated, nil)
		if syncErr != nil {
			return nil, syncErr
		}
		if jobID > 0 {
			jobIDs = append(jobIDs, jobID)
		}
	}

	if updateParent {
		if node.ParentID != nil {
			jobID, syncErr := s.enqueueDriveDirChildrenSync(ctx, *node.ParentID)
			if syncErr != nil {
				return nil, syncErr
			}
			if jobID > 0 {
				jobIDs = append(jobIDs, jobID)
			}
		}
		if updated.ParentID != nil && (node.ParentID == nil || *node.ParentID != *updated.ParentID) {
			jobID, syncErr := s.enqueueDriveDirChildrenSync(ctx, *updated.ParentID)
			if syncErr != nil {
				return nil, syncErr
			}
			if jobID > 0 {
				jobIDs = append(jobIDs, jobID)
			}
		}
	}

	if err := s.waitKVSyncJobs(ctx, jobIDs...); err != nil {
		return nil, err
	}

	return updated, nil
}

func (s *Service) DeleteNode(ctx context.Context, userID int64, nodeID int64) (int64, error) {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil {
		return 0, fmt.Errorf("drive service is not configured")
	}
	if nodeID <= 0 {
		return 0, fmt.Errorf("id must be greater than zero")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return 0, err
	}

	node, err := s.nodeRepo.GetByID(ctx, nodeID)
	if err != nil {
		return 0, err
	}
	if node == nil || node.SpaceID != space.ID {
		return 0, fmt.Errorf("drive node not found")
	}

	var (
		dirIDs  []int64
		fileIDs []int64
	)
	if node.Kind == model.DriveNodeKindFolder {
		dirIDs, fileIDs, err = s.collectDriveSubtreeNodeIDs(ctx, space.ID, node.ID)
		if err != nil {
			return 0, err
		}
	}

	deletedCount, err := s.nodeRepo.SoftDeleteSubtree(ctx, space.ID, nodeID)
	if err != nil {
		return 0, err
	}

	jobIDs := make([]int64, 0, 3)
	if node.Kind == model.DriveNodeKindFolder {
		jobID, syncErr := s.enqueueKVSyncJob(ctx, model.KVSyncJobTypeDriveDirTreeDelete, node.ID, node.EdgeVersion+1, model.KVSyncDriveDirTreeDeletePayload{
			RootID:  node.ID,
			DirIDs:  dirIDs,
			FileIDs: fileIDs,
		})
		if syncErr != nil {
			return 0, syncErr
		}
		if jobID > 0 {
			jobIDs = append(jobIDs, jobID)
		}
	} else {
		jobID, syncErr := s.enqueueDriveFileMetaSync(ctx, node, nil)
		if syncErr != nil {
			return 0, syncErr
		}
		if jobID > 0 {
			jobIDs = append(jobIDs, jobID)
		}
	}
	if node.ParentID != nil {
		jobID, syncErr := s.enqueueDriveDirChildrenSync(ctx, *node.ParentID)
		if syncErr != nil {
			return 0, syncErr
		}
		if jobID > 0 {
			jobIDs = append(jobIDs, jobID)
		}
	}
	if err := s.waitKVSyncJobs(ctx, jobIDs...); err != nil {
		return 0, err
	}

	return deletedCount, nil
}

func (s *Service) ensureValidParent(ctx context.Context, spaceID int64, parentID *int64, destination bool) error {
	if parentID == nil {
		return nil
	}
	parent, err := s.nodeRepo.GetByID(ctx, *parentID)
	if err != nil {
		return err
	}
	if parent == nil || parent.SpaceID != spaceID {
		if destination {
			return fmt.Errorf("destination parent not found")
		}
		return fmt.Errorf("parent node not found")
	}
	if parent.Kind != model.DriveNodeKindFolder {
		if destination {
			return fmt.Errorf("destination parent must be a folder")
		}
		return fmt.Errorf("parent node must be a folder")
	}
	return nil
}

func (s *Service) ensureValidDestinationParent(ctx context.Context, spaceID int64, node *model.DriveNode, parentID *int64) error {
	if parentID == nil {
		return nil
	}
	if node == nil {
		return fmt.Errorf("drive node not found")
	}
	if *parentID == node.ID {
		return fmt.Errorf("cannot move node to itself")
	}
	if err := s.ensureValidParent(ctx, spaceID, parentID, true); err != nil {
		return err
	}
	if node.Kind == model.DriveNodeKindFolder {
		inSubtree, err := s.nodeRepo.ExistsInSubtree(ctx, spaceID, node.ID, *parentID)
		if err != nil {
			return err
		}
		if inSubtree {
			return fmt.Errorf("cannot move folder into its subtree")
		}
	}
	return nil
}
