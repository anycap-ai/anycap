package buildinfo

import "gitlab.knoffice.tech/engineering/anycap/pkg/version"

var (
	Version = version.DefaultVersion
	Commit  = version.UnknownCommit
	Date    = version.UnknownDate
)

type Info struct {
	Version string `json:"version"`
	Commit  string `json:"commit"`
	Date    string `json:"build_date"`
}

func Current() Info {
	return Info{
		Version: Version,
		Commit:  Commit,
		Date:    Date,
	}
}
