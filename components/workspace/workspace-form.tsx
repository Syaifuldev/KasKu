/**
 * Workspace Form — Sheet Drawer
 * Form untuk membuat dan mengedit workspace
 */
"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { workspaceSchema, type WorkspaceSchema } from "@/lib/validations/workspace.schema";
import { createWorkspace, updateWorkspace } from "@/lib/actions/workspace.actions";
import { WORKSPACE_ICONS, WORKSPACE_COLORS } from "@/types";
import { WorkspaceIcon } from "./workspace-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";

interface WorkspaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace?: Workspace | null;
}

export function WorkspaceForm({ open, onOpenChange, workspace }: WorkspaceFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!workspace;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WorkspaceSchema>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "wallet",
      color: "#10b981",
    },
  });

  // Populate form saat edit
  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        description: workspace.description ?? "",
        icon: workspace.icon,
        color: workspace.color,
      });
    } else {
      reset({ name: "", description: "", icon: "wallet", color: "#10b981" });
    }
  }, [workspace, reset]);

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  const onSubmit = (data: WorkspaceSchema) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description ?? "");
    formData.append("icon", data.icon);
    formData.append("color", data.color);

    startTransition(async () => {
      const result = isEdit
        ? await updateWorkspace(workspace!.id, formData)
        : await createWorkspace(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Workspace diperbarui" : "Workspace dibuat");
        onOpenChange(false);
        reset();
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEdit ? "Edit Workspace" : "Buat Workspace Baru"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Perbarui informasi workspace Anda"
              : "Buat wadah pencatatan kas baru"}
          </SheetDescription>
        </SheetHeader>

        {/* Preview */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl mb-6">
          <WorkspaceIcon icon={selectedIcon} color={selectedColor} size="md" />
          <div>
            <p className="font-medium text-sm">{watch("name") || "Nama Workspace"}</p>
            <p className="text-xs text-muted-foreground">Preview</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="ws-name">Nama Workspace *</Label>
            <Input
              id="ws-name"
              placeholder="Contoh: Karang Taruna"
              {...register("name")}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="ws-desc">Deskripsi</Label>
            <Textarea
              id="ws-desc"
              placeholder="Deskripsi singkat workspace (opsional)"
              rows={3}
              {...register("description")}
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {WORKSPACE_ICONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => setValue("icon", value)}
                  className={cn(
                    "p-2 rounded-xl border-2 transition-all flex items-center justify-center",
                    selectedIcon === value
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:border-border bg-muted/50"
                  )}
                >
                  <WorkspaceIcon icon={value} color={selectedColor} size="sm" className="w-6 h-6 rounded-md" />
                </button>
              ))}
            </div>
          </div>

          {/* Warna */}
          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex flex-wrap gap-2">
              {WORKSPACE_COLORS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => setValue("color", value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all ring-offset-background",
                    selectedColor === value
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: value }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : isEdit ? (
                "Simpan"
              ) : (
                "Buat Workspace"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
