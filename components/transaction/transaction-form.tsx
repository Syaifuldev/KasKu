/**
 * Transaction Form — Sheet Drawer
 * Form tambah / edit transaksi
 */
"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { transactionSchema, type TransactionSchema } from "@/lib/validations/transaction.schema";
import { createTransaction, updateTransaction } from "@/lib/actions/transaction.actions";
import { ReceiptUpload } from "./receipt-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn, formatDateInput } from "@/lib/utils";
import type { Transaction } from "@/types";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  userId: string;
  transaction?: Transaction | null;
}

export function TransactionForm({
  open,
  onOpenChange,
  workspaceId,
  userId,
  transaction,
}: TransactionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const isEdit = !!transaction;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: formatDateInput(new Date()),
      type: "income",
      amount: undefined,
      description: "",
      receipt_url: null,
    },
  });

  const selectedType = watch("type");

  // Populate form saat edit
  useEffect(() => {
    if (transaction) {
      reset({
        date: transaction.date,
        type: transaction.type,
        amount: Number(transaction.amount),
        description: transaction.description,
        receipt_url: transaction.receipt_url,
      });
      setReceiptUrl(transaction.receipt_url);
    } else {
      reset({
        date: formatDateInput(new Date()),
        type: "income",
        amount: undefined,
        description: "",
        receipt_url: null,
      });
      setReceiptUrl(null);
    }
  }, [transaction, reset, open]);

  const onSubmit = (data: TransactionSchema) => {
    const formData = new FormData();
    formData.append("date", data.date);
    formData.append("type", data.type);
    formData.append("amount", String(data.amount));
    formData.append("description", data.description);
    if (receiptUrl) formData.append("receipt_url", receiptUrl);

    startTransition(async () => {
      const result = isEdit
        ? await updateTransaction(transaction!.id, workspaceId, formData)
        : await createTransaction(workspaceId, formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Transaksi diperbarui" : "Transaksi ditambahkan");
        onOpenChange(false);
        reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle>{isEdit ? "Edit Transaksi" : "Tambah Transaksi"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui data transaksi" : "Catat pemasukan atau pengeluaran baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Jenis Transaksi */}
          <div className="space-y-2">
            <Label>Jenis Transaksi *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue("type", "income")}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all",
                  selectedType === "income"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                    : "border-border bg-muted/50 text-muted-foreground hover:border-border/80"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setValue("type", "expense")}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all",
                  selectedType === "expense"
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-border bg-muted/50 text-muted-foreground hover:border-border/80"
                )}
              >
                <TrendingDown className="w-4 h-4" />
                Pengeluaran
              </button>
            </div>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Nominal */}
          <div className="space-y-2">
            <Label htmlFor="tx-amount">Nominal *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                Rp
              </span>
              <Input
                id="tx-amount"
                type="number"
                placeholder="0"
                min="0"
                className="pl-9 h-11"
                {...register("amount", { valueAsNumber: true })}
                disabled={isPending}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Tanggal */}
          <div className="space-y-2">
            <Label htmlFor="tx-date">Tanggal *</Label>
            <Input
              id="tx-date"
              type="date"
              className="h-11"
              {...register("date")}
              disabled={isPending}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Keterangan */}
          <div className="space-y-2">
            <Label htmlFor="tx-desc">Keterangan *</Label>
            <Textarea
              id="tx-desc"
              placeholder="Contoh: Iuran bulanan anggota"
              rows={3}
              {...register("description")}
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Upload Bukti */}
          <div className="space-y-2">
            <Label>Bukti Transaksi (opsional)</Label>
            <ReceiptUpload
              userId={userId}
              workspaceId={workspaceId}
              value={receiptUrl}
              onChange={(url) => {
                setReceiptUrl(url);
                setValue("receipt_url", url);
              }}
              disabled={isPending}
            />
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
                "Tambah Transaksi"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
