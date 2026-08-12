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
  { value: "all", label: "Semua" },
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
      
      // -- Colors --
      const primaryColor: [number, number, number] = [22, 163, 74]; // emerald-600 #16a34a
      const textColor: [number, number, number] = [30, 30, 30];
      const mutedColor: [number, number, number] = [115, 115, 115];
      const incomeColor: [number, number, number] = [22, 163, 74];
      const expenseColor: [number, number, number] = [220, 38, 38]; // red-600
      
      // -- HEADER --
      // Logo text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(...primaryColor);
      doc.text("KasKu", 14, 22);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...mutedColor);
      doc.text("Catat Kas, Kelola Lebih Baik", 14, 28);
      
      // Workspace & Period (Right aligned)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...textColor);
      doc.text(workspace.name.toUpperCase(), pageWidth - 14, 22, { align: "right" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...mutedColor);
      doc.text(`Periode: ${formatDateShort(initialFrom)} - ${formatDateShort(initialTo)}`, pageWidth - 14, 28, { align: "right" });
      
      // Separator line
      doc.setDrawColor(229, 231, 235); // gray-200
      doc.setLineWidth(0.5);
      doc.line(14, 34, pageWidth - 14, 34);

      // -- SUMMARY CARDS --
      const cardY = 40;
      const cardWidth = (pageWidth - 28 - 10) / 3; // 3 cards, 5px gap between
      const cardHeight = 22;
      
      const drawCard = (x: number, title: string, amount: string, valColor: [number, number, number]) => {
        // bg
        doc.setFillColor(249, 250, 251); // gray-50
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");
        
        // title
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...mutedColor);
        doc.text(title, x + cardWidth/2, cardY + 8, { align: "center" });
        
        // amount
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...valColor);
        doc.text(amount, x + cardWidth/2, cardY + 16, { align: "center" });
      };

      drawCard(14, "Total Pemasukan", formatRupiah(totalIncome), incomeColor);
      drawCard(14 + cardWidth + 5, "Total Pengeluaran", formatRupiah(totalExpense), expenseColor);
      drawCard(14 + (cardWidth * 2) + 10, "Saldo Akhir", formatRupiah(finalBalance), finalBalance >= 0 ? incomeColor : expenseColor);

      // -- TABLE --
      const tableY = cardY + cardHeight + 8;
      
      autoTable(doc, {
        startY: tableY,
        head: [["No", "Tanggal", "Keterangan", "Pemasukan", "Pengeluaran", "Saldo"]],
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
        theme: "grid",
        styles: { 
          font: "helvetica",
          fontSize: 9,
          cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
          textColor: [60, 60, 60],
          lineColor: [240, 240, 240], // very light border
          lineWidth: 0.1,
          valign: "middle",
        },
        headStyles: { 
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 12 },
          1: { cellWidth: 26, halign: "left" },
          2: { halign: "left" },
          3: { halign: "right", cellWidth: 32, textColor: incomeColor },
          4: { halign: "right", cellWidth: 32, textColor: expenseColor },
          5: { halign: "right", cellWidth: 32, fontStyle: "bold", textColor: textColor },
        },
        didParseCell: function(data) {
          // Style TOTAL row
          if (data.row.index === data.table.body.length - 1 && data.section === "body") {
             data.cell.styles.fontStyle = "bold";
             data.cell.styles.fillColor = [240, 253, 244]; // emerald-50
             data.cell.styles.textColor = textColor;
             if (data.column.index === 3) data.cell.styles.textColor = incomeColor;
             if (data.column.index === 4) data.cell.styles.textColor = expenseColor;
             if (data.column.index === 5) data.cell.styles.textColor = finalBalance >= 0 ? incomeColor : expenseColor;
             
             // Remove border for empty cells in total row
             if (data.column.index < 2) {
                 data.cell.styles.fillColor = [255, 255, 255];
                 data.cell.styles.lineWidth = 0;
             }
          }
        },
        margin: { left: 14, right: 14, top: 20, bottom: 40 },
        tableWidth: "auto",
        didDrawPage: function (data) {
          const footerY = pageHeight - 15;
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.5);
          doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
          
          doc.setFontSize(8);
          doc.setTextColor(156, 163, 175); // gray-400
          doc.setFont("helvetica", "normal");
          doc.text(`Dicetak pada: ${formatDate(new Date().toISOString())} | Dokumen dihasilkan oleh KasKu`, 14, footerY + 2);
          
          // Page number
          const pageStr = `Halaman ${(doc.internal as any).getNumberOfPages()}`;
          doc.text(pageStr, pageWidth - 14, footerY + 2, { align: "right" });
        }
      });
      
      // Signature Area (Elegant)
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      let sigY = finalY;
      
      if (finalY > pageHeight - 50) {
          doc.addPage();
          sigY = 20;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      
      // Date in signature
      doc.text(`Sragen, ${formatDateShort(new Date().toISOString())}`, pageWidth - 14, sigY, { align: "right" });
      
      sigY += 10;
      doc.text("Mengetahui,", 40, sigY, { align: "center" });
      doc.text("Ketua", 40, sigY + 5, { align: "center" });
      doc.text("( Danang Tri Wibowo )", 40, sigY + 30, { align: "center" });
      
      doc.text("Dibuat Oleh,", pageWidth - 40, sigY, { align: "center" });
      doc.text("Bendahara", pageWidth - 40, sigY + 5, { align: "center" });
      
      try {
        const imgRes = await fetch("/ttd-bend.png");
        if (imgRes.ok) {
          const imgBlob = await imgRes.blob();
          const reader = new FileReader();
          const imgData = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imgBlob);
          });
          // Tambahkan gambar tanda tangan bendahara
          doc.addImage(imgData, 'PNG', pageWidth - 56, sigY + 6, 32, 20);
        }
      } catch (err) {
        console.error("Gagal memuat gambar tanda tangan:", err);
      }

      doc.text("( Ahmad S.A )", pageWidth - 40, sigY + 30, { align: "center" });

      doc.save(`Laporan_${workspace.name.replace(/\s+/g, "_")}_${initialFrom}_${initialTo}.pdf`);
      toast.success("File PDF berhasil diunduh");
    } catch (e) {
      console.error(e);
      toast.error("Gagal mengekspor PDF.");
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
            {selectedPeriod === "all"
              ? "Semua transaksi"
              : `${formatDate(initialFrom)} — ${formatDate(initialTo)}`}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-card border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Total Pemasukan</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-500">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-card border border-red-500/20 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Total Pengeluaran</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-400">{formatRupiah(totalExpense)}</p>
        </div>
        <div className={cn(
          "bg-card rounded-2xl p-4 sm:p-5 border",
          finalBalance >= 0 ? "border-emerald-500/20" : "border-red-500/20"
        )}>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              finalBalance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              <Wallet className={cn("w-4 h-4", finalBalance >= 0 ? "text-emerald-500" : "text-red-400")} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Saldo Akhir</p>
          </div>
          <p className={cn(
            "text-xl sm:text-2xl font-bold",
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
