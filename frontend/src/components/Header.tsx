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
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-slate-900">
          Каталог
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Корзина
          </Link>
          {loaded && (
            <>
              {user ? (
                <span className="flex items-center gap-2">
                  <span className="max-w-[140px] truncate text-sm text-slate-600" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Выйти
                  </button>
                </span>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
