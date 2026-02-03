"use client";

import type { FilterState } from "@/types";

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  categories: string[];
}

export default function FilterPanel({ filters, onChange, categories }: FilterPanelProps) {
  return (
    <aside className="rounded-2xl border-2 border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-4">Фильтры</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Категория</label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value, offset: 0 })}
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          >
            <option value="">Все</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Цена от (₸)</label>
          <input
            type="number"
            min="0"
            value={filters.min_price || ""}
            onChange={(e) =>
              onChange({ min_price: e.target.value || "", offset: 0 })
            }
            placeholder="0"
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Цена до (₸)</label>
          <input
            type="number"
            min="0"
            value={filters.max_price || ""}
            onChange={(e) =>
              onChange({ max_price: e.target.value || "", offset: 0 })
            }
            placeholder="—"
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Сортировка</label>
          <select
            value={`${filters.sort_by}-${filters.sort_order}`}
            onChange={(e) => {
              const [sort_by, sort_order] = e.target.value.split("-") as [
                "id" | "name" | "price",
                "asc" | "desc"
              ];
              onChange({ sort_by, sort_order, offset: 0 });
            }}
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          >
            <option value="id-asc">По умолчанию</option>
            <option value="name-asc">По имени (А–Я)</option>
            <option value="name-desc">По имени (Я–А)</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
