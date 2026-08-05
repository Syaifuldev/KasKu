/**
 * Transaction Filters — Mobile-first
 * Search bar full-width + pill chips horizontal + date filter bottom sheet
 */
"use client";

import { useCallback, useState } from "react";
import { Search, X, CalendarDays, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TransactionFilters } from "@/types";

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (filters: Partial<TransactionFilters>) => void;
}

const TYPE_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "income", label: "Masuk" },
  { value: "expense", label: "Keluar" },
] as const;

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search ?? "");
  const [dateOpen, setDateOpen] = useState(false);

  const hasDateFilter = !!(filters.dateFrom || filters.dateTo);
  const currentType = filters.type ?? "all";

  // Debounce search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      clearTimeout((window as any).__searchTimer);
      (window as any).__searchTimer = setTimeout(() => {
        onChange({ search: value, page: 1 });
      }, 400);
    },
    [onChange]
  );

  const handleClearAll = () => {
    setSearchValue("");
    onChange({ search: "", dateFrom: undefined, dateTo: undefined, type: "all", page: 1 });
  };

  const handleClearDate = () => {
    onChange({ dateFrom: undefined, dateTo: undefined, page: 1 });
    setDateOpen(false);
  };

  const hasAnyFilter = !!(filters.search || filters.dateFrom || filters.dateTo || (filters.type && filters.type !== "all"));

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari keterangan transaksi..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-muted/50 border-border/60 focus:bg-background"
          id="search-transaction"
        />
        {searchValue && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl flex-shrink-0">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ type: opt.value as any, page: 1 })}
              className={cn(
                "px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap",
                currentType === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Date filter — sheet on mobile */}
        <Sheet open={dateOpen} onOpenChange={setDateOpen}>
          <SheetTrigger
            render={
              <button
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all whitespace-nowrap flex-shrink-0",
                  hasDateFilter
                    ? "bg-primary/8 border-primary/30 text-primary"
                    : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              />
            }
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {hasDateFilter ? "Tanggal ✓" : "Tanggal"}
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl pb-8">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-left">Filter Tanggal</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Dari tanggal</Label>
                <Input
                  type="date"
                  value={filters.dateFrom ?? ""}
                  onChange={(e) => onChange({ dateFrom: e.target.value || undefined, page: 1 })}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sampai tanggal</Label>
                <Input
                  type="date"
                  value={filters.dateTo ?? ""}
                  onChange={(e) => onChange({ dateTo: e.target.value || undefined, page: 1 })}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="flex gap-3 pt-2">
                {hasDateFilter && (
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                    onClick={handleClearDate}
                  >
                    Reset Tanggal
                  </Button>
                )}
                <Button
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => setDateOpen(false)}
                >
                  Terapkan
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Reset all */}
        {hasAnyFilter && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-destructive rounded-xl border border-border/60 transition-all whitespace-nowrap flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
