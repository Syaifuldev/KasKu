/**
 * Workspace Settings Client — Manajemen Kategori
 * CRUD kategori per workspace dengan UI yang premium
 */
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus,
  Tag,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/category.actions";
import { categorySchema, type CategorySchema } from "@/lib/validations/category.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import type { WorkspaceWithStats, Category } from "@/types";

const COLOR_OPTIONS = [
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
  { value: "#ec4899", label: "Pink" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#84cc16", label: "Lime" },
  { value: "#64748b", label: "Slate" },
];

interface WorkspaceSettingsClientProps {
  workspace: WorkspaceWithStats;
  categories: Category[];
}

export function WorkspaceSettingsClient({
  workspace,
  categories: initialCategories,
}: WorkspaceSettingsClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // ── Add Form ──
  const addForm = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", color: "#6366f1" },
  });
  const addColor = addForm.watch("color");

  // ── Edit Form ──
  const editForm = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", color: "#6366f1" },
  });
  const editColor = editForm.watch("color");

  const handleAdd = (data: CategorySchema) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("color", data.color);

    startTransition(async () => {
      const result = await createCategory(workspace.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Kategori ditambahkan");
        setCategories((prev) =>
          [...prev, result.data as Category].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
        addForm.reset({ name: "", color: "#6366f1" });
        setShowAddForm(false);
      }
    });
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    editForm.reset({ name: cat.name, color: cat.color });
  };

  const handleEdit = (data: CategorySchema) => {
    if (!editingId) return;
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("color", data.color);

    startTransition(async () => {
      const result = await updateCategory(editingId, workspace.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Kategori diperbarui");
        setCategories((prev) =>
          prev
            .map((c) =>
              c.id === editingId
                ? { ...c, name: data.name, color: data.color }
                : c
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingId(null);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteCategory(deleteTarget.id, workspace.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Kategori dihapus");
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    });
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Settings2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Pengaturan Workspace</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{workspace.name}</p>
        </div>
      </div>

      {/* Category Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-semibold">Kategori Transaksi</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {categories.length} kategori
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
            }}
            disabled={showAddForm}
            className="h-8 rounded-xl gap-1.5"
            id="btn-add-category"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </Button>
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-border/60"
            >
              <form
                onSubmit={addForm.handleSubmit(handleAdd)}
                className="px-5 py-4 bg-muted/30 space-y-3"
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Kategori Baru
                </p>
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="add-cat-name" className="text-xs">
                      Nama Kategori *
                    </Label>
                    <Input
                      id="add-cat-name"
                      placeholder="Contoh: Iuran, Konsumsi, Operasional"
                      className="h-10 rounded-xl"
                      {...addForm.register("name")}
                      disabled={isPending}
                      autoFocus
                    />
                    {addForm.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {addForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Color Picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Warna</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => addForm.setValue("color", c.value)}
                        className={cn(
                          "w-7 h-7 rounded-lg transition-all ring-offset-background",
                          addColor === c.value
                            ? "ring-2 ring-offset-2 ring-foreground/40 scale-110"
                            : "hover:scale-105"
                        )}
                        style={{ backgroundColor: c.value }}
                      >
                        {addColor === c.value && (
                          <Check className="w-3.5 h-3.5 text-white mx-auto drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Preview:</span>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: addColor + "22",
                      color: addColor,
                      border: `1px solid ${addColor}44`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: addColor }}
                    />
                    {addForm.watch("name") || "Nama Kategori"}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-xl gap-1.5"
                    onClick={() => {
                      setShowAddForm(false);
                      addForm.reset();
                    }}
                    disabled={isPending}
                  >
                    <X className="w-3.5 h-3.5" />
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 rounded-xl gap-1.5"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Simpan
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category List */}
        {categories.length === 0 && !showAddForm ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3">
              <Tag className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">Belum ada kategori</p>
            <p className="text-xs text-muted-foreground">
              Tambah kategori untuk mengorganisir transaksi
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            <AnimatePresence initial={false}>
              {categories.map((cat) => (
                <motion.li
                  key={cat.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="px-5 py-3.5"
                >
                  {editingId === cat.id ? (
                    /* ── Edit inline ── */
                    <form
                      onSubmit={editForm.handleSubmit(handleEdit)}
                      className="space-y-3"
                    >
                      <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-1.5">
                          <Input
                            className="h-9 rounded-xl text-sm"
                            {...editForm.register("name")}
                            disabled={isPending}
                            autoFocus
                          />
                          {editForm.formState.errors.name && (
                            <p className="text-xs text-destructive">
                              {editForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Color */}
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            title={c.label}
                            onClick={() => editForm.setValue("color", c.value)}
                            className={cn(
                              "w-6 h-6 rounded-md transition-all ring-offset-background",
                              editColor === c.value
                                ? "ring-2 ring-offset-1 ring-foreground/40 scale-110"
                                : "hover:scale-105"
                            )}
                            style={{ backgroundColor: c.value }}
                          >
                            {editColor === c.value && (
                              <Check className="w-3 h-3 text-white mx-auto drop-shadow" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg gap-1"
                          onClick={() => setEditingId(null)}
                          disabled={isPending}
                        >
                          <X className="w-3 h-3" /> Batal
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="h-8 rounded-lg gap-1"
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Simpan
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* ── Display row ── */
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-1 min-w-0"
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
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          title="Edit"
                          disabled={isPending}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
                          title="Hapus"
                          disabled={isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori <strong>{deleteTarget?.name}</strong> akan dihapus.
              Transaksi yang menggunakan kategori ini tidak akan terhapus, namun
              kategorinya akan menjadi kosong.
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
    </div>
  );
}
