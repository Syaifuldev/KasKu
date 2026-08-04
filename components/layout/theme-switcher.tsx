"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-full bg-muted/30 animate-pulse rounded-lg" />;
  }

  return (
    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex-1 flex items-center justify-center p-1.5 rounded-md transition-all text-muted-foreground hover:text-foreground",
          theme === "light" && "bg-background shadow-sm text-foreground"
        )}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "flex-1 flex items-center justify-center p-1.5 rounded-md transition-all text-muted-foreground hover:text-foreground",
          theme === "system" && "bg-background shadow-sm text-foreground"
        )}
        title="System Theme"
        aria-label="System Theme"
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex-1 flex items-center justify-center p-1.5 rounded-md transition-all text-muted-foreground hover:text-foreground",
          theme === "dark" && "bg-background shadow-sm text-foreground"
        )}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
