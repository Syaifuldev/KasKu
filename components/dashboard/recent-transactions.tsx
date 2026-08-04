/**
 * Recent Transactions — Dashboard Widget
 * 5 transaksi terbaru di workspace
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { formatRupiah, formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  workspaceId: string;
}

export function RecentTransactions({ transactions, workspaceId }: RecentTransactionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold">Transaksi Terbaru</h3>
          <p className="text-sm text-muted-foreground">5 transaksi terakhir</p>
        </div>
        <Link
          href={`/workspace/${workspaceId}/transactions`}
          className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        >
          Lihat semua
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Tambah transaksi pertama Anda
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  transaction.type === "income"
                    ? "bg-emerald-500/15"
                    : "bg-red-500/15"
                )}
              >
                {transaction.type === "income" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{formatDateShort(transaction.date)}</p>
              </div>

              {/* Amount */}
              <p
                className={cn(
                  "text-sm font-semibold flex-shrink-0",
                  transaction.type === "income" ? "text-emerald-500" : "text-red-400"
                )}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatRupiah(Number(transaction.amount))}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
