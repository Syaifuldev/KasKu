/**
 * Workspace Dashboard Client
 * Tombol Edit Workspace di header dashboard
 */
"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceForm } from "@/components/workspace/workspace-form";
import type { WorkspaceWithStats } from "@/types";

interface WorkspaceDashboardClientProps {
  workspace: WorkspaceWithStats;
}

export function WorkspaceDashboardClient({ workspace }: WorkspaceDashboardClientProps) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setFormOpen(true)} className="flex-shrink-0">
        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
        Edit
      </Button>
      <WorkspaceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        workspace={workspace}
      />
    </>
  );
}
