/**
 * Workspace Queries
 * Query functions untuk mengambil data workspace dari Supabase
 */
import { createClient } from "@/lib/supabase/server";
import type { WorkspaceWithStats, MonthlyChartData } from "@/types";

/**
 * Ambil semua workspace milik user beserta statistik saldo
 */
export async function getWorkspacesWithStats(): Promise<WorkspaceWithStats[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: workspaces } = await supabase
    .from("workspace_stats")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (workspaces as unknown as WorkspaceWithStats[]) || [];
}

/**
 * Ambil satu workspace dengan statistik
 */
export async function getWorkspaceById(id: string): Promise<WorkspaceWithStats | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: workspace } = await supabase
    .from("workspace_stats")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return (workspace as unknown as WorkspaceWithStats) || null;
}

/**
 * Ambil data chart per bulan (12 bulan terakhir)
 */
export async function getMonthlyChartData(workspaceId: string): Promise<MonthlyChartData[]> {
  const supabase = await createClient();

  // 12 bulan terakhir
  const from = new Date();
  from.setMonth(from.getMonth() - 11);
  from.setDate(1);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("date, type, amount")
    .eq("workspace_id", workspaceId)
    .gte("date", from.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (!transactions?.length) return [];

  // Group by bulan
  const monthMap = new Map<string, { income: number; expense: number }>();

  // Inisialisasi 12 bulan
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, { income: 0, expense: 0 });
  }

  for (const t of transactions) {
    const [year, month] = t.date.split("-");
    const key = `${year}-${month}`;
    const entry = monthMap.get(key);
    if (entry) {
      if (t.type === "income") entry.income += Number(t.amount);
      else entry.expense += Number(t.amount);
    }
  }

  const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  return Array.from(monthMap.entries()).map(([key, value]) => {
    const [year, month] = key.split("-");
    return {
      month: MONTHS_ID[parseInt(month) - 1],
      year: parseInt(year),
      income: value.income,
      expense: value.expense,
    };
  });
}
