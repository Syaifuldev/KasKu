/**
 * Transaction Queries
 * Query functions dengan server-side pagination, search, filter, sort
 */
import { createClient } from "@/lib/supabase/server";
import type { Transaction, PaginatedResponse, TransactionFilters } from "@/types";

/**
 * Ambil transaksi dengan pagination, filter, dan sorting
 */
export async function getTransactions(
  workspaceId: string,
  filters: TransactionFilters = {}
): Promise<PaginatedResponse<Transaction>> {
  const supabase = await createClient();

  const {
    search = "",
    dateFrom,
    dateTo,
    type = "all",
    page = 1,
    pageSize = 10,
    sortBy = "date",
    sortOrder = "desc",
  } = filters;

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("workspace_id", workspaceId);

  // Filter pencarian
  if (search) {
    query = query.ilike("description", `%${search}%`);
  }

  // Filter tanggal
  if (dateFrom) query = query.gte("date", dateFrom);
  if (dateTo) query = query.lte("date", dateTo);

  // Filter tipe
  if (type !== "all") query = query.eq("type", type);

  // Sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) return { data: [], count: 0, page, pageSize, totalPages: 0 };

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return {
    data: data ?? [],
    count: count ?? 0,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Ambil 5 transaksi terbaru untuk dashboard
 */
export async function getRecentTransactions(workspaceId: string, limit = 5): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

/**
 * Ambil transaksi untuk laporan (dengan filter tanggal)
 */
export async function getTransactionsForReport(
  workspaceId: string,
  dateFrom: string,
  dateTo: string
): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  return data ?? [];
}

/**
 * Ambil semua transaksi untuk laporan (tanpa filter tanggal)
 */
export async function getAllTransactionsForReport(
  workspaceId: string
): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  return data ?? [];
}
