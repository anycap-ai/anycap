package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
)

type AgentControlRepo struct {
	db sqlstore.DBTX
}

func NewAgentControlRepo(db sqlstore.DBTX) *AgentControlRepo {
	return &AgentControlRepo{db: db}
}

func (r *AgentControlRepo) CreateIMBindToken(ctx context.Context, token model.IMBindToken) (*model.IMBindToken, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}

	userID, err := parseInternalUserID(token.UserID)
	if err != nil {
		return nil, err
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO im_bind_tokens (external_id, user_id, token, platform, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, token, platform, expires_at, used_at, created_at
	`,
		externalid.Generate(externalid.PrefixIMBinding),
		userID,
		strings.TrimSpace(token.Token),
		strings.TrimSpace(token.Platform),
		token.ExpiresAt.UTC(),
		token.CreatedAt.UTC(),
	)

	item, err := scanIMBindToken(row)
	if err != nil {
		return nil, fmt.Errorf("create im bind token: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) GetIMBindTokenByToken(ctx context.Context, token string) (*model.IMBindToken, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, token, platform, expires_at, used_at, created_at
		FROM im_bind_tokens
		WHERE token = $1
	`, strings.TrimSpace(token))

	item, err := scanIMBindToken(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get im bind token by token: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) MarkIMBindTokenUsed(ctx context.Context, id int64) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("agent control repo db is not configured")
	}
	result, err := r.db.ExecContext(ctx, `
		UPDATE im_bind_tokens
		SET used_at = NOW()
		WHERE id = $1 AND used_at IS NULL
	`, id)
	if err != nil {
		return fmt.Errorf("mark im bind token used: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected for mark im bind token used: %w", err)
	}
	if rowsAffected == 0 {
		return model.ErrNotFound("im bind token not found or already used")
	}
	return nil
}

func (r *AgentControlRepo) CreateBinding(ctx context.Context, binding model.IMBinding) (*model.IMBinding, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}

	userID, err := parseInternalUserID(binding.UserID)
	if err != nil {
		return nil, err
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO im_bindings (external_id, user_id, platform, bot_id, channel_id, sender_id, status, created_at, updated_at, last_bound_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, user_id, platform, bot_id, channel_id, sender_id, status, created_at, updated_at, last_bound_at
	`,
		externalid.Generate(externalid.PrefixIMBinding),
		userID,
		strings.TrimSpace(binding.Platform),
		strings.TrimSpace(binding.BotID),
		strings.TrimSpace(binding.ChannelID),
		strings.TrimSpace(binding.SenderID),
		strings.TrimSpace(binding.Status),
		binding.CreatedAt.UTC(),
		binding.UpdatedAt.UTC(),
		nullableTime(binding.LastBoundAt),
	)

	item, err := scanIMBinding(row)
	if err != nil {
		return nil, fmt.Errorf("create im binding: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) GetActiveByPlatformSender(ctx context.Context, platform string, botID string, senderID string) (*model.IMBinding, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, platform, bot_id, channel_id, sender_id, status, created_at, updated_at, last_bound_at
		FROM im_bindings
		WHERE platform = $1
		  AND bot_id = $2
		  AND sender_id = $3
		  AND status = $4
		ORDER BY id DESC
		LIMIT 1
	`, strings.TrimSpace(platform), strings.TrimSpace(botID), strings.TrimSpace(senderID), model.IMBindingStatusActive)

	item, err := scanIMBinding(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get active binding by platform sender: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) ListBindingsByUser(ctx context.Context, userID string) ([]model.IMBinding, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	internalUserID, err := parseInternalUserID(userID)
	if err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id, platform, bot_id, channel_id, sender_id, status, created_at, updated_at, last_bound_at
		FROM im_bindings
		WHERE user_id = $1
		ORDER BY id DESC
	`, internalUserID)
	if err != nil {
		return nil, fmt.Errorf("list bindings by user: %w", err)
	}
	defer rows.Close()

	var items []model.IMBinding
	for rows.Next() {
		item, scanErr := scanIMBinding(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan im binding: %w", scanErr)
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate im bindings: %w", err)
	}
	return items, nil
}

func (r *AgentControlRepo) RevokeBinding(ctx context.Context, id int64) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("agent control repo db is not configured")
	}
	result, err := r.db.ExecContext(ctx, `
		UPDATE im_bindings
		SET status = $2,
			updated_at = NOW()
		WHERE id = $1
	`, id, model.IMBindingStatusRevoked)
	if err != nil {
		return fmt.Errorf("revoke im binding: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected for revoke im binding: %w", err)
	}
	if rowsAffected == 0 {
		return model.ErrNotFound("im binding not found")
	}
	return nil
}

func (r *AgentControlRepo) CreateRunner(ctx context.Context, runner model.AgentRunner) (*model.AgentRunner, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	userID, err := parseInternalUserID(runner.UserID)
	if err != nil {
		return nil, err
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO agent_runners (external_id, user_id, name, platform, fixed_binding_id, state, last_heartbeat, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, user_id, name, platform, fixed_binding_id, state, last_heartbeat, created_at, updated_at
	`,
		externalid.Generate(externalid.PrefixRunner),
		userID,
		strings.TrimSpace(runner.Name),
		strings.TrimSpace(runner.Platform),
		nullableInt64(runner.FixedBinding),
		strings.TrimSpace(runner.State),
		nullableTime(runner.LastHeartbeat),
		runner.CreatedAt.UTC(),
		runner.UpdatedAt.UTC(),
	)

	item, err := scanAgentRunner(row)
	if err != nil {
		return nil, fmt.Errorf("create agent runner: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) GetRunnerByID(ctx context.Context, id int64) (*model.AgentRunner, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, name, platform, fixed_binding_id, state, last_heartbeat, created_at, updated_at
		FROM agent_runners
		WHERE id = $1
	`, id)
	item, err := scanAgentRunner(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get agent runner: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) GetPrimaryRunner(ctx context.Context, userID string, platform string) (*model.AgentPrimaryRunner, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	internalUserID, err := parseInternalUserID(userID)
	if err != nil {
		return nil, err
	}
	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, platform, runner_id, updated_at
		FROM agent_primary_runners
		WHERE user_id = $1 AND platform = $2
	`, internalUserID, strings.TrimSpace(platform))
	item, err := scanAgentPrimaryRunner(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get primary runner: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) ListRunnersByUser(ctx context.Context, userID string) ([]model.AgentRunner, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	internalUserID, err := parseInternalUserID(userID)
	if err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id, name, platform, fixed_binding_id, state, last_heartbeat, created_at, updated_at
		FROM agent_runners
		WHERE user_id = $1
		ORDER BY id DESC
	`, internalUserID)
	if err != nil {
		return nil, fmt.Errorf("list runners by user: %w", err)
	}
	defer rows.Close()

	var items []model.AgentRunner
	for rows.Next() {
		item, scanErr := scanAgentRunner(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan agent runner: %w", scanErr)
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate agent runners: %w", err)
	}
	return items, nil
}

func (r *AgentControlRepo) ClaimPrimaryRunner(ctx context.Context, userID string, platform string, runnerID int64, updatedAt time.Time) (*model.AgentPrimaryRunner, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	internalUserID, err := parseInternalUserID(userID)
	if err != nil {
		return nil, err
	}
	row := r.db.QueryRowContext(ctx, `
		INSERT INTO agent_primary_runners (user_id, platform, runner_id, updated_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, platform)
		DO UPDATE SET runner_id = EXCLUDED.runner_id, updated_at = EXCLUDED.updated_at
		RETURNING id, user_id, platform, runner_id, updated_at
	`, internalUserID, strings.TrimSpace(platform), runnerID, updatedAt.UTC())
	item, err := scanAgentPrimaryRunner(row)
	if err != nil {
		return nil, fmt.Errorf("claim primary runner: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) UpdateRunnerState(ctx context.Context, id int64, state string) (*model.AgentRunner, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		UPDATE agent_runners
		SET state = $2,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, user_id, name, platform, fixed_binding_id, state, last_heartbeat, created_at, updated_at
	`, id, strings.TrimSpace(state))
	item, err := scanAgentRunner(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("update agent runner state: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) CreateConversation(ctx context.Context, conversation model.AgentConversation) (*model.AgentConversation, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	userID, err := parseInternalUserID(conversation.UserID)
	if err != nil {
		return nil, err
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO agent_conversations (external_id, user_id, platform, bot_id, chat_id, runner_id, agent, status, last_session_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, user_id, platform, bot_id, chat_id, runner_id, agent, status, last_session_id, created_at, updated_at
	`,
		externalid.Generate(externalid.PrefixAgentConversation),
		userID,
		strings.TrimSpace(conversation.Platform),
		strings.TrimSpace(conversation.BotID),
		strings.TrimSpace(conversation.ChatID),
		conversation.RunnerID,
		strings.TrimSpace(conversation.Agent),
		strings.TrimSpace(conversation.Status),
		nullableInt64(conversation.LastSessionID),
		conversation.CreatedAt.UTC(),
		conversation.UpdatedAt.UTC(),
	)

	item, err := scanAgentConversation(row)
	if err != nil {
		return nil, fmt.Errorf("create agent conversation: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) GetConversationByID(ctx context.Context, id int64) (*model.AgentConversation, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, platform, bot_id, chat_id, runner_id, agent, status, last_session_id, created_at, updated_at
		FROM agent_conversations
		WHERE id = $1
	`, id)
	item, err := scanAgentConversation(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get agent conversation: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) GetActiveConversationByChat(ctx context.Context, userID string, platform string, botID string, chatID string) (*model.AgentConversation, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	internalUserID, err := parseInternalUserID(userID)
	if err != nil {
		return nil, err
	}
	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, platform, bot_id, chat_id, runner_id, agent, status, last_session_id, created_at, updated_at
		FROM agent_conversations
		WHERE user_id = $1
		  AND platform = $2
		  AND bot_id = $3
		  AND chat_id = $4
		  AND status = $5
		ORDER BY updated_at DESC, id DESC
		LIMIT 1
	`, internalUserID, strings.TrimSpace(platform), strings.TrimSpace(botID), strings.TrimSpace(chatID), model.AgentConversationStatusActive)
	item, err := scanAgentConversation(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get active conversation by chat: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) ListConversationsByUser(ctx context.Context, userID string) ([]model.AgentConversation, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	internalUserID, err := parseInternalUserID(userID)
	if err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id, platform, bot_id, chat_id, runner_id, agent, status, last_session_id, created_at, updated_at
		FROM agent_conversations
		WHERE user_id = $1
		ORDER BY updated_at DESC, id DESC
	`, internalUserID)
	if err != nil {
		return nil, fmt.Errorf("list agent conversations by user: %w", err)
	}
	defer rows.Close()

	items := make([]model.AgentConversation, 0)
	for rows.Next() {
		item, scanErr := scanAgentConversation(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan agent conversation: %w", scanErr)
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate agent conversations: %w", err)
	}
	return items, nil
}

func (r *AgentControlRepo) UpdateConversationLastSession(ctx context.Context, id int64, lastSessionID int64) (*model.AgentConversation, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		UPDATE agent_conversations
		SET last_session_id = $2,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, user_id, platform, bot_id, chat_id, runner_id, agent, status, last_session_id, created_at, updated_at
	`, id, lastSessionID)
	item, err := scanAgentConversation(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("update conversation last session: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) ArchiveConversation(ctx context.Context, id int64) (*model.AgentConversation, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		UPDATE agent_conversations
		SET status = $2,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, user_id, platform, bot_id, chat_id, runner_id, agent, status, last_session_id, created_at, updated_at
	`, id, model.AgentConversationStatusArchived)
	item, err := scanAgentConversation(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("archive agent conversation: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) CreateTask(ctx context.Context, task model.AgentTask) (*model.AgentTask, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	userID, err := parseInternalUserID(task.UserID)
	if err != nil {
		return nil, err
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO agent_tasks (external_id, user_id, runner_id, session_id, platform, intent, task_text, workspace_hint, runner_selector, status, error_message, dispatched_at, started_at, completed_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		RETURNING id, user_id, runner_id, session_id, platform, intent, task_text, workspace_hint, runner_selector, status, error_message, dispatched_at, started_at, completed_at, created_at, updated_at
	`,
		externalid.Generate(externalid.PrefixAgentTask),
		userID,
		task.RunnerID,
		nullableInt64(task.SessionID),
		strings.TrimSpace(task.Platform),
		strings.TrimSpace(task.Intent),
		strings.TrimSpace(task.TaskText),
		nullableString(task.WorkspaceHint),
		nullableString(task.RunnerSelector),
		strings.TrimSpace(task.Status),
		nullableString(task.ErrorMessage),
		nullableTime(task.DispatchedAt),
		nullableTime(task.StartedAt),
		nullableTime(task.CompletedAt),
		task.CreatedAt.UTC(),
		task.UpdatedAt.UTC(),
	)

	item, err := scanAgentTask(row)
	if err != nil {
		return nil, fmt.Errorf("create agent task: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) GetTaskByID(ctx context.Context, id int64) (*model.AgentTask, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, runner_id, session_id, platform, intent, task_text, workspace_hint, runner_selector, status, error_message, dispatched_at, started_at, completed_at, created_at, updated_at
		FROM agent_tasks
		WHERE id = $1
	`, id)
	item, err := scanAgentTask(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get agent task: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) ListDispatchableTasksByRunner(ctx context.Context, runnerID int64, limit int) ([]model.AgentTask, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	if limit <= 0 {
		limit = 1
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id, runner_id, session_id, platform, intent, task_text, workspace_hint, runner_selector, status, error_message, dispatched_at, started_at, completed_at, created_at, updated_at
		FROM agent_tasks
		WHERE runner_id = $1
		  AND status IN ($2, $3)
		ORDER BY
			CASE status
				WHEN $2 THEN 0
				WHEN $3 THEN 1
				ELSE 2
			END,
			COALESCE(dispatched_at, created_at) ASC,
			id ASC
		LIMIT $4
	`, runnerID, model.AgentTaskStatusDispatched, model.AgentTaskStatusQueued, limit)
	if err != nil {
		return nil, fmt.Errorf("list dispatchable agent tasks: %w", err)
	}
	defer rows.Close()

	items := make([]model.AgentTask, 0, limit)
	for rows.Next() {
		item, scanErr := scanAgentTask(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan dispatchable agent task: %w", scanErr)
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate dispatchable agent tasks: %w", err)
	}
	return items, nil
}

func (r *AgentControlRepo) UpdateTask(ctx context.Context, input model.AgentTaskUpdate) (*model.AgentTask, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		UPDATE agent_tasks
		SET status = $2,
			error_message = $3,
			dispatched_at = COALESCE($4, dispatched_at),
			started_at = COALESCE($5, started_at),
			completed_at = COALESCE($6, completed_at),
			updated_at = $7
		WHERE id = $1
		RETURNING id, user_id, runner_id, session_id, platform, intent, task_text, workspace_hint, runner_selector, status, error_message, dispatched_at, started_at, completed_at, created_at, updated_at
	`,
		input.ID,
		strings.TrimSpace(input.Status),
		nullableString(input.ErrorMessage),
		nullableTime(input.DispatchedAt),
		nullableTime(input.StartedAt),
		nullableTime(input.CompletedAt),
		input.UpdatedAt.UTC(),
	)
	item, err := scanAgentTask(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("update agent task: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) CreateSession(ctx context.Context, session model.AgentSession) (*model.AgentSession, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	userID, err := parseInternalUserID(session.UserID)
	if err != nil {
		return nil, err
	}
	row := r.db.QueryRowContext(ctx, `
		INSERT INTO agent_sessions (external_id, user_id, conversation_id, parent_session_id, runner_id, agent, mode, user_message, final_message, status, executor_ref, started_at, completed_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id, user_id, conversation_id, parent_session_id, runner_id, agent, mode, user_message, final_message, status, executor_ref, started_at, completed_at, created_at, updated_at
	`,
		externalid.Generate(externalid.PrefixAgentSession),
		userID,
		session.ConversationID,
		nullableInt64(session.ParentSessionID),
		session.RunnerID,
		strings.TrimSpace(session.Agent),
		strings.TrimSpace(session.Mode),
		nullableString(session.UserMessage),
		nullableString(session.FinalMessage),
		strings.TrimSpace(session.Status),
		nullableString(session.ExecutorRef),
		nullableTime(session.StartedAt),
		nullableTime(session.CompletedAt),
		session.CreatedAt.UTC(),
		session.UpdatedAt.UTC(),
	)
	item, err := scanAgentSession(row)
	if err != nil {
		return nil, fmt.Errorf("create agent session: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) GetSessionByID(ctx context.Context, id int64) (*model.AgentSession, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, conversation_id, parent_session_id, runner_id, agent, mode, user_message, final_message, status, executor_ref, started_at, completed_at, created_at, updated_at
		FROM agent_sessions
		WHERE id = $1
	`, id)
	item, err := scanAgentSession(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get agent session: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) ListSessionsByConversation(ctx context.Context, conversationID int64) ([]model.AgentSession, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id, conversation_id, parent_session_id, runner_id, agent, mode, user_message, final_message, status, executor_ref, started_at, completed_at, created_at, updated_at
		FROM agent_sessions
		WHERE conversation_id = $1
		ORDER BY id ASC
	`, conversationID)
	if err != nil {
		return nil, fmt.Errorf("list agent sessions by conversation: %w", err)
	}
	defer rows.Close()

	items := make([]model.AgentSession, 0)
	for rows.Next() {
		item, scanErr := scanAgentSession(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan agent session: %w", scanErr)
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate agent sessions: %w", err)
	}
	return items, nil
}

func (r *AgentControlRepo) ListRunnableSessionsByRunner(ctx context.Context, runnerID int64, limit int) ([]model.AgentSession, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	if limit <= 0 {
		limit = 1
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id, conversation_id, parent_session_id, runner_id, agent, mode, user_message, final_message, status, executor_ref, started_at, completed_at, created_at, updated_at
		FROM agent_sessions
		WHERE runner_id = $1
		  AND status = $2
		ORDER BY created_at ASC, id ASC
		LIMIT $3
	`, runnerID, model.AgentSessionStatusCreated, limit)
	if err != nil {
		return nil, fmt.Errorf("list runnable agent sessions: %w", err)
	}
	defer rows.Close()

	items := make([]model.AgentSession, 0, limit)
	for rows.Next() {
		item, scanErr := scanAgentSession(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan runnable agent session: %w", scanErr)
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate runnable agent sessions: %w", err)
	}
	return items, nil
}

func (r *AgentControlRepo) UpdateSession(ctx context.Context, input model.AgentSession) (*model.AgentSession, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		UPDATE agent_sessions
		SET final_message = COALESCE($2, final_message),
			status = $3,
			executor_ref = COALESCE($4, executor_ref),
			started_at = COALESCE($5, started_at),
			completed_at = COALESCE($6, completed_at),
			updated_at = $7
		WHERE id = $1
		RETURNING id, user_id, conversation_id, parent_session_id, runner_id, agent, mode, user_message, final_message, status, executor_ref, started_at, completed_at, created_at, updated_at
	`,
		input.ID,
		nullableString(input.FinalMessage),
		strings.TrimSpace(input.Status),
		nullableString(input.ExecutorRef),
		nullableTime(input.StartedAt),
		nullableTime(input.CompletedAt),
		input.UpdatedAt.UTC(),
	)
	item, err := scanAgentSession(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("update agent session: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) CreateMailboxMessage(ctx context.Context, message model.AgentMailboxMessage) (*model.AgentMailboxMessage, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	row := r.db.QueryRowContext(ctx, `
		INSERT INTO agent_mailbox_messages (external_id, conversation_id, source_session_id, source_type, payload, delivered_to_session_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, conversation_id, source_session_id, source_type, payload, delivered_to_session_id, created_at
	`,
		externalid.Generate(externalid.PrefixAgentMailboxMessage),
		message.ConversationID,
		message.SourceSessionID,
		strings.TrimSpace(message.SourceType),
		message.Payload,
		nullableInt64(message.DeliveredToSessionID),
		message.CreatedAt.UTC(),
	)
	item, err := scanAgentMailboxMessage(row)
	if err != nil {
		return nil, fmt.Errorf("create agent mailbox message: %w", err)
	}
	return item, nil
}

func (r *AgentControlRepo) ListUndeliveredMailboxMessages(ctx context.Context, conversationID int64) ([]model.AgentMailboxMessage, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, conversation_id, source_session_id, source_type, payload, delivered_to_session_id, created_at
		FROM agent_mailbox_messages
		WHERE conversation_id = $1
		  AND delivered_to_session_id IS NULL
		ORDER BY created_at ASC, id ASC
	`, conversationID)
	if err != nil {
		return nil, fmt.Errorf("list undelivered agent mailbox messages: %w", err)
	}
	defer rows.Close()

	items := make([]model.AgentMailboxMessage, 0)
	for rows.Next() {
		item, scanErr := scanAgentMailboxMessage(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan agent mailbox message: %w", scanErr)
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate agent mailbox messages: %w", err)
	}
	return items, nil
}

func (r *AgentControlRepo) ListMailboxMessagesDeliveredToSession(ctx context.Context, sessionID int64) ([]model.AgentMailboxMessage, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("agent control repo db is not configured")
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT id, conversation_id, source_session_id, source_type, payload, delivered_to_session_id, created_at
		FROM agent_mailbox_messages
		WHERE delivered_to_session_id = $1
		ORDER BY id ASC
	`, sessionID)
	if err != nil {
		return nil, fmt.Errorf("list mailbox messages delivered to session: %w", err)
	}
	defer rows.Close()

	var items []model.AgentMailboxMessage
	for rows.Next() {
		item, scanErr := scanAgentMailboxMessage(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan agent mailbox message: %w", scanErr)
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate delivered mailbox messages: %w", err)
	}
	return items, nil
}

func (r *AgentControlRepo) MarkMailboxMessagesDelivered(ctx context.Context, ids []int64, sessionID int64) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("agent control repo db is not configured")
	}
	ids = uniqueInt64(ids)
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, 0, len(ids))
	args := make([]any, 0, len(ids)+1)
	args = append(args, sessionID)
	for idx, id := range ids {
		placeholders = append(placeholders, fmt.Sprintf("$%d", idx+2))
		args = append(args, id)
	}
	query := fmt.Sprintf(`
		UPDATE agent_mailbox_messages
		SET delivered_to_session_id = $1
		WHERE id IN (%s)
	`, strings.Join(placeholders, ", "))
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("mark agent mailbox messages delivered: %w", err)
	}
	return nil
}

func scanIMBindToken(row rowScanner) (*model.IMBindToken, error) {
	var (
		item   model.IMBindToken
		userID int64
		usedAt sql.NullTime
	)
	if err := row.Scan(
		&item.ID,
		&userID,
		&item.Token,
		&item.Platform,
		&item.ExpiresAt,
		&usedAt,
		&item.CreatedAt,
	); err != nil {
		return nil, err
	}
	item.UserID = strconv.FormatInt(userID, 10)
	if usedAt.Valid {
		item.UsedAt = &usedAt.Time
	}
	return &item, nil
}

func scanIMBinding(row rowScanner) (*model.IMBinding, error) {
	var (
		item        model.IMBinding
		userID      int64
		lastBoundAt sql.NullTime
	)
	if err := row.Scan(
		&item.ID,
		&userID,
		&item.Platform,
		&item.BotID,
		&item.ChannelID,
		&item.SenderID,
		&item.Status,
		&item.CreatedAt,
		&item.UpdatedAt,
		&lastBoundAt,
	); err != nil {
		return nil, err
	}
	item.UserID = strconv.FormatInt(userID, 10)
	if lastBoundAt.Valid {
		item.LastBoundAt = &lastBoundAt.Time
	}
	return &item, nil
}

func scanAgentRunner(row rowScanner) (*model.AgentRunner, error) {
	var (
		item          model.AgentRunner
		userID        int64
		fixedBinding  sql.NullInt64
		lastHeartbeat sql.NullTime
	)
	if err := row.Scan(
		&item.ID,
		&userID,
		&item.Name,
		&item.Platform,
		&fixedBinding,
		&item.State,
		&lastHeartbeat,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	item.UserID = strconv.FormatInt(userID, 10)
	if fixedBinding.Valid {
		value := fixedBinding.Int64
		item.FixedBinding = &value
	}
	if lastHeartbeat.Valid {
		item.LastHeartbeat = &lastHeartbeat.Time
	}
	return &item, nil
}

func scanAgentConversation(row rowScanner) (*model.AgentConversation, error) {
	var (
		item          model.AgentConversation
		userID        int64
		lastSessionID sql.NullInt64
	)
	if err := row.Scan(
		&item.ID,
		&userID,
		&item.Platform,
		&item.BotID,
		&item.ChatID,
		&item.RunnerID,
		&item.Agent,
		&item.Status,
		&lastSessionID,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	item.UserID = strconv.FormatInt(userID, 10)
	if lastSessionID.Valid {
		value := lastSessionID.Int64
		item.LastSessionID = &value
	}
	return &item, nil
}

func scanAgentSession(row rowScanner) (*model.AgentSession, error) {
	var (
		item            model.AgentSession
		userID          int64
		parentSessionID sql.NullInt64
		userMessage     sql.NullString
		finalMessage    sql.NullString
		executorRef     sql.NullString
		startedAt       sql.NullTime
		completedAt     sql.NullTime
	)
	if err := row.Scan(
		&item.ID,
		&userID,
		&item.ConversationID,
		&parentSessionID,
		&item.RunnerID,
		&item.Agent,
		&item.Mode,
		&userMessage,
		&finalMessage,
		&item.Status,
		&executorRef,
		&startedAt,
		&completedAt,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	item.UserID = strconv.FormatInt(userID, 10)
	if parentSessionID.Valid {
		value := parentSessionID.Int64
		item.ParentSessionID = &value
	}
	if userMessage.Valid {
		item.UserMessage = &userMessage.String
	}
	if finalMessage.Valid {
		item.FinalMessage = &finalMessage.String
	}
	if executorRef.Valid {
		item.ExecutorRef = &executorRef.String
	}
	if startedAt.Valid {
		item.StartedAt = &startedAt.Time
	}
	if completedAt.Valid {
		item.CompletedAt = &completedAt.Time
	}
	return &item, nil
}

func scanAgentTask(row rowScanner) (*model.AgentTask, error) {
	var (
		item           model.AgentTask
		userID         int64
		sessionID      sql.NullInt64
		workspaceHint  sql.NullString
		runnerSelector sql.NullString
		errorMessage   sql.NullString
		dispatchedAt   sql.NullTime
		startedAt      sql.NullTime
		completedAt    sql.NullTime
	)
	if err := row.Scan(
		&item.ID,
		&userID,
		&item.RunnerID,
		&sessionID,
		&item.Platform,
		&item.Intent,
		&item.TaskText,
		&workspaceHint,
		&runnerSelector,
		&item.Status,
		&errorMessage,
		&dispatchedAt,
		&startedAt,
		&completedAt,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	item.UserID = strconv.FormatInt(userID, 10)
	if sessionID.Valid {
		value := sessionID.Int64
		item.SessionID = &value
	}
	if workspaceHint.Valid {
		item.WorkspaceHint = &workspaceHint.String
	}
	if runnerSelector.Valid {
		item.RunnerSelector = &runnerSelector.String
	}
	if errorMessage.Valid {
		item.ErrorMessage = &errorMessage.String
	}
	if dispatchedAt.Valid {
		item.DispatchedAt = &dispatchedAt.Time
	}
	if startedAt.Valid {
		item.StartedAt = &startedAt.Time
	}
	if completedAt.Valid {
		item.CompletedAt = &completedAt.Time
	}
	return &item, nil
}

func scanAgentMailboxMessage(row rowScanner) (*model.AgentMailboxMessage, error) {
	var (
		item                 model.AgentMailboxMessage
		deliveredToSessionID sql.NullInt64
	)
	if err := row.Scan(
		&item.ID,
		&item.ConversationID,
		&item.SourceSessionID,
		&item.SourceType,
		&item.Payload,
		&deliveredToSessionID,
		&item.CreatedAt,
	); err != nil {
		return nil, err
	}
	if deliveredToSessionID.Valid {
		value := deliveredToSessionID.Int64
		item.DeliveredToSessionID = &value
	}
	return &item, nil
}

func scanAgentPrimaryRunner(row rowScanner) (*model.AgentPrimaryRunner, error) {
	var (
		item           model.AgentPrimaryRunner
		internalUserID int64
	)
	if err := row.Scan(
		&item.ID,
		&internalUserID,
		&item.Platform,
		&item.RunnerID,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	item.UserID = strconv.FormatInt(internalUserID, 10)
	return &item, nil
}

func parseInternalUserID(raw string) (int64, error) {
	value := strings.TrimSpace(raw)
	if value == "" {
		return 0, fmt.Errorf("%w: user_id is required", model.ErrInvalidParam)
	}
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil || id <= 0 {
		return 0, fmt.Errorf("%w: user_id must be a positive integer", model.ErrInvalidParam)
	}
	return id, nil
}

func nullableString(value *string) any {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return trimmed
}

func nullableTime(value *time.Time) any {
	if value == nil {
		return nil
	}
	return value.UTC()
}

func nullableInt64(value *int64) any {
	if value == nil {
		return nil
	}
	return *value
}

func uniqueInt64(values []int64) []int64 {
	if len(values) == 0 {
		return values
	}
	seen := make(map[int64]struct{}, len(values))
	out := make([]int64, 0, len(values))
	for _, value := range values {
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		out = append(out, value)
	}
	return out
}
