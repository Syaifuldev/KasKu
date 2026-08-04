/**
 * Transaction Table — TanStack Table dengan server-side pagination
 * Fitur: search, filter tanggal, sort, edit, delete, preview bukti
 */
"use client";

import { useState, useTransition, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
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
import type { Transaction, PaginatedResponse } from "@/types";

interface TransactionTableProps {
  data: PaginatedResponse<Transaction>;
  workspaceId: string;
  isLoading?: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionTable({
  data,
  workspaceId,
  isLoading,
  sorting,
  onSortingChange,
  page,
  onPageChange,
  onEdit,
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

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: "Tanggal",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDateShort(row.getValue("date"))}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Jenis",
      cell: ({ row }) => {
        const type = row.getValue<string>("type");
        return (
          <Badge
            variant="outline"
            className={cn(
              "gap-1 text-xs",
              type === "income"
                ? "badge-income"
                : "badge-expense"
            )}
          >
            {type === "income" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {type === "income" ? "Masuk" : "Keluar"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Keterangan",
      cell: ({ row }) => (
        <p className="text-sm max-w-[200px] truncate">
          {row.getValue("description")}
        </p>
      ),
    },
    {
      accessorKey: "amount",
      header: "Nominal",
      cell: ({ row }) => {
        const type = row.original.type;
        const amount = Number(row.getValue("amount"));
        return (
          <span
            className={cn(
              "text-sm font-semibold whitespace-nowrap",
              type === "income" ? "text-emerald-500" : "text-red-400"
            )}
          >
            {type === "income" ? "+" : "-"}
            {formatRupiah(amount)}
          </span>
        );
      },
    },
    {
      accessorKey: "receipt_url",
      header: "Bukti",
      enableSorting: false,
      cell: ({ row }) => {
        const url = row.getValue<string | null>("receipt_url");
        if (!url) return <span className="text-xs text-muted-foreground/40">—</span>;
        const isPdf = url.toLowerCase().includes(".pdf");
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {isPdf ? (
              <FileText className="w-3.5 h-3.5" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5" />
            )}
            Lihat
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(row.original)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: data.totalPages,
    state: { sorting },
    onSortingChange: (updaterOrValue: Updater<SortingState>) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      onSortingChange(newSorting);
    },
  });

  const handleSort = (columnId: string) => {
    const existing = sorting.find((s) => s.id === columnId);
    if (!existing) {
      onSortingChange([{ id: columnId, desc: true }]);
    } else if (existing.desc) {
      onSortingChange([{ id: columnId, desc: false }]);
    } else {
      onSortingChange([]);
    }
  };

  const getSortIcon = (columnId: string) => {
    const s = sorting.find((s) => s.id === columnId);
    if (!s) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return s.desc ? (
      <ChevronDown className="w-3 h-3 ml-1 text-primary" />
    ) : (
      <ChevronUp className="w-3 h-3 ml-1 text-primary" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <TrendingUp className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="font-medium mb-1">Belum ada transaksi</p>
        <p className="text-sm text-muted-foreground">
          Klik tombol "Tambah Transaksi" untuk mulai mencatat
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {header.column.getCanSort() ? (
                      <button
                        onClick={() => handleSort(header.id)}
                        className="flex items-center hover:text-foreground transition-colors"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {getSortIcon(header.id)}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(page - 1) * data.pageSize + 1}–
            {Math.min(page * data.pageSize, data.count)} dari {data.count} transaksi
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-1">
              {page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= data.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi <strong>{deleteTarget?.description}</strong> akan dihapus
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
