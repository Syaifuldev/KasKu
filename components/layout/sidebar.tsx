/**
 * Sidebar Component — Desktop Navigation
 * Menu utama aplikasi KasKu
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Settings,
  LogOut,
  Wallet2,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth.actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { CommandPalette } from "@/components/layout/command-palette";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

const NAV_ITEMS = [
  {
    href: "/workspaces",
    label: "Workspace",
    icon: Wallet,
    matchExact: false,
  },
  {
    href: "/settings",
    label: "Pengaturan",
    icon: Settings,
    matchExact: false,
  },
] as const;

interface SidebarProps {
  user: User | null;
  workspaceId?: string;
}

export function Sidebar({ user, workspaceId }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync with body for layout margin adjustment
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [isCollapsed]);

  const dashboardItems = workspaceId
    ? [
        {
          href: `/workspace/${workspaceId}`,
          label: "Dashboard",
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
      ]
    : [];

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col h-screen border-r border-border bg-sidebar fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header & Toggle */}
      <div className={cn(
        "flex items-center py-4 border-b border-border transition-all",
        isCollapsed ? "justify-center px-0" : "justify-between px-4"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <Image
              src="/icon.png"
              alt="KasKu"
              width={32}
              height={32}
              className="rounded-lg flex-shrink-0"
            />
            <span className="font-bold text-lg tracking-tight truncate">KasKu</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
          title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Search / Command Palette */}
      {!isCollapsed && (
        <div className="pt-4 pb-2">
          <CommandPalette />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Main nav */}
        {NAV_ITEMS.slice(0, 1).map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={
              item.matchExact
                ? pathname === item.href
                : pathname.startsWith(item.href)
            }
            isCollapsed={isCollapsed}
          />
        ))}

        {/* Workspace-specific nav */}
        {dashboardItems.length > 0 && (
          <>
            <div className="pt-3 pb-1">
              <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider px-3 truncate">
                {!isCollapsed && "Workspace Ini"}
              </p>
            </div>
            {dashboardItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={
                  item.matchExact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
                isCollapsed={isCollapsed}
              />
            ))}
          </>
        )}

        {/* Settings */}
        <div className="pt-3">
          <NavItem
            item={NAV_ITEMS[1]}
            isActive={pathname.startsWith(NAV_ITEMS[1].href)}
            isCollapsed={isCollapsed}
          />
        </div>
      </nav>

      {/* Theme Switcher */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <ThemeSwitcher />
        </div>
      )}

      {/* User profile */}
      <div className="border-t border-border p-3">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-colors group",
          !isCollapsed && "hover:bg-sidebar-accent"
        )}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {user?.name ? getInitials(user.name) : "?"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name ?? "Pengguna"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-0 bg-transparent border-0 cursor-pointer"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent>Keluar</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  item: { href: string; label: string; icon: React.ElementType };
  isActive: boolean;
  isCollapsed: boolean;
}

function NavItem({ item, isActive, isCollapsed }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link href={item.href}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative",
          isCollapsed ? "justify-center px-0" : "px-3",
          isActive
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
        {!isCollapsed && <span>{item.label}</span>}
        {!isCollapsed && isActive && (
          <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
        )}
      </motion.div>
    </Link>
  );
}
