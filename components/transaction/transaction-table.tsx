/**
 * Transaction Table — Buku Kas Style
 * Tabel dengan kolom: No, Tanggal, Keterangan, Pemasukan, Pengeluaran, Saldo
 */
"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { deleteTransaction } from "@/lib/actions/transaction.actions";
import { cn, formatRupiah, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction, PaginatedResponse, Category } from "@/types";
import type { SortingState } from "@tanstack/react-table";

interface TransactionTableProps {
  data: PaginatedResponse<Transaction>;
  workspaceId: string;
  isLoading?: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  categories?: Category[];
  /** Saldo awal sebelum halaman ini (untuk running balance lintas halaman) */
  initialBalance?: number;
}

export function TransactionTable({
  data,
  workspaceId,
  isLoading,
  page,
  onPageChange,
  onEdit,
  categories = [],
  initialBalance = 0,
}: TransactionTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteTransaction(deleteTarget.id, workspaceId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Transaksi dihapus");
        setDeleteTarget(null);
      }
    });
  };

  // Hitung running balance kumulatif untuk data di halaman ini
  const transactionsWithBalance = data.data.reduce(
    (acc, t) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].running_balance : initialBalance;
      const delta = t.type === "income" ? Number(t.amount) : -Number(t.amount);
      return [...acc, { ...t, running_balance: prev + delta }];
    },
    [] as (Transaction & { running_balance: number })[]
  );

  // Offset nomor urut berdasar halaman
  const rowOffset = (page - 1) * data.pageSize;

  if (isLoading) {
    return (
      <div className="rounded-2xl overflow-hidden border border-border/50">
        {/* Fake header */}
        <div className="grid grid-cols-6 bg-emerald-600 px-4 py-3 gap-2">
          {["No", "Tanggal", "Keterangan", "Pemasukan", "Pengeluaran", "Saldo"].map((h) => (
            <Skeleton key={h} className="h-4 bg-emerald-500/40 rounded" />
          ))}
        </div>
        <div className="divide-y divide-border/40 bg-card">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 px-4 py-4 gap-2 items-center">
              {[...Array(6)].map((__, j) => (
                <Skeleton key={j} className="h-4 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/50 border border-border/50 rounded-2xl"
      >
        <div className="w-14 h-14 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/15">
          <TrendingUp className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-base font-semibold mb-1">Belum ada transaksi</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Ketuk tombol <strong>+</strong> untuk mencatat pemasukan atau pengeluaran pertama.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* ── Buku Kas Table ── */}
      <div className="rounded-2xl overflow-hidden border border-border/50 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          {/* Header Hijau */}
          <thead>
            <tr className="bg-emerald-600">
              <th className="px-3 py-3.5 text-center text-sm font-semibold text-white w-12">No</th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-white w-32">Tanggal</th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-white">Keterangan</th>
              <th className="px-4 py-3.5 text-right text-sm font-semibold text-white w-36">Pemasukan</th>
              <th className="px-4 py-3.5 text-right text-sm font-semibold text-white w-36">Pengeluaran</th>
              <th className="px-4 py-3.5 text-right text-sm font-semibold text-white w-36">Saldo</th>
              <th className="px-2 py-3.5 w-10 bg-emerald-600" />
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-card divide-y divide-border/40">
            <AnimatePresence initial={false}>
              {transactionsWithBalance.map((tx, i) => {
                const cat = categories.find((c) => c.id === tx.category_id);
                return (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ delay: i * 0.02, duration: 0.18 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* No */}
                    <td className="px-3 py-4 text-center text-sm text-muted-foreground">
                      {rowOffset + i + 1}
                    </td>

                    {/* Tanggal */}
                    <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">
                      {formatDateShort(tx.date)}
                    </td>

                    {/* Keterangan */}
                    <td className="px-4 py-4 text-sm text-foreground">
                      <p className="leading-snug">{tx.description}</p>
                      {/* Sub-info: kategori & bukti */}
                      {(cat || tx.receipt_url) && (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {cat && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                              style={{
                                backgroundColor: cat.color + "22",
                                color: cat.color,
                                border: `1px solid ${cat.color}44`,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </span>
                          )}
                          {tx.receipt_url && (
                            <a
                              href={tx.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {tx.receipt_url.toLowerCase().includes(".pdf") ? (
                                <FileText className="w-3 h-3" />
                              ) : (
                                <ImageIcon className="w-3 h-3" />
                              )}
                              Bukti
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Pemasukan */}
                    <td className="px-4 py-4 text-right text-sm">
                      {tx.type === "income" ? (
                        <span className="font-medium text-emerald-500">
                          {formatRupiah(Number(tx.amount))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    {/* Pengeluaran */}
                    <td className="px-4 py-4 text-right text-sm">
                      {tx.type === "expense" ? (
                        <span className="font-medium text-red-500">
                          {formatRupiah(Number(tx.amount))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    {/* Saldo */}
                    <td className="px-4 py-4 text-right text-sm font-bold text-foreground">
                      {formatRupiah(tx.running_balance)}
                    </td>

                    {/* Action menu */}
                    <td className="px-2 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/60 transition-colors"
                              aria-label="Opsi transaksi"
                            />
                          }
                        >
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => onEdit(tx)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Transaksi
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(tx)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-muted-foreground">
            {(page - 1) * data.pageSize + 1}–{Math.min(page * data.pageSize, data.count)} dari {data.count}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-9 w-9 p-0 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[52px] text-center">
              {page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= data.totalPages}
              className="h-9 w-9 p-0 rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.description}</strong> akan dihapus secara permanen.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
