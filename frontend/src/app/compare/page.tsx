"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CompareTable from "@/components/CompareTable";
import Header from "@/components/Header";
import { useCompareStore } from "@/store/compareStore";
import { fetchProduct } from "@/services/api";
import type { ProductDetail } from "@/types";

export default function ComparePage() {
  const compareItems = useCompareStore((s) => s.items);
  const clear = useCompareStore((s) => s.clear);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (compareItems.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(compareItems.map((p) => fetchProduct(p.id)))
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch(() => {
        if (!cancelled) setProducts(compareItems as ProductDetail[]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [compareItems]);

  if (compareItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12 text-center">
          <p className="text-slate-600">В сравнении пока нет товаров.</p>
          <p className="mt-2 text-sm text-slate-500">
            Нажимайте «Сравнить» на карточках товаров (до 4 шт.).
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            Перейти в каталог
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">Сравнение товаров</h1>
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Очистить
          </button>
        </div>
        {loading ? (
          <p className="py-12 text-center text-slate-500">Загрузка…</p>
        ) : (
          <CompareTable products={products} />
        )}
      </main>
    </div>
  );
}
