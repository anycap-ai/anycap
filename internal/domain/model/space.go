package model

import "time"

const DefaultPersonalSpaceName = "Personal Space"

type Space struct {
	ID               int64
	OwnerUserID      int64
	Name             string
	StorageUsedBytes int64
	DriveNodeCount   int
	PageSiteCount    int
	CreatedAt        time.Time
}
