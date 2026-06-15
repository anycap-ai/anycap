package login

import "crypto/rand"

const (
	deviceUserCodeCharset   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	deviceUserCodeRawLength = 8
)

func defaultDeviceUserCode() (string, error) {
	return randomDeviceUserCodeRaw()
}

func randomDeviceUserCodeRaw() (string, error) {
	out := make([]byte, 0, deviceUserCodeRawLength)
	rejectFloor := 256 - (256 % len(deviceUserCodeCharset))
	buf := make([]byte, deviceUserCodeRawLength*2)

	for len(out) < deviceUserCodeRawLength {
		if _, err := rand.Read(buf); err != nil {
			return "", err
		}
		for _, b := range buf {
			if int(b) >= rejectFloor {
				continue
			}
			out = append(out, deviceUserCodeCharset[int(b)%len(deviceUserCodeCharset)])
			if len(out) == deviceUserCodeRawLength {
				break
			}
		}
	}

	return string(out), nil
}
