/**
 * Receipt Upload Component
 * Upload bukti transaksi (gambar/PDF) ke Supabase Storage
 */
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, ImageIcon, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReceiptUploadProps {
  userId: string;
  workspaceId: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ReceiptUpload({
  userId,
  workspaceId,
  value,
  onChange,
  disabled,
}: ReceiptUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isImage = preview && !preview.endsWith(".pdf") && !preview.includes("pdf");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    // Validasi tipe
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Format file harus JPG, PNG, WebP, atau PDF");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filename = `${userId}/${workspaceId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("receipts")
        .upload(filename, file, { upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("receipts")
        .getPublicUrl(filename);

      setPreview(publicUrl);
      onChange(publicUrl);
      toast.success("Bukti berhasil diupload");
    } catch {
      toast.error("Gagal mengupload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        id="receipt-upload"
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border border-border bg-muted/50"
          >
            {isImage ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Bukti transaksi"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors"
                    disabled={disabled}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Dokumen PDF</p>
                  <a
                    href={preview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Buka file
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            htmlFor="receipt-upload"
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5",
              (disabled || isUploading) && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {isUploading ? "Mengupload..." : "Upload Bukti"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG, WebP atau PDF · Maks 5MB
              </p>
            </div>
          </motion.label>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewOpen && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full"
            >
              <img
                src={preview}
                alt="Bukti transaksi"
                className="w-full rounded-xl"
              />
              <button
                onClick={() => setPreviewOpen(false)}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
