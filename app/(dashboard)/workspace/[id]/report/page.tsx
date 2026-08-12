/**
 * Report Page — Laporan Keuangan dengan Running Balance
 * Filter periode + export PDF & Excel
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkspaceById } from "@/lib/queries/workspace.queries";
import { getTransactionsForReport, getAllTransactionsForReport } from "@/lib/queries/transaction.queries";
import { ReportClient } from "./report-client";
import { getDateRangeFromPeriod, formatDateInput } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    period?: string;
    from?: string;
    to?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const workspace = await getWorkspaceById(id);
  return { title: `Laporan — ${workspace?.name ?? ""}` };
}

export default async function ReportPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const workspace = await getWorkspaceById(id);
  if (!workspace) notFound();

  const period = sp.period ?? "all";
  let dateFrom: string;
  let dateTo: string;

  let transactions;
  if (period === "all") {
    transactions = await getAllTransactionsForReport(id);
    dateFrom = "";
    dateTo = formatDateInput(new Date());
  } else if (period === "custom" && sp.from && sp.to) {
    dateFrom = sp.from;
    dateTo = sp.to;
    transactions = await getTransactionsForReport(id, dateFrom, dateTo);
  } else {
    const range = getDateRangeFromPeriod(period);
    dateFrom = formatDateInput(range.from);
    dateTo = formatDateInput(range.to);
    transactions = await getTransactionsForReport(id, dateFrom, dateTo);
  }

  return (
    <ReportClient
      workspace={workspace}
      transactions={transactions}
      period={period}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
}
