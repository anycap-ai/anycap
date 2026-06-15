package login

import "crypto/rand"

const (
	deviceUserCodeCharset     = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	deviceUserCodeRawLength   = 8
	deviceUserCodeGroupLength = 4
)

func defaultDeviceUserCode() string {
	raw := randomDeviceUserCodeRaw()
	return raw[:deviceUserCodeGroupLength] + "-" + raw[deviceUserCodeGroupLength:]
}

func randomDeviceUserCodeRaw() string {
	out := make([]byte, 0, deviceUserCodeRawLength)
	rejectFloor := 256 - (256 % len(deviceUserCodeCharset))
	buf := make([]byte, deviceUserCodeRawLength*2)

	for len(out) < deviceUserCodeRawLength {
		if _, err := rand.Read(buf); err != nil {
			for len(out) < deviceUserCodeRawLength {
				out = append(out, 'A')
			}
			break
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

	return string(out)
}
