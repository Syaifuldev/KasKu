/**
 * Stats Card Component — Dashboard
 * Menampilkan satu metrik: saldo, pemasukan, pengeluaran, atau jumlah transaksi
 */
"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  type?: "income" | "expense" | "default" | "emerald" | "red" | "blue";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  index?: number;
}

export function StatsCard({ title, value, type = "default", trend, icon, className, index = 0 }: StatsCardProps) {
  const isIncome = type === "income" || type === "emerald";
  const isExpense = type === "expense" || type === "red";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      whileHover={{ scale: 1.02, translateY: -2 }}
      className="h-full"
    >
      <Card className={cn("overflow-hidden border-border/50 glass card-hover relative group h-full", className)}>
        {/* Subtle background glow effect based on type */}
        <div className={cn(
          "absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
          isIncome ? "bg-emerald-500" : isExpense ? "bg-red-500" : "bg-primary"
        )} />
        
        <CardContent className="p-5 relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
              isIncome ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20" 
              : isExpense ? "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"
              : "bg-primary/10 text-primary group-hover:bg-primary/20"
            )}>
              <div className="w-4 h-4 flex items-center justify-center">
                {icon}
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <h3 className={cn(
              "text-2xl font-bold tracking-tight",
              isIncome ? "text-emerald-500" : isExpense ? "text-red-400" : "text-foreground"
            )}>
              {value}
            </h3>
            
            {trend && (
              <p className={cn(
                "text-xs font-medium mt-1 flex items-center gap-1",
                trend.isPositive ? "text-emerald-500" : "text-red-500"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}% dari bulan lalu
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
