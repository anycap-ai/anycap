package capabilities

import (
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const (
	capabilityImageRead = "image_read"
	capabilityVideoRead = "video_read"
	capabilityAudioRead = "audio_read"
)

type Service struct {
	provider             port.CapabilitiesProvider
	objectStore          port.CloudObjectStore
	credit               port.CreditClient
	callLogs             port.CallLogRepo
	spaceService         port.SpaceService
	capsUploadRepo       port.CapsUploadRepository
	storageObjectRepo    port.StorageObjectRepository
	capsTaskRepo         port.CapsTaskRepository
	capsTaskArtifactRepo port.CapsTaskArtifactRepository
	presignGetExpiry     time.Duration
	now                  func() time.Time
}

type ServiceOption func(*Service)

func WithAudit(
	spaceService port.SpaceService,
	capsUploadRepo port.CapsUploadRepository,
	storageObjectRepo port.StorageObjectRepository,
	capsTaskRepo port.CapsTaskRepository,
	capsTaskArtifactRepo port.CapsTaskArtifactRepository,
) ServiceOption {
	return func(s *Service) {
		s.spaceService = spaceService
		s.capsUploadRepo = capsUploadRepo
		s.storageObjectRepo = storageObjectRepo
		s.capsTaskRepo = capsTaskRepo
		s.capsTaskArtifactRepo = capsTaskArtifactRepo
	}
}

func WithPresignGetExpiry(expiry time.Duration) ServiceOption {
	return func(s *Service) {
		if expiry > 0 {
			s.presignGetExpiry = expiry
		}
	}
}

func NewService(provider port.CapabilitiesProvider, objectStore port.CloudObjectStore, options ...ServiceOption) *Service {
	svc := &Service{
		provider:         provider,
		objectStore:      objectStore,
		presignGetExpiry: time.Hour,
		now:              time.Now,
	}
	for _, option := range options {
		if option != nil {
			option(svc)
		}
	}
	return svc
}

func (s *Service) SetCreditClient(credit port.CreditClient) {
	s.credit = credit
}

func (s *Service) SetCallLogRepo(callLogs port.CallLogRepo) {
	s.callLogs = callLogs
}

func (s *Service) auditEnabled() bool {
	if s == nil {
		return false
	}
	return s.spaceService != nil && s.capsUploadRepo != nil && s.storageObjectRepo != nil && s.capsTaskRepo != nil && s.capsTaskArtifactRepo != nil && s.objectStore != nil
}
