/**
 * Report Client — Laporan interaktif dengan export
 */
"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatRupiah, formatDate, formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkspaceWithStats, Transaction } from "@/types";

interface ReportClientProps {
  workspace: WorkspaceWithStats;
  transactions: Transaction[];
  period: string;
  dateFrom: string;
  dateTo: string;
}

const PERIOD_OPTIONS = [
  { value: "today", label: "Hari Ini" },
  { value: "week", label: "Minggu Ini" },
  { value: "month", label: "Bulan Ini" },
  { value: "year", label: "Tahun Ini" },
  { value: "custom", label: "Kustom" },
];

export function ReportClient({
  workspace,
  transactions,
  period: initialPeriod,
  dateFrom: initialFrom,
  dateTo: initialTo,
}: ReportClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [customFrom, setCustomFrom] = useState(initialFrom);
  const [customTo, setCustomTo] = useState(initialTo);
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const handlePeriodChange = (p: string) => {
    setSelectedPeriod(p);
    if (p !== "custom") {
      startTransition(() => {
        router.push(`${pathname}?period=${p}`);
      });
    }
  };

  const handleCustomApply = () => {
    if (!customFrom || !customTo) {
      toast.error("Pilih tanggal awal dan akhir");
      return;
    }
    startTransition(() => {
      router.push(`${pathname}?period=custom&from=${customFrom}&to=${customTo}`);
    });
  };

  // Hitung running balance
  const transactionsWithBalance = transactions.reduce(
    (acc, t) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].running_balance : 0;
      const delta = t.type === "income" ? Number(t.amount) : -Number(t.amount);
      return [...acc, { ...t, running_balance: prev + delta }];
    },
    [] as (Transaction & { running_balance: number })[]
  );

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const finalBalance = totalIncome - totalExpense;

  // Export Excel
  const handleExcelExport = async () => {
    setIsExporting("excel");
    try {
      const { utils, writeFile } = await import("xlsx");
      const wsData = [
        [`Laporan Kas — ${workspace.name}`],
        [`Periode: ${formatDate(initialFrom)} s/d ${formatDate(initialTo)}`],
        [],
        ["No", "Tanggal", "Keterangan", "Pemasukan", "Pengeluaran", "Saldo Berjalan"],
        ...transactionsWithBalance.map((t, i) => [
          i + 1,
          formatDateShort(t.date),
          t.description,
          t.type === "income" ? Number(t.amount) : 0,
          t.type === "expense" ? Number(t.amount) : 0,
          t.running_balance,
        ]),
        [],
        ["", "", "TOTAL", totalIncome, totalExpense, finalBalance],
      ];

      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet(wsData);
      utils.book_append_sheet(wb, ws, "Laporan");
      writeFile(wb, `Laporan-${workspace.name}-${initialFrom}-${initialTo}.xlsx`);
      toast.success("File Excel berhasil diunduh");
    } catch {
      toast.error("Gagal mengekspor Excel");
    } finally {
      setIsExporting(null);
    }
  };

  // Export PDF
  const handlePdfExport = async () => {
    setIsExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header Background (Emerald)
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(0, 0, pageWidth, 40, "F");
      
      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN KEUANGAN", 14, 22);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Workspace: ${workspace.name}`, 14, 30);
      doc.text(`Periode: ${formatDate(initialFrom)} s/d ${formatDate(initialTo)}`, 14, 35);
      
      // Reset text color for body
      doc.setTextColor(50, 50, 50);
      
      // Summary Cards
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Ringkasan", 14, 50);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Total Pemasukan: ${formatRupiah(totalIncome)}`, 14, 56);
      doc.text(`Total Pengeluaran: ${formatRupiah(totalExpense)}`, 80, 56);
      doc.text(`Saldo Akhir: ${formatRupiah(finalBalance)}`, 150, 56);

      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 60, pageWidth - 14, 60);

      autoTable(doc, {
        startY: 65,
        head: [["No", "Tanggal", "Keterangan", "Masuk", "Keluar", "Saldo"]],
        body: [
          ...transactionsWithBalance.map((t, i) => [
            i + 1,
            formatDateShort(t.date),
            t.description,
            t.type === "income" ? formatRupiah(Number(t.amount)) : "-",
            t.type === "expense" ? formatRupiah(Number(t.amount)) : "-",
            formatRupiah(t.running_balance),
          ]),
          ["", "", "TOTAL", formatRupiah(totalIncome), formatRupiah(totalExpense), formatRupiah(finalBalance)],
        ],
        theme: 'striped',
        styles: { 
          fontSize: 8,
          cellPadding: 3,
          textColor: [60, 60, 60],
        },
        headStyles: { 
          fillColor: [240, 243, 245], 
          textColor: [40, 40, 40],
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        alternateRowStyles: {
          fillColor: [250, 252, 253]
        },
        footStyles: { 
          fontStyle: "bold",
          fillColor: [255, 255, 255],
          textColor: [20, 20, 20],
          lineWidth: 0.5,
          lineColor: [150, 150, 150]
        },
        margin: { top: 65, bottom: 30 },
        didDrawPage: function (data) {
          // Footer / Signature Area
          const footerY = pageHeight - 30;
          
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Halaman ${data.pageNumber} — Dicetak pada ${formatDate(new Date().toISOString())} melalui aplikasi KasKu`,
            14,
            footerY + 15
          );
        }
      });

      doc.save(`Laporan-${workspace.name}-${initialFrom}-${initialTo}.pdf`);
      toast.success("File PDF berhasil diunduh");
    } catch {
      toast.error("Gagal mengekspor PDF. Pastikan jspdf terinstall.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href={`/workspace/${workspace.id}`}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {workspace.name}
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">Laporan</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {formatDate(initialFrom)} — {formatDate(initialTo)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExcelExport}
            disabled={!!isExporting || transactions.length === 0}
            id="btn-export-excel"
          >
            {isExporting === "excel" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePdfExport}
            disabled={!!isExporting || transactions.length === 0}
            id="btn-export-pdf"
          >
            {isExporting === "pdf" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            PDF
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePeriodChange(opt.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xl border transition-all",
                selectedPeriod === opt.value
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80 bg-card"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selectedPeriod === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-end gap-3 flex-wrap mt-3"
          >
            <div className="space-y-1">
              <Label className="text-xs">Dari</Label>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-9 text-sm w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sampai</Label>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-9 text-sm w-40"
              />
            </div>
            <Button size="sm" onClick={handleCustomApply} disabled={isPending}>
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Terapkan
            </Button>
          </motion.div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">Total Pemasukan</p>
          </div>
          <p className="text-xl font-bold text-emerald-500">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-card border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
          </div>
          <p className="text-xl font-bold text-red-400">{formatRupiah(totalExpense)}</p>
        </div>
        <div className={cn(
          "bg-card rounded-2xl p-5 border",
          finalBalance >= 0 ? "border-emerald-500/20" : "border-red-500/20"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              finalBalance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              <Wallet className={cn("w-4 h-4", finalBalance >= 0 ? "text-emerald-500" : "text-red-400")} />
            </div>
            <p className="text-sm text-muted-foreground">Saldo Akhir</p>
          </div>
          <p className={cn(
            "text-xl font-bold",
            finalBalance >= 0 ? "text-emerald-500" : "text-red-400"
          )}>
            {formatRupiah(finalBalance)}
          </p>
        </div>
      </div>

      {/* Report Table */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-2xl">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-medium mb-1">Tidak ada transaksi</p>
          <p className="text-sm text-muted-foreground">pada periode yang dipilih</p>
        </div>
      ) : (
        <div ref={tableRef} className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Keterangan</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-500 uppercase tracking-wider">Pemasukan</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-red-400 uppercase tracking-wider">Pengeluaran</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactionsWithBalance.map((t, i) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3.5 text-sm whitespace-nowrap">{formatDateShort(t.date)}</td>
                  <td className="px-4 py-3.5 text-sm max-w-[200px]">
                    <p className="truncate">{t.description}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-right font-medium text-emerald-500">
                    {t.type === "income" ? formatRupiah(Number(t.amount)) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-right font-medium text-red-400">
                    {t.type === "expense" ? formatRupiah(Number(t.amount)) : "—"}
                  </td>
                  <td className={cn(
                    "px-4 py-3.5 text-sm text-right font-semibold",
                    t.running_balance >= 0 ? "text-emerald-500" : "text-red-400"
                  )}>
                    {formatRupiah(t.running_balance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/50">
                <td colSpan={3} className="px-4 py-3.5 text-sm font-bold">TOTAL</td>
                <td className="px-4 py-3.5 text-sm text-right font-bold text-emerald-500">
                  {formatRupiah(totalIncome)}
                </td>
                <td className="px-4 py-3.5 text-sm text-right font-bold text-red-400">
                  {formatRupiah(totalExpense)}
                </td>
                <td className={cn(
                  "px-4 py-3.5 text-sm text-right font-bold",
                  finalBalance >= 0 ? "text-emerald-500" : "text-red-400"
                )}>
                  {formatRupiah(finalBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
