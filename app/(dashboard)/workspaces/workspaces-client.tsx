/**
 * Workspaces Client — Interactive Workspace Grid
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
      className="text-center py-24 px-4 bg-card/50 border border-border/50 rounded-3xl glass relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-3xl rounded-full opacity-50" />
      
      <div className="relative z-10">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-lg shadow-primary/10"
        >
          <Wallet className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-3">Belum ada workspace</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
          Buat workspace pertama Anda untuk mulai mengelola keuangan, memantau pengeluaran, dan mencapai target finansial Anda.
        </p>
        <Button 
          onClick={onCreateNew} 
          size="lg"
          className="shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Buat Workspace
        </Button>
      </div>
    </motion.div>
  );
}
