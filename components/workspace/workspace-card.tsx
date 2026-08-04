/**
 * Workspace Card Component
 * Menampilkan satu workspace dalam grid view
 */
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatRupiah, formatCompact } from "@/lib/utils";
import { toggleArchiveWorkspace, deleteWorkspace } from "@/lib/actions/workspace.actions";
import { WorkspaceIcon } from "./workspace-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import { Badge } from "@/components/ui/badge";
import type { WorkspaceWithStats } from "@/types";

interface WorkspaceCardProps {
  workspace: WorkspaceWithStats;
  onEdit: (workspace: WorkspaceWithStats) => void;
  index?: number;
}

export function WorkspaceCard({ workspace, onEdit, index = 0 }: WorkspaceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    startTransition(async () => {
      const result = await toggleArchiveWorkspace(workspace.id, workspace.is_archived);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          workspace.is_archived ? "Workspace diaktifkan kembali" : "Workspace diarsipkan"
        );
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWorkspace(workspace.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Workspace dihapus");
        setShowDeleteDialog(false);
      }
    });
  };

  const balanceColor =
    workspace.balance >= 0 ? "text-emerald-500" : "text-red-400";

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="block h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={cn(
            "group relative bg-card border border-border rounded-2xl p-5 transition-all duration-200 hover:border-border/80 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5",
            workspace.is_archived && "opacity-60"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <WorkspaceIcon icon={workspace.icon} color={workspace.color} size="md" />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm leading-tight truncate max-w-[140px]">
                  {workspace.name}
                </h3>
                {workspace.is_archived && (
                  <Badge variant="outline" className="text-[10px] mt-0.5 h-4">
                    Arsip
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-all bg-transparent border-0 cursor-pointer"
                onClick={(e: React.MouseEvent) => e.preventDefault()}
                aria-label="Menu aksi"
              >
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onEdit(workspace)}>
                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive} disabled={isPending}>
                  {workspace.is_archived ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5 mr-2" />
                      Aktifkan
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 mr-2" />
                      Arsipkan
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Deskripsi */}
          {workspace.description && (
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              {workspace.description}
            </p>
          )}

          {/* Saldo */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">Saldo</p>
            <p className={cn("text-xl font-bold tracking-tight", balanceColor)}>
              {formatRupiah(workspace.balance)}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-emerald-500/10 rounded-xl p-2.5">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-medium">Masuk</span>
              </div>
              <p className="text-sm font-semibold text-emerald-500">
                {formatCompact(workspace.total_income)}
              </p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-2.5">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-[10px] text-red-400 font-medium">Keluar</span>
              </div>
              <p className="text-sm font-semibold text-red-400">
                {formatCompact(workspace.total_expense)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {workspace.transaction_count} transaksi
            </span>
            {!workspace.is_archived && (
              <Link href={`/workspace/${workspace.id}`}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  Buka
                  <ArrowUpRight className="w-3 h-3" />
                </motion.div>
              </Link>
            )}
          </div>
        </motion.div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-44">
        <ContextMenuItem onClick={() => onEdit(workspace)}>
          <Edit2 className="w-3.5 h-3.5 mr-2" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={handleArchive} disabled={isPending}>
          <Archive className="w-3.5 h-3.5 mr-2" />
          {workspace.is_archived ? "Aktifkan" : "Arsipkan"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Hapus
        </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Workspace <strong>{workspace.name}</strong> dan semua transaksinya akan dihapus
              secara permanen. Tindakan ini tidak dapat dibatalkan.
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
