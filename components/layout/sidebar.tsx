/**
 * Sidebar Component — Desktop Navigation
 * Menu utama aplikasi KasKu
 */
"use client";

import Link from "next/link";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth.actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    <aside className="hidden lg:flex flex-col w-60 h-screen border-r border-border bg-sidebar fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/30 flex-shrink-0">
          <Wallet className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight">KasKu</span>
      </div>

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
          />
        ))}

        {/* Workspace-specific nav */}
        {dashboardItems.length > 0 && (
          <>
            <div className="pt-3 pb-1">
              <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider px-3">
                Workspace Ini
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
              />
            ))}
          </>
        )}

        {/* Settings */}
        <div className="pt-3">
          <NavItem
            item={NAV_ITEMS[1]}
            isActive={pathname.startsWith(NAV_ITEMS[1].href)}
          />
        </div>
      </nav>

      {/* User profile */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors group">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
              {user?.name ? getInitials(user.name) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name ?? "Pengguna"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
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
}

function NavItem({ item, isActive }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link href={item.href}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
          isActive
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>{item.label}</span>
        {isActive && (
          <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
        )}
      </motion.div>
    </Link>
  );
}
