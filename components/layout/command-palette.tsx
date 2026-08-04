"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Wallet, Settings, LayoutDashboard, Search, FileText } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <div className="hidden lg:flex items-center gap-2 px-3">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-muted-foreground bg-muted/30 hover:bg-muted border border-border rounded-lg transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Pencarian...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Ketik perintah atau cari halaman..." />
        <CommandList>
          <CommandEmpty>Tidak ditemukan hasil.</CommandEmpty>
          <CommandGroup heading="Navigasi Utama">
            <CommandItem onSelect={() => runCommand(() => router.push("/workspaces"))}>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Daftar Workspace</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan Profil</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Aksi Cepat">
            <CommandItem onSelect={() => runCommand(() => alert("Gunakan fitur ini di dalam Workspace"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Tambah Transaksi Baru</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => alert("Gunakan fitur ini di dalam Workspace"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Lihat Laporan Bulan Ini</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
