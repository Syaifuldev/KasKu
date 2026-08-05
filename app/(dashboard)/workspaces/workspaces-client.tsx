/**
 * Workspaces Client — Mobile-first grid
 * 1 kolom di mobile, 2-3 kolom di desktop
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen, Archive, Wallet } from "lucide-react";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { WorkspaceForm } from "@/components/workspace/workspace-form";
import { Button } from "@/components/ui/button";
import type { WorkspaceWithStats, Workspace } from "@/types";

interface WorkspacesClientProps {
  initialWorkspaces: WorkspaceWithStats[];
}

export function WorkspacesClient({ initialWorkspaces }: WorkspacesClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const activeWorkspaces = initialWorkspaces.filter((w) => !w.is_archived);
  const archivedWorkspaces = initialWorkspaces.filter((w) => w.is_archived);

  const handleEdit = (workspace: WorkspaceWithStats) => {
    setEditingWorkspace(workspace);
    setFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingWorkspace(null);
  };

  const openCreateForm = () => {
    setEditingWorkspace(null);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 lg:px-8 lg:pt-8 bg-gradient-to-b from-muted/40 to-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Workspace</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeWorkspaces.length} workspace aktif
            </p>
          </div>
          {/* Desktop add button */}
          <Button
            onClick={openCreateForm}
            className="hidden lg:flex shadow-lg shadow-primary/20"
            id="btn-create-workspace"
          >
            <Plus className="w-4 h-4 mr-2" />
            Workspace Baru
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-8">
        {/* Active Workspaces */}
        {activeWorkspaces.length === 0 ? (
          <EmptyState onCreateNew={openCreateForm} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {activeWorkspaces.map((workspace, index) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onEdit={handleEdit}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Archived Workspaces */}
        {archivedWorkspaces.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 py-2"
            >
              <Archive className="w-4 h-4" />
              Diarsipkan ({archivedWorkspaces.length})
              <span className="text-xs">{showArchived ? "▲" : "▼"}</span>
            </button>

            <AnimatePresence>
              {showArchived && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                  {archivedWorkspaces.map((workspace, index) => (
                    <WorkspaceCard
                      key={workspace.id}
                      workspace={workspace}
                      onEdit={handleEdit}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Workspace Form */}
      <WorkspaceForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        workspace={editingWorkspace}
      />

      {/* Mobile FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={openCreateForm}
        className="fixed bottom-[4.75rem] right-4 w-11 h-11 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center lg:hidden z-30"
        aria-label="Buat workspace baru"
        id="btn-create-workspace-mobile"
      >
        <Plus className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card/50 border border-border/50 rounded-2xl relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 blur-3xl rounded-full opacity-50" />
      <div className="relative z-10">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-16 h-16 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary/15"
        >
          <Wallet className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-lg font-bold mb-2">Belum ada workspace</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
          Buat workspace untuk mulai mencatat keuangan Anda.
        </p>
        <Button
          onClick={onCreateNew}
          className="shadow-lg shadow-primary/20 rounded-xl px-6"
          id="btn-create-workspace-empty"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Workspace
        </Button>
      </div>
    </motion.div>
  );
}
