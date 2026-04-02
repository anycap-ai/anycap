# consts

Shared constants across common-go packages.

```go
import "gitlab.knoffice.tech/open/common-go/consts"
```

## Environments

```go
consts.Env_Dev   // "dev"
consts.Env_Test  // "test"
consts.Env_Prod  // "prod"
```

## Environment Variables

```go
consts.EnvVar_Env  // "ENV"

// Nacos dynamic config
consts.EnvVar_DConf_Nacos_Host        // "DCONF_NACOS_HOST"
consts.EnvVar_DConf_Nacos_Port        // "DCONF_NACOS_PORT"
consts.EnvVar_DConf_Nacos_Namespace   // "DCONF_NACOS_NAMESPACE"
consts.EnvVar_DConf_Nacos_ContextPath // "DCONF_NACOS_CONTEXT_PATH"
consts.EnvVar_DConf_Nacos_TimeoutMs   // "DCONF_NACOS_TIMEOUT_MS"
```

## HTTP Headers

```go
consts.Header_BizToken   // "X-Biz-Token"
consts.Header_AdminToken // "X-Admin-Token"
consts.Header_TraceID    // "X-Trace-ID"
```

## Request Context Keys

```go
consts.RequestContextKey_IsAdmin  // "is_admin"
consts.RequestContextKey_BizID    // "biz_id"
```

## Logging Fields

```go
consts.LoggingField_TraceID  // "trace_id"
```

## Kitex MetaInfo Keys

```go
consts.MetaInfoKey_TraceID  // "trace_id"
```

## Other

```go
consts.BizID_Unknown  // "unknown"
```
