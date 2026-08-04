/**
 * Transactions Client — Interactive list with filters and form
 */
"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { TransactionTable } from "@/components/transaction/transaction-table";
import { TransactionFiltersBar } from "@/components/transaction/transaction-filters";
import { TransactionForm } from "@/components/transaction/transaction-form";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
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

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href={`/workspace/${workspace.id}`}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {workspace.name}
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">Transaksi</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {transactions.count} transaksi total
          </p>
        </div>
        <Button
          onClick={() => { setEditingTransaction(null); setFormOpen(true); }}
          className="shadow-lg shadow-primary/20"
          id="btn-add-transaction"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Summary Strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Saldo</p>
          <p className={`font-bold text-lg ${workspace.balance >= 0 ? "text-emerald-500" : "text-red-400"}`}>
            {formatRupiah(workspace.balance)}
          </p>
        </div>
        <div className="bg-card border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <p className="text-xs text-emerald-500">Pemasukan</p>
          </div>
          <p className="font-bold text-lg text-emerald-500">
            {formatRupiah(workspace.total_income)}
          </p>
        </div>
        <div className="bg-card border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-3 h-3 text-red-400" />
            <p className="text-xs text-red-400">Pengeluaran</p>
          </div>
          <p className="font-bold text-lg text-red-400">
            {formatRupiah(workspace.total_expense)}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="mb-4">
        <TransactionFiltersBar
          filters={filters}
          onChange={handleFiltersChange}
        />
      </div>

      {/* Table */}
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

      {/* Form */}
      <TransactionForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        workspaceId={workspace.id}
        userId={userId}
        transaction={editingTransaction}
      />

      {/* Mobile FAB */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => { setEditingTransaction(null); setFormOpen(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center lg:hidden z-20"
        aria-label="Tambah transaksi"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
