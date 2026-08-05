/**
 * Transactions Client — Mobile-first layout
 * Header ringkas, summary strip, filter + list
 */
"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { TransactionTable } from "@/components/transaction/transaction-table";
import { TransactionFiltersBar } from "@/components/transaction/transaction-filters";
import { TransactionForm } from "@/components/transaction/transaction-form";
import { formatRupiah } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { WorkspaceWithStats, Transaction, PaginatedResponse, TransactionFilters } from "@/types";
import type { SortingState } from "@tanstack/react-table";

interface TransactionsClientProps {
  workspace: WorkspaceWithStats;
  transactions: PaginatedResponse<Transaction>;
  userId: string;
  initialFilters: TransactionFilters;
}

export function TransactionsClient({
  workspace,
  transactions,
  userId,
  initialFilters,
}: TransactionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [sorting, setSorting] = useState<SortingState>(
    initialFilters.sortBy
      ? [{ id: initialFilters.sortBy, desc: initialFilters.sortOrder === "desc" }]
      : []
  );

  // Sync filter ke URL untuk server-side refetch
  const applyFilters = useCallback(
    (newFilters: TransactionFilters) => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.type && newFilters.type !== "all") params.set("type", newFilters.type);
      if (newFilters.dateFrom) params.set("dateFrom", newFilters.dateFrom);
      if (newFilters.dateTo) params.set("dateTo", newFilters.dateTo);
      if (newFilters.page && newFilters.page > 1) params.set("page", String(newFilters.page));
      if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
      if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname]
  );

  const handleFiltersChange = (partial: Partial<TransactionFilters>) => {
    const updated = { ...filters, ...partial };
    setFilters(updated);
    applyFilters(updated);
  };

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    const s = newSorting[0];
    handleFiltersChange({
      sortBy: s?.id ?? "date",
      sortOrder: s ? (s.desc ? "desc" : "asc") : "desc",
      page: 1,
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingTransaction(null);
  };

  const openAddForm = () => {
    setEditingTransaction(null);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 lg:px-8 lg:pt-8 bg-gradient-to-b from-muted/40 to-background">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Transaksi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {transactions.count} transaksi · {workspace.name}
            </p>
          </div>
          {/* Desktop add button */}
          <button
            onClick={openAddForm}
            className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            id="btn-add-transaction"
          >
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </button>
        </div>

        {/* Summary strip — 3 kartu ringkas */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2"
        >
          <div className={cn(
            "bg-card border rounded-xl p-3",
            workspace.balance >= 0 ? "border-border/50" : "border-red-500/20"
          )}>
            <p className="text-[10px] text-muted-foreground mb-1">Saldo</p>
            <p className={cn(
              "text-sm font-bold truncate",
              workspace.balance >= 0 ? "text-foreground" : "text-red-400"
            )}>
              {formatRupiah(workspace.balance)}
            </p>
          </div>
          <div className="bg-emerald-500/6 border border-emerald-500/15 rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Masuk</p>
            </div>
            <p className="text-sm font-bold text-emerald-500 truncate">
              {formatRupiah(workspace.total_income)}
            </p>
          </div>
          <div className="bg-red-500/6 border border-red-500/15 rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <p className="text-[10px] text-red-500 dark:text-red-400">Keluar</p>
            </div>
            <p className="text-sm font-bold text-red-400 truncate">
              {formatRupiah(workspace.total_expense)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Filters ── */}
      <div className="px-4 lg:px-8 pb-4">
        <TransactionFiltersBar filters={filters} onChange={handleFiltersChange} />
      </div>

      {/* ── Transaction List ── */}
      <div className="px-4 lg:px-8 pb-4">
        <TransactionTable
          data={transactions}
          workspaceId={workspace.id}
          isLoading={isPending}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          page={filters.page ?? 1}
          onPageChange={(p) => handleFiltersChange({ page: p })}
          onEdit={handleEdit}
        />
      </div>

      {/* ── Form Dialog ── */}
      <TransactionForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        workspaceId={workspace.id}
        userId={userId}
        transaction={editingTransaction}
      />

      {/* ── Mobile FAB ── */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={openAddForm}
        className="fixed bottom-[4.75rem] right-4 w-11 h-11 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center lg:hidden z-30"
        aria-label="Tambah transaksi"
        id="btn-add-transaction-mobile"
      >
        <Plus className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
