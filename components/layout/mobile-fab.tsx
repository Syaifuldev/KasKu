/**
 * Mobile FAB — Floating Action Button
 * Dirender via createPortal ke document.body agar tidak terpengaruh
 * parent transform dari framer-motion page transitions.
 * Support href (Link) atau onClick.
 */
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";

interface MobileFabProps {
  onClick?: () => void;
  href?: string;
  label?: string;
  id?: string;
}

export function MobileFab({ onClick, href, label = "Tambah", id }: MobileFabProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const fabClass =
    "fixed bottom-28 right-4 w-11 h-11 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center lg:hidden z-[99]";

  const inner = <Plus className="w-5 h-5" />;

  const fab = href ? (
    <motion.div whileTap={{ scale: 0.9 }} className={fabClass} id={id}>
      <Link href={href} aria-label={label} className="w-full h-full flex items-center justify-center">
        {inner}
      </Link>
    </motion.div>
  ) : (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={fabClass}
      aria-label={label}
      id={id}
    >
      {inner}
    </motion.button>
  );

  return createPortal(fab, document.body);
}
