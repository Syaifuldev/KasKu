/**
 * Workspace Icon Component
 * Menampilkan icon workspace menggunakan Lucide Icons
 */
import {
  Wallet,
  Building2,
  Users,
  Star,
  Heart,
  Flag,
  Trophy,
  Home,
  Briefcase,
  GraduationCap,
  Church,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  wallet: Wallet,
  building: Building2,
  users: Users,
  star: Star,
  heart: Heart,
  flag: Flag,
  trophy: Trophy,
  home: Home,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  church: Church,
  leaf: Leaf,
};

interface WorkspaceIconProps {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "w-8 h-8 rounded-lg", icon: "w-4 h-4" },
  md: { container: "w-10 h-10 rounded-xl", icon: "w-5 h-5" },
  lg: { container: "w-14 h-14 rounded-2xl", icon: "w-7 h-7" },
};

export function WorkspaceIcon({ icon, color, size = "md", className }: WorkspaceIconProps) {
  const Icon = ICON_MAP[icon] ?? Wallet;
  const sizes = SIZE_MAP[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center flex-shrink-0",
        sizes.container,
        className
      )}
      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
    >
      <Icon className={sizes.icon} style={{ color }} />
    </div>
  );
}
