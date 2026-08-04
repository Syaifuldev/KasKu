/**
 * Transactions Page — Server Component
 * Mengambil data dengan server-side filtering & pagination
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkspaceById } from "@/lib/queries/workspace.queries";
import { getTransactions } from "@/lib/queries/transaction.queries";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { TransactionsClient } from "./transactions-client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const workspace = await getWorkspaceById(id);
  return { title: `Transaksi — ${workspace?.name ?? ""}` };
}

export default async function TransactionsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const [workspace, user] = await Promise.all([
    getWorkspaceById(id),
    getCurrentUser(),
  ]);

  if (!workspace || !user) notFound();

  const page = Number(sp.page) || 1;
  const filters = {
    page,
    pageSize: 10,
    search: sp.search,
    type: (sp.type as any) || "all",
    dateFrom: sp.dateFrom,
    dateTo: sp.dateTo,
    sortBy: sp.sortBy || "date",
    sortOrder: (sp.sortOrder as any) || "desc",
  };

  const transactions = await getTransactions(id, filters);

  return (
    <TransactionsClient
      workspace={workspace}
      transactions={transactions}
      userId={user.id}
      initialFilters={filters}
    />
  );
}
