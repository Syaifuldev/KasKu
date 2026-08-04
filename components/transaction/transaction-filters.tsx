/**
 * Transaction Filters
 * Search, filter tanggal, filter jenis
 */
"use client";

import { useCallback, useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TransactionFilters } from "@/types";

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (filters: Partial<TransactionFilters>) => void;
}

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search ?? "");
  const activeFiltersCount = [
    filters.search,
    filters.dateFrom,
    filters.type && filters.type !== "all",
  ].filter(Boolean).length;

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

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari keterangan..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-9"
          id="search-transaction"
        />
        {searchValue && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
        {[
          { value: "all", label: "Semua" },
          { value: "income", label: "Masuk" },
          { value: "expense", label: "Keluar" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ type: opt.value as any, page: 1 })}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              (filters.type ?? "all") === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <Popover>
        <PopoverTrigger
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9",
            (filters.dateFrom || filters.dateTo) && "border-primary text-primary"
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          Tanggal
          {(filters.dateFrom || filters.dateTo) && (
            <Badge className="h-4 px-1 text-[10px] ml-0.5">1</Badge>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-3">
            <p className="text-sm font-medium">Filter Tanggal</p>
            <div className="space-y-2">
              <Label className="text-xs">Dari</Label>
              <Input
                type="date"
                value={filters.dateFrom ?? ""}
                onChange={(e) => onChange({ dateFrom: e.target.value || undefined, page: 1 })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Sampai</Label>
              <Input
                type="date"
                value={filters.dateTo ?? ""}
                onChange={(e) => onChange({ dateTo: e.target.value || undefined, page: 1 })}
                className="h-8 text-sm"
              />
            </div>
            {(filters.dateFrom || filters.dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => onChange({ dateFrom: undefined, dateTo: undefined, page: 1 })}
              >
                Reset Tanggal
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear all */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-9 text-muted-foreground hover:text-foreground text-xs"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Reset Filter
        </Button>
      )}
    </div>
  );
}
