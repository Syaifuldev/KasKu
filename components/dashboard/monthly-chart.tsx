/**
 * Monthly Chart — Recharts Bar Chart
 * Visualisasi pemasukan vs pengeluaran per bulan
 */
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { formatCompact } from "@/lib/utils";
import type { MonthlyChartData } from "@/types";

interface MonthlyChartProps {
  data: MonthlyChartData[];
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.fill }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">
            Rp {entry.value.toLocaleString("id-ID")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  if (!data.length) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-1">Grafik Bulanan</h3>
        <p className="text-sm text-muted-foreground mb-8">Pemasukan vs pengeluaran</p>
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Belum ada data transaksi
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold">Grafik Bulanan</h3>
          <p className="text-sm text-muted-foreground">12 bulan terakhir</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Pemasukan
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            Pengeluaran
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          barGap={4}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="oklch(1 0 0 / 6%)"
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "oklch(0.62 0 0)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "oklch(0.62 0 0)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCompact(v)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(1 0 0 / 4%)" }} />
          <Bar
            dataKey="income"
            name="Pemasukan"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="expense"
            name="Pengeluaran"
            fill="#f87171"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
