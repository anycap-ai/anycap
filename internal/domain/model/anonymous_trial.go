package model

import "time"

type AnonymousTrialState struct {
	Key     string
	Count   int
	Limit   int
	ResetAt time.Time
	Allowed bool
}
