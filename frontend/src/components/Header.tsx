"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
  showSearch?: boolean;
  searchSlot?: React.ReactNode;
}

export default function Header({ showSearch, searchSlot }: HeaderProps) {
  const { user, loaded, loadUser, logout } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-800 hover:text-emerald-600 transition-colors">
          Каталог
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          >
            Корзина
          </Link>
          {loaded && (
            <>
              {user ? (
                <span className="flex items-center gap-2">
                  <span className="max-w-[140px] truncate rounded-xl bg-slate-100 px-3 py-1.5 text-sm text-slate-600" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-xl border-2 border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    Выйти
                  </button>
                </span>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                >
                  Войти
                </Link>
              )}
            </>
          )}
        </div>
      </div>
      {showSearch && searchSlot && (
        <div className="mx-auto max-w-7xl px-4 pb-3">{searchSlot}</div>
      )}
    </header>
  );
}
