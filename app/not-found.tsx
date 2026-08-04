/**
 * 404 Not Found Page
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-primary mb-3">404</h1>
        <h2 className="text-xl font-semibold mb-2">Halaman tidak ditemukan</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>
        <Link href="/workspaces">
          <Button className="shadow-lg shadow-primary/20">
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
