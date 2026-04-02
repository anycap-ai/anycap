# bizhelper

Business context management for multi-tenant applications.

```go
import "gitlab.knoffice.tech/open/common-go/bizhelper"
```

## Initialization

```go
bizhelper.Init([]bizhelper.BizConfig{
	{
		ID:    "biz-a",
		Token: "token-a",
		UserIDRanges: []bizhelper.UserIDRange{
			{MinUserID: ptr(1000), MaxUserID: ptr(2000)},
		},
		MixpanelToken:    "mp-token",
		GA4MeasurementID: "G-XXXXX",
		GA4APISecret:     "secret",
	},
	{
		ID:    "biz-b",
		Token: "token-b",
		UserIDRanges: []bizhelper.UserIDRange{
			{MinUserID: ptr(2000), MaxUserID: ptr(3000)},
		},
	},
})
```

## BizConfig Fields

| Field | Description |
|-------|-------------|
| `ID` | Unique business identifier |
| `Token` | Authentication token |
| `UserIDRanges` | List of user ID ranges `[min, max)` |
| `MinUserID/MaxUserID` | Legacy single range (deprecated) |
| `LarkWebhookURL` | Lark notification URL |
| `LarkWebhookSecret` | Lark webhook secret |
| `MixpanelToken` | Mixpanel project token |
| `GA4MeasurementID` | GA4 measurement ID |
| `GA4APISecret` | GA4 API secret |

## Lookup Functions

```go
// Get config by ID
config, err := bizhelper.GetBizConfig("biz-a")

// Get ID by token
bizID, err := bizhelper.GetIDByToken("token-a")

// Check if biz exists
exists := bizhelper.BizExists("biz-a")

// Get all biz IDs
ids := bizhelper.GetBizIDs()  // []string{"biz-a", "biz-b"}
```

## User ID Validation

```go
// Validate user belongs to business
err := bizhelper.ValidateUserID("biz-a", 1500)  // nil (valid)
err := bizhelper.ValidateUserID("biz-a", 2500)  // error (out of range)

// Find business by user ID
bizID, err := bizhelper.GetBizIDByUserID(1500)  // "biz-a"
```
