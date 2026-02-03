"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import Pagination from "@/components/Pagination";
import ProductList from "@/components/ProductList";
import { fetchProducts, addToCart } from "@/services/api";
import { useCartStore } from "@/store/cartStore";
import type { FilterState, Product, ProductsResponse } from "@/types";

const DEFAULT_FILTERS: FilterState = {
  category: "",
  min_price: "",
  max_price: "",
  search: "",
  sort_by: "id",
  sort_order: "asc",
  limit: 12,
  offset: 0,
};

function filtersFromSearchParams(sp: URLSearchParams): Partial<FilterState> {
  const f: Partial<FilterState> = {};
  const limit = sp.get("limit");
  const offset = sp.get("offset");
  if (limit) f.limit = parseInt(limit, 10) || DEFAULT_FILTERS.limit;
  if (offset) f.offset = parseInt(offset, 10) || 0;
  const cat = sp.get("category");
  if (cat != null) f.category = cat;
  const min = sp.get("min_price");
  if (min != null) f.min_price = min;
  const max = sp.get("max_price");
  if (max != null) f.max_price = max;
  const search = sp.get("search");
  if (search != null) f.search = search;
  const sort = sp.get("sort_by");
  if (sort === "name" || sort === "price") f.sort_by = sort;
  const order = sp.get("sort_order");
  if (order === "asc" || order === "desc") f.sort_order = order;
  return f;
}

function filtersToSearchParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.limit !== DEFAULT_FILTERS.limit) p.set("limit", String(f.limit));
  if (f.offset) p.set("offset", String(f.offset));
  if (f.category) p.set("category", f.category);
  if (f.min_price) p.set("min_price", f.min_price);
  if (f.max_price) p.set("max_price", f.max_price);
  if (f.search) p.set("search", f.search);
  if (f.sort_by !== "id") p.set("sort_by", f.sort_by);
  if (f.sort_order !== "asc") p.set("sort_order", f.sort_order);
  return p;
}

const CATEGORIES = [
  "Электроника",
  "Мебель",
  "Освещение",
  "Ремонт",
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(() => {
    const fromUrl = filtersFromSearchParams(searchParams);
    return { ...DEFAULT_FILTERS, ...fromUrl };
  });
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropTarget, setDropTarget] = useState(false);

  const applyFilters = useCallback((next: Partial<FilterState>) => {
    setFilters((prev) => {
      const merged = { ...prev, ...next };
      return merged;
    });
  }, []);

  useEffect(() => {
    const fromUrl = filtersFromSearchParams(searchParams);
    setFilters((prev) => ({ ...prev, ...fromUrl }));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProducts(filters)
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch(() => {
        if (!cancelled) setData({ count: 0, next: null, previous: null, results: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  useEffect(() => {
    const params = filtersToSearchParams(filters);
    const q = params.toString();
    const url = q ? `?${q}` : window.location.pathname;
    if (typeof window !== "undefined" && window.history.replaceState) {
      window.history.replaceState(null, "", url);
    }
  }, [filters]);

  const handlePageChange = useCallback((newOffset: number) => {
    setFilters((prev) => ({ ...prev, offset: newOffset }));
  }, []);

  const addItemOptimistic = useCartStore((s) => s.addItemOptimistic);
  const setCart = useCartStore((s) => s.setCart);
  const rollbackAdd = useCartStore((s) => s.rollbackAdd);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropTarget(false);
      try {
        const json = e.dataTransfer.getData("application/json");
        const product = JSON.parse(json) as Product;
        if (!product?.id) return;
        const optimisticItem = {
          id: 0,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image,
          quantity: 1,
          subtotal: product.price,
        };
        addItemOptimistic(optimisticItem);
        addToCart(product.id, 1)
          .then((cart) => {
            setCart(cart.items, cart.total);
            toast.success("Добавлено в корзину");
          })
          .catch(() => {
            rollbackAdd(product.id);
            toast.error("Не удалось добавить в корзину");
          });
      } catch {
        // ignore
      }
    },
    [addItemOptimistic, setCart, rollbackAdd]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDropTarget(true);
  }, []);

  const handleDragLeave = useCallback(() => setDropTarget(false), []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Каталог
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Корзина
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3">
          <SearchBar
            value={filters.search}
            onChange={(search) => applyFilters({ search, offset: 0 })}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <FilterPanel
            filters={filters}
            onChange={applyFilters}
            categories={CATEGORIES}
          />
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={dropTarget ? "rounded-xl ring-2 ring-slate-400 ring-offset-2" : ""}
          >
            {loading ? (
              <p className="py-12 text-center text-slate-500">Загрузка…</p>
            ) : data ? (
              <>
                <ProductList
                  products={data.results}
                  draggable
                  onDragStart={() => {}}
                />
                <Pagination
                  count={data.count}
                  limit={filters.limit}
                  offset={filters.offset}
                  onPageChange={handlePageChange}
                />
              </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
