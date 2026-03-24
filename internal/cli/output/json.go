package output

import (
	"fmt"
	"io"
)

func WriteJSON(w io.Writer, payload []byte) error {
	if _, err := fmt.Fprintln(w, string(payload)); err != nil {
		return err
	}

	return nil
}
