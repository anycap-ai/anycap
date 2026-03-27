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
  timestamp: string;
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
  amount?: number;
  description?: string;
  source_id?: string;
};

/** GET /v1/logs */
export type LogsResult = {
  items: TimelineItem[];
};

/** GET /v1/dashboard/summary */
export type DashboardSummary = {
  user: User;
  balance: Balance;
  recent_activity: TimelineItem[];
  usage_summary?: {
    capability: string;
    model: string;
    timestamp: string;
  };
  error_summary?: {
    capability: string;
    error_code: string;
    timestamp: string;
  };
};
