/**
 * KasKu — Global TypeScript Types
 * Mendefinisikan semua tipe data yang digunakan di seluruh aplikasi.
 */

// ============================================
// Database Types
// ============================================

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Workspace = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  logo_url: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  workspace_id: string;
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  category_id: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category | null;
};

export type Category = {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
};

// ============================================
// Derived / Computed Types
// ============================================

export type WorkspaceWithStats = Workspace & {
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
};

export type MonthlyChartData = {
  month: string;     // Format: "Jan", "Feb", dst
  year: number;
  income: number;
  expense: number;
};

export type RunningBalanceTransaction = Transaction & {
  running_balance: number;
};

// ============================================
// Form Types
// ============================================

export type WorkspaceFormData = {
  name: string;
  description?: string;
  icon: string;
  color: string;
};

export type TransactionFormData = {
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  category_id?: string | null;
  receipt_url?: string;
};

export type CategoryFormData = {
  name: string;
  color: string;
};

// ============================================
// API Response Types
// ============================================

export type PaginatedResponse<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

// ============================================
// Filter & Query Types
// ============================================

export type DateRangeFilter = {
  from: Date | undefined;
  to: Date | undefined;
};

export type TransactionFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType | "all";
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type ReportPeriod = "today" | "week" | "month" | "year" | "custom";

// ============================================
// Icon & Color Options
// ============================================

export const WORKSPACE_ICONS = [
  { value: "wallet", label: "Dompet" },
  { value: "building", label: "Organisasi" },
  { value: "users", label: "Komunitas" },
  { value: "star", label: "Bintang" },
  { value: "heart", label: "Donasi" },
  { value: "flag", label: "Event" },
  { value: "trophy", label: "Turnamen" },
  { value: "home", label: "Rumah" },
  { value: "briefcase", label: "Bisnis" },
  { value: "graduation-cap", label: "Pendidikan" },
  { value: "church", label: "Ibadah" },
  { value: "leaf", label: "Lingkungan" },
] as const;

export const WORKSPACE_COLORS = [
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
  { value: "#ec4899", label: "Pink" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#84cc16", label: "Lime" },
  { value: "#64748b", label: "Slate" },
] as const;

export type WorkspaceIconValue = typeof WORKSPACE_ICONS[number]["value"];
export type WorkspaceColorValue = typeof WORKSPACE_COLORS[number]["value"];
