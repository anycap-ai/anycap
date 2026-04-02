package model

import "math"

const USDPerCredit = 0.02

func CreditsFromUSD(usd float64) int64 {
	if usd <= 0 {
		return 1
	}
	credits := int64(math.Ceil(usd / USDPerCredit))
	if credits < 1 {
		return 1
	}
	return credits
}
