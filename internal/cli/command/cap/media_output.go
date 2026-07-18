package cap

import (
	"fmt"
	"path"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/fileutil"
)

func mediaOutputPath(prefix, userPath, outputURL, timestamp string, index, total int, fallbackExt string) string {
	extension := path.Ext(fileutil.FilenameFromURL(outputURL))
	if extension == "" {
		extension = fallbackExt
	}
	if total == 1 && userPath != "" {
		return userPath
	}
	if userPath != "" {
		userExtension := path.Ext(userPath)
		base := strings.TrimSuffix(userPath, userExtension)
		if userExtension == "" {
			userExtension = extension
		}
		return fmt.Sprintf("%s_%d%s", base, index+1, userExtension)
	}
	if total == 1 {
		return prefix + "_" + timestamp + extension
	}
	return fmt.Sprintf("%s_%s_%d%s", prefix, timestamp, index+1, extension)
}
