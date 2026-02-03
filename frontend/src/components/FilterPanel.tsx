"use client";

import type { FilterState } from "@/types";

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  categories: string[];
}

export default function FilterPanel({ filters, onChange, categories }: FilterPanelProps) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-3">Фильтры</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Категория</label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value, offset: 0 })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
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
          <label className="block text-sm text-slate-600 mb-1">Цена от (₽)</label>
          <input
            type="number"
            min="0"
            value={filters.min_price || ""}
            onChange={(e) =>
              onChange({ min_price: e.target.value || "", offset: 0 })
            }
            placeholder="0"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Цена до (₽)</label>
          <input
            type="number"
            min="0"
            value={filters.max_price || ""}
            onChange={(e) =>
              onChange({ max_price: e.target.value || "", offset: 0 })
            }
            placeholder="—"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Сортировка</label>
          <select
            value={`${filters.sort_by}-${filters.sort_order}`}
            onChange={(e) => {
              const [sort_by, sort_order] = e.target.value.split("-") as [
                "id" | "name" | "price",
                "asc" | "desc"
              ];
              onChange({ sort_by, sort_order, offset: 0 });
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
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
