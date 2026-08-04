"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const MonthlyChart = dynamic(
  () => import("./monthly-chart").then((mod) => mod.MonthlyChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl bg-muted/20 animate-pulse border border-border" />,
  }
);
