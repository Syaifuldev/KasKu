/**
 * Workspace Dashboard Page — Mobile-First
 * Saldo besar, stats ringkas, transaksi terbaru. Tanpa grafik.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import { getWorkspaceById } from "@/lib/queries/workspace.queries";
import { getRecentTransactions } from "@/lib/queries/transaction.queries";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { WorkspaceDashboardClient } from "./workspace-dashboard-client";
import { formatRupiah, formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { WorkspaceIcon } from "@/components/workspace/workspace-icon";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const workspace = await getWorkspaceById(id);
  return { title: workspace?.name ?? "Dashboard" };
}

export default async function WorkspaceDashboardPage({ params }: Props) {
  const { id } = await params;

  try {
    const [workspace, recentTransactions] = await Promise.all([
      getWorkspaceById(id),
      getRecentTransactions(id, 8),
    ]);

    if (!workspace) notFound();

    const balance = Number(workspace.balance || 0);
    const totalIncome = Number(workspace.total_income || 0);
    const totalExpense = Number(workspace.total_expense || 0);
    const txCount = Number(workspace.transaction_count || 0);
    const isPositive = balance >= 0;

    return (
      <div className="min-h-screen bg-background">

        {/* ── Hero: Workspace Info + Saldo ── */}
        <div className={cn(
          "px-4 pt-5 pb-6 lg:px-8 lg:pt-8",
          "bg-gradient-to-b from-muted/40 to-background"
        )}>
          {/* Workspace identity */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <WorkspaceIcon icon={workspace.icon} color={workspace.color} size="md" />
              <div>
                <h1 className="text-base font-bold leading-tight">{workspace.name}</h1>
                {workspace.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {workspace.description}
                  </p>
                )}
              </div>
            </div>
            <WorkspaceDashboardClient workspace={workspace} />
          </div>

          {/* Saldo utama */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Saldo Saat Ini
            </p>
            <p className={cn(
              "text-3xl font-bold tracking-tight",
              isPositive ? "text-emerald-500" : "text-red-400"
            )}>
              {formatRupiah(balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {txCount} transaksi total
            </p>
          </div>
        </div>

        {/* ── Stats Row: Pemasukan & Pengeluaran ── */}
        <div className="px-4 lg:px-8 -mt-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Pemasukan */}
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Pemasukan</span>
              </div>
              <p className="text-lg font-bold text-emerald-500 truncate" title={formatRupiah(totalIncome)}>
                {formatRupiah(totalIncome)}
              </p>
            </div>

            {/* Pengeluaran */}
            <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-6 h-6 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                </div>
                <span className="text-xs font-medium text-red-500 dark:text-red-400">Pengeluaran</span>
              </div>
              <p className="text-lg font-bold text-red-400 truncate" title={formatRupiah(totalExpense)}>
                {formatRupiah(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Transaksi Terbaru ── */}
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Transaksi Terbaru</h2>
            <Link
              href={`/workspace/${workspace.id}/transactions`}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              Lihat semua
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border/50 rounded-2xl">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3">
                <Receipt className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Belum ada transaksi</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Ketuk tombol + untuk menambah
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/50">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5 active:bg-muted/40 transition-colors">
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    tx.type === "income" ? "bg-emerald-500/12" : "bg-red-500/12"
                  )}>
                    {tx.type === "income" ? (
                      <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-4.5 h-4.5 text-red-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDateShort(tx.date)}</p>
                  </div>

                  {/* Nominal */}
                  <p className={cn(
                    "text-sm font-semibold flex-shrink-0",
                    tx.type === "income" ? "text-emerald-500" : "text-red-400"
                  )}>
                    {tx.type === "income" ? "+" : "-"}
                    {formatRupiah(Number(tx.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Actions (Desktop only) ── */}
        <div className="hidden lg:flex px-8 mt-6 flex-wrap gap-3">
          <Link href={`/workspace/${workspace.id}/transactions`}>
            <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
              <Activity className="w-4 h-4" />
              Lihat Semua Transaksi
            </div>
          </Link>
          <Link href={`/workspace/${workspace.id}/report`}>
            <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
              Buat Laporan
            </div>
          </Link>
        </div>

        {/* ── Mobile FAB ── */}
        <Link href={`/workspace/${workspace.id}/transactions`}>
          <div
            className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center lg:hidden z-30"
            aria-label="Tambah transaksi"
          >
            <Plus className="w-6 h-6" />
          </div>
        </Link>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-6 text-red-500">
        <h1 className="text-xl font-bold mb-3">Error</h1>
        <p className="font-mono bg-red-500/10 p-4 rounded-xl text-sm whitespace-pre-wrap">
          {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }
}
