/**
 * Mobile Navigation — Bottom Tab Bar + Sticky Header
 * Layout modern seperti app HP (Gojek, BCA Mobile, dll)
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wallet2,
  FileText,
  Settings,
  LogOut,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth.actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

interface MobileNavProps {
  user: User | null;
  workspaceId?: string;
  workspaceName?: string;
}

export function MobileNav({ user, workspaceId, workspaceName }: MobileNavProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  // Bottom tab items — hanya muncul jika di dalam workspace
  const tabItems = workspaceId
    ? [
        {
          href: `/workspace/${workspaceId}`,
          label: "Beranda",
          icon: LayoutDashboard,
          matchExact: true,
        },
        {
          href: `/workspace/${workspaceId}/transactions`,
          label: "Transaksi",
          icon: Wallet2,
          matchExact: false,
        },
        {
          href: `/workspace/${workspaceId}/report`,
          label: "Laporan",
          icon: FileText,
          matchExact: false,
        },
        {
          href: "/settings",
          label: "Setelan",
          icon: Settings,
          matchExact: false,
        },
      ]
    : [
        {
          href: "/workspaces",
          label: "Workspace",
          icon: Wallet,
          matchExact: false,
        },
        {
          href: "/settings",
          label: "Setelan",
          icon: Settings,
          matchExact: false,
        },
      ];

  return (
    <>
      {/* ─── Sticky Header ─── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo + Nama Workspace */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-sm leading-none block">KasKu</span>
              {workspaceName && (
                <span className="text-[11px] text-muted-foreground leading-none block mt-0.5 truncate max-w-[160px]">
                  {workspaceName}
                </span>
              )}
            </div>
          </div>

          {/* Avatar + User Menu */}
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-muted/60 transition-colors"
            aria-label="Menu pengguna"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                {user?.name ? getInitials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                showUserMenu && "rotate-180"
              )}
            />
          </button>
        </div>
      </header>

      {/* ─── User Dropdown ─── */}
      <AnimatePresence>
        {showUserMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setShowUserMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[60px] right-3 z-50 w-60 bg-card border border-border rounded-2xl shadow-xl shadow-black/10 lg:hidden overflow-hidden"
            >
              {/* User info */}
              <div className="px-4 py-3.5 border-b border-border/60">
                <p className="text-sm font-semibold truncate">{user?.name ?? "Pengguna"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>

              {/* Logout */}
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-destructive hover:bg-destructive/8 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar dari akun
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Bottom Tab Bar ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/60">
        <div className="flex items-stretch">
          {tabItems.map((item) => {
            const isActive =
              item.matchExact
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1"
                onClick={() => setShowUserMenu(false)}
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 px-1 transition-colors relative",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full"
                    />
                  )}
                  <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                  <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
        {/* Safe area bottom */}
        <div className="h-safe-bottom" />
      </nav>
    </>
  );
}
