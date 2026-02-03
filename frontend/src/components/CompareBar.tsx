"use client";

import Link from "next/link";
import { useCompareStore } from "@/store/compareStore";

export default function CompareBar() {
  const items = useCompareStore((s) => s.items);

  if (items.length === 0) return null;

  return (
    <Link
      href="/compare"
      className="fixed bottom-6 right-6 z-20 flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-slate-700"
    >
      <span>Сравнить</span>
      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 text-xs">
        {items.length}
      </span>
    </Link>
  );
}
