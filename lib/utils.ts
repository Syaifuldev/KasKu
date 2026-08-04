/**
 * Utility Functions
 * Helper functions yang digunakan di seluruh aplikasi.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { id as localeId } from "date-fns/locale";

/** Merge Tailwind CSS classes dengan clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka ke format Rupiah
 * @example formatRupiah(150000) => "Rp 150.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

/**
 * Format angka singkat untuk display
 * @example formatCompact(1500000) => "1,5 Jt"
 */
export function formatCompact(amount: number): string {
  const num = Number(amount || 0);
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)} M`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)} Jt`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)} Rb`;
  }
  return num.toString();
}

/**
 * Format tanggal ke format Indonesia
 * @example formatDate("2024-01-15") => "15 Januari 2024"
 */
export function formatDate(date: string | Date): string {
  if (!date) return "-";
  try {
    return format(new Date(date), "d MMMM yyyy", { locale: localeId });
  } catch {
    return "-";
  }
}

/**
 * Format tanggal pendek
 * @example formatDateShort("2024-01-15") => "15 Jan 2024"
 */
export function formatDateShort(date: string | Date): string {
  if (!date) return "-";
  try {
    return format(new Date(date), "d MMM yyyy", { locale: localeId });
  } catch {
    return "-";
  }
}

/**
 * Format tanggal untuk input date HTML
 * @example formatDateInput(new Date()) => "2024-01-15"
 */
export function formatDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Dapatkan range tanggal berdasarkan periode
 */
export function getDateRangeFromPeriod(period: string): { from: Date; to: Date } {
  const now = new Date();
  switch (period) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "week":
      return { from: startOfWeek(now, { locale: localeId }), to: endOfWeek(now, { locale: localeId }) };
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "year":
      return { from: startOfYear(now), to: endOfYear(now) };
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

/**
 * Generate inisial dari nama untuk avatar
 * @example getInitials("Syaiful Dev") => "SD"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Buat URL file receipt dari Supabase Storage
 */
export function getReceiptUrl(supabaseUrl: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/receipts/${path}`;
}

/**
 * Tentukan apakah file adalah gambar berdasarkan extension
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return imageExtensions.includes(ext);
}

/**
 * Truncate teks panjang
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format bulan untuk chart (nama bulan singkat)
 */
export function formatMonthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return format(date, "MMM", { locale: localeId });
}

/**
 * Sleep/delay untuk loading states
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
