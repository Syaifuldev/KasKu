/**
 * Workspace Dashboard Page
 * Menampilkan ringkasan workspace: saldo, grafik, transaksi terbaru
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  ArrowLeft,
  Edit2,
} from "lucide-react";
import { getWorkspaceById, getMonthlyChartData } from "@/lib/queries/workspace.queries";
import { getRecentTransactions } from "@/lib/queries/transaction.queries";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { StatsCard } from "@/components/dashboard/stats-card";
import { MonthlyChart } from "@/components/dashboard/monthly-chart-wrapper";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WorkspaceDashboardClient } from "./workspace-dashboard-client";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  const [workspace, chartData, recentTransactions] = await Promise.all([
    getWorkspaceById(id),
    getMonthlyChartData(id),
    getRecentTransactions(id, 5),
  ]);

  if (!workspace) notFound();

  const balanceColor =
    Number(workspace.balance || 0) >= 0 ? "text-emerald-500" : "text-red-400";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/workspaces"
          className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Workspace
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium truncate">{workspace.name}</span>
      </div>

      {/* Workspace Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <WorkspaceIcon icon={workspace.icon} color={workspace.color} size="lg" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-muted-foreground text-sm mt-0.5">{workspace.description}</p>
            )}
          </div>
        </div>
        <WorkspaceDashboardClient workspace={workspace} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Saldo Saat Ini"
          value={formatRupiah(Number(workspace.balance || 0))}
          icon={Wallet}
          type={Number(workspace.balance || 0) >= 0 ? "emerald" : "red"}
          index={0}
        />
        <StatsCard
          title="Total Pemasukan"
          value={formatRupiah(Number(workspace.total_income || 0))}
          icon={TrendingUp}
          type="emerald"
          index={1}
        />
        <StatsCard
          title="Total Pengeluaran"
          value={formatRupiah(Number(workspace.total_expense || 0))}
          icon={TrendingDown}
          type="red"
          index={2}
        />
        <StatsCard
          title="Jumlah Transaksi"
          value={String(workspace.transaction_count || 0)}
          subtitle="total transaksi"
          icon={Activity}
          type="blue"
          index={3}
        />
      </div>

      {/* Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3">
          <MonthlyChart data={chartData} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={recentTransactions}
            workspaceId={workspace.id}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/workspace/${workspace.id}/transactions`}>
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Lihat Semua Transaksi
          </Button>
        </Link>
        <Link href={`/workspace/${workspace.id}/report`}>
          <Button variant="outline" size="sm">
            Buat Laporan
          </Button>
        </Link>
      </div>

      {/* Mobile FAB — Tambah Transaksi */}
      <Link href={`/workspace/${workspace.id}/transactions`}>
        <div
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center lg:hidden z-20"
          aria-label="Tambah transaksi"
        >
          <Plus className="w-6 h-6" />
        </div>
      </Link>
    </div>
  );
}
