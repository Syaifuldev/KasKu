/**
 * Transaction List — Mobile-friendly card list
 * Menggantikan tabel dengan list item yang mudah di-tap di HP
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
  TrendingDown,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { deleteTransaction } from "@/lib/actions/transaction.actions";
import { cn, formatRupiah, formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
}

export function TransactionTable({
  data,
  workspaceId,
  isLoading,
  page,
  onPageChange,
  onEdit,
  categories = [],
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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-2xl" />
        ))}
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
      {/* Transaction List */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/40">
        <AnimatePresence initial={false}>
          {data.data.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ delay: i * 0.025, duration: 0.2 }}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-muted/40 transition-colors"
            >
              {/* Type Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  tx.type === "income" ? "bg-emerald-500/12" : "bg-red-500/12"
                )}
              >
                {tx.type === "income" ? (
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4.5 h-4.5 text-red-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {formatDateShort(tx.date)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-4 px-1.5 text-[10px] font-medium",
                      tx.type === "income" ? "badge-income" : "badge-expense"
                    )}
                  >
                    {tx.type === "income" ? "Masuk" : "Keluar"}
                  </Badge>
                  {/* Badge Kategori */}
                  {tx.category_id && (() => {
                    const cat = categories.find((c) => c.id === tx.category_id);
                    return cat ? (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 h-4 rounded-full text-[10px] font-medium"
                        style={{
                          backgroundColor: cat.color + "22",
                          color: cat.color,
                          border: `1px solid ${cat.color}44`,
                        }}
                      >
                        <span
                          className="w-1 h-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </span>
                    ) : null;
                  })()}
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
              </div>

              {/* Amount */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    tx.type === "income" ? "text-emerald-500" : "text-red-400"
                  )}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatRupiah(Number(tx.amount))}
                </span>

                {/* Action menu */}
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
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
