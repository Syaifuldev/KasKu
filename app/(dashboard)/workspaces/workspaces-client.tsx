/**
 * Workspaces Client — Interactive Workspace Grid
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen, Archive } from "lucide-react";
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

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspace</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeWorkspaces.length} workspace aktif
          </p>
        </div>
        <Button
          onClick={() => { setEditingWorkspace(null); setFormOpen(true); }}
          className="shadow-lg shadow-primary/20"
          id="btn-create-workspace"
        >
          <Plus className="w-4 h-4 mr-2" />
          Workspace Baru
        </Button>
      </div>

      {/* Active Workspaces Grid */}
      {activeWorkspaces.length === 0 ? (
        <EmptyState onCreateNew={() => { setEditingWorkspace(null); setFormOpen(true); }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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

      {/* Workspace Form Sheet */}
      <WorkspaceForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        workspace={editingWorkspace}
      />

      {/* Mobile FAB */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => { setEditingWorkspace(null); setFormOpen(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center lg:hidden z-20"
        aria-label="Buat workspace baru"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Belum ada workspace</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        Buat workspace pertama Anda untuk mulai mencatat pemasukan dan pengeluaran kas
      </p>
      <Button onClick={onCreateNew} className="shadow-lg shadow-primary/20">
        <Plus className="w-4 h-4 mr-2" />
        Buat Workspace Pertama
      </Button>
    </motion.div>
  );
}
