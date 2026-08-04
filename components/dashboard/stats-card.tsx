/**
 * Stats Card Component — Dashboard
 * Menampilkan satu metrik: saldo, pemasukan, pengeluaran, atau jumlah transaksi
 */
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: "emerald" | "red" | "blue" | "default";
  index?: number;
}

const COLOR_MAP = {
  emerald: {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-500",
    value: "text-emerald-500",
    border: "border-emerald-500/20",
  },
  red: {
    bg: "bg-red-500/10",
    icon: "text-red-400",
    value: "text-red-400",
    border: "border-red-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    icon: "text-blue-400",
    value: "text-blue-400",
    border: "border-blue-500/20",
  },
  default: {
    bg: "bg-muted",
    icon: "text-muted-foreground",
    value: "text-foreground",
    border: "border-border",
  },
};

export function StatsCard({ title, value, subtitle, icon: Icon, color = "default", index = 0 }: StatsCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className={cn(
        "bg-card border rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10",
        colors.border
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", colors.bg)}>
          <Icon className={cn("w-4 h-4", colors.icon)} />
        </div>
      </div>
      <p className={cn("text-2xl font-bold tracking-tight", colors.value)}>{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}
