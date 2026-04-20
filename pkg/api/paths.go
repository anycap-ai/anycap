package api

import (
	"fmt"
	"net/url"
)

// --- Capability operation endpoints ---

// OperationPath returns POST /v1/{capability}/{operation}.
// Example: OperationPath("image", "edit") -> "/v1/image/edit"
func OperationPath(capability, operation string) string {
	return fmt.Sprintf("/v1/%s/%s", capability, operation)
}

// GeneratePath returns POST /v1/{capability}/generate.
func GeneratePath(capability string) string {
	return OperationPath(capability, "generate")
}

// --- Model catalog endpoints ---

// ModelsPath returns GET /v1/{capability}/models.
func ModelsPath(capability string) string {
	return fmt.Sprintf("/v1/%s/models", capability)
}

// ModelSchemaPath returns GET /v1/{capability}/models/{model}/schema.
func ModelSchemaPath(capability, model string) string {
	return fmt.Sprintf("/v1/%s/models/%s/schema", capability, url.PathEscape(model))
}

// --- Capability read endpoints ---

// CapabilityReadPath returns POST /v1/capabilities/{capType}/read.
func CapabilityReadPath(capType string) string {
	return fmt.Sprintf("/v1/capabilities/%s/read", capType)
}

// PresignPath is POST /v1/capabilities/presign.
const PresignPath = "/v1/capabilities/presign"

// --- Feature endpoints ---

// FeaturesPath is GET /v1/features (public, no auth).
const FeaturesPath = "/v1/features"

// MeFeaturesPath is GET /v1/me/features (auth required).
const MeFeaturesPath = "/v1/me/features"

// StatusPath is GET /v1/status (auth required).
const StatusPath = "/v1/status"

// --- Drive endpoints ---

const (
	DriveNodesPath       = "/v1/drive/nodes"
	DriveFoldersPath     = "/v1/drive/folders"
	DriveFilesPresign    = "/v1/drive/files/presign"
	DriveFilesComplete   = "/v1/drive/files/complete"
	DriveResolvePathBase = "/v1/drive/resolve-path"
)

// DriveResolvePath returns GET /v1/drive/resolve-path?path={absolutePath}.
func DriveResolvePath(nodePath string) string {
	return DriveResolvePathBase + "?path=" + url.QueryEscape(nodePath)
}

// DriveNodePath returns /v1/drive/nodes/{nodeID}.
func DriveNodePath(nodeID string) string {
	return DriveNodesPath + "/" + url.PathEscape(nodeID)
}

// DriveNodeSharePath returns /v1/drive/nodes/{nodeID}/share.
func DriveNodeSharePath(nodeID string) string {
	return DriveNodePath(nodeID) + "/share"
}

// DriveNodeShareRotatePath returns /v1/drive/nodes/{nodeID}/share/rotate.
func DriveNodeShareRotatePath(nodeID string) string {
	return DriveNodePath(nodeID) + "/share/rotate"
}

// --- Page endpoints ---

const PagesPath = "/v1/pages"

// PagePath returns /v1/pages/{pageID}.
func PagePath(pageID string) string {
	return PagesPath + "/" + url.PathEscape(pageID)
}

// PageVersionsPath returns /v1/pages/{pageID}/versions.
func PageVersionsPath(pageID string) string {
	return PagePath(pageID) + "/versions"
}

// PageVersionByNumberPath returns /v1/pages/{pageID}/versions/by-number/{no}.
func PageVersionByNumberPath(pageID string, versionNo int) string {
	return fmt.Sprintf("%s/by-number/%d", PageVersionsPath(pageID), versionNo)
}

// PageVersionPath returns /v1/pages/{pageID}/versions/{versionID}.
func PageVersionPath(pageID, versionID string) string {
	return PageVersionsPath(pageID) + "/" + url.PathEscape(versionID)
}

// PageVersionActionPath returns /v1/pages/{pageID}/versions/{versionID}/{action}.
func PageVersionActionPath(pageID, versionID, action string) string {
	return PageVersionPath(pageID, versionID) + "/" + action
}

// PageVersionFilePresignPath returns /v1/pages/{pageID}/versions/{versionID}/files/presign.
func PageVersionFilePresignPath(pageID, versionID string) string {
	return PageVersionPath(pageID, versionID) + "/files/presign"
}

// PageVersionFileCompletePath returns /v1/pages/{pageID}/versions/{versionID}/files/complete.
func PageVersionFileCompletePath(pageID, versionID string) string {
	return PageVersionPath(pageID, versionID) + "/files/complete"
}

// --- Auth endpoints ---

const (
	AuthLoginPath        = "/v1/auth/login"
	AuthPollPath         = "/v1/auth/poll"
	AuthDeviceCodePath   = "/v1/auth/device-code"
	AuthDevicePollPath   = "/v1/auth/device-poll"
	AuthDeviceVerifyPath = "/v1/auth/device-verify"
	AuthExchangePath     = "/v1/auth/exchange"
	AuthLogoutPath       = "/v1/auth/logout"

	// Legacy login paths (kept for backward compatibility).
	LoginInitPath = "/v1/login/init"
	LoginPollPath = "/v1/login/poll"
)

// --- Feedback ---

const FeedbackPath = "/v1/feedback"

// --- Web search and crawl ---

const (
	WebSearchPath = "/v1/web/search"
	WebCrawlPath  = "/v1/web/crawl"
)

// --- Telemetry ---

const TelemetryPath = "/v1/telemetry"

// --- Agent control ---

const (
	AgentBindingsPath      = "/v1/agent/im-bindings"
	AgentBindTokenPath     = "/v1/agent/im-bindings/token"
	AgentRunnersPath       = "/v1/agent/runners"
	AgentConversationsPath = "/v1/agent/conversations"
	AgentTasksPath         = "/v1/agent/tasks"
)

func AgentBindingPath(bindingID string) string {
	return AgentBindingsPath + "/" + url.PathEscape(bindingID)
}

func AgentTaskPath(taskID string) string {
	return AgentTasksPath + "/" + url.PathEscape(taskID)
}

func AgentConversationPath(conversationID string) string {
	return AgentConversationsPath + "/" + url.PathEscape(conversationID)
}

func AgentConversationSessionsPath(conversationID string) string {
	return AgentConversationPath(conversationID) + "/sessions"
}

func AgentConversationMailboxPath(conversationID string) string {
	return AgentConversationPath(conversationID) + "/mailbox"
}

func AgentConversationStopPath(conversationID string) string {
	return AgentConversationPath(conversationID) + "/stop"
}

func AgentConversationResetPath(conversationID string) string {
	return AgentConversationPath(conversationID) + "/reset"
}

func AgentConversationForkPath(conversationID string) string {
	return AgentConversationPath(conversationID) + "/fork"
}

func AgentConversationFirePath(conversationID string) string {
	return AgentConversationPath(conversationID) + "/fire"
}

func AgentTaskCancelPath(taskID string) string {
	return AgentTaskPath(taskID) + "/cancel"
}

func AgentRunnerNextTaskPath(runnerID string) string {
	return AgentRunnersPath + "/" + url.PathEscape(runnerID) + "/tasks/next"
}

func AgentRunnerNextSessionPath(runnerID string) string {
	return AgentRunnersPath + "/" + url.PathEscape(runnerID) + "/sessions/next"
}

func AgentRunnerClaimPrimaryPath(runnerID string) string {
	return AgentRunnersPath + "/" + url.PathEscape(runnerID) + "/claim-primary"
}

func AgentRunnerPrimaryPath(platform string) string {
	return AgentRunnersPath + "/primary?platform=" + url.QueryEscape(platform)
}

func AgentIMInboundPath() string {
	return "/v1/agent/im/inbound"
}

func AgentRunnerSessionPath(runnerID string, sessionID string) string {
	return AgentRunnersPath + "/" + url.PathEscape(runnerID) + "/sessions/" + url.PathEscape(sessionID)
}

func AgentRunnerSessionStatusPath(runnerID string, sessionID string) string {
	return AgentRunnerSessionPath(runnerID, sessionID)
}
