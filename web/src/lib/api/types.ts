/** GET /v1/me */
export type User = {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

/** GET /v1/credits/balance */
export type Balance = {
  available: number;
  currency: string;
  credit_cent_balance: number;
};

/** Items inside GET /v1/logs */
export type TimelineItem = {
  type: "capability_call" | "credit_transaction";
  occurred_at: string;
  // capability_call fields
  request_id?: string;
  capability?: string;
  model?: string;
  status?: string;
  credit_cost?: number;
  error_code?: string;
  // credit_transaction fields
  transaction_id?: string;
  transaction_type?: string;
  credit_cent_amount?: number;
  description?: string;
  source_id?: string;
  credit_batch_type?: string;
};

/** GET /v1/logs */
export type LogsResult = {
  items: TimelineItem[];
  next_cursor?: string;
};

/** GET /v1/dashboard/summary */
export type DashboardSummary = {
  user: User;
  balance: Balance;
  recent_activity: TimelineItem[];
  usage_summary?: {
    last_capability: string;
    last_model: string;
    last_occurred_at: string;
  };
  error_summary?: {
    last_error_capability: string;
    last_error_code: string;
    last_error_occurred_at: string;
  };
};
