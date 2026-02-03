"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductDetail } from "@/types";
import { formatPrice } from "@/utils/helpers";
import { useCompareStore } from "@/store/compareStore";

interface CompareTableProps {
  products: ProductDetail[];
}

const ROWS: { key: keyof ProductDetail | "image"; label: string }[] = [
  { key: "image", label: "Фото" },
  { key: "name", label: "Название" },
  { key: "category", label: "Категория" },
  { key: "price", label: "Цена" },
  { key: "description", label: "Описание" },
];

function getCellValue(product: ProductDetail, key: string): React.ReactNode {
  switch (key) {
    case "image":
      return product.image ? (
        <div className="relative mx-auto h-24 w-24">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover rounded-lg"
          />
        </div>
      ) : (
        <span className="text-slate-400 text-sm">—</span>
      );
    case "price":
      return formatPrice(product.price);
    case "description":
      return product.description ? (
        <p className="text-sm text-slate-600 line-clamp-4 max-w-xs">{product.description}</p>
      ) : (
        <span className="text-slate-400">—</span>
      );
    default:
      return String((product as Record<string, unknown>)[key] ?? "—");
  }
}

export default function CompareTable({ products }: CompareTableProps) {
  const remove = useCompareStore((s) => s.remove);

  if (products.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-40">
              Характеристика
            </th>
            {products.map((p) => (
              <th
                key={p.id}
                className="relative border-l border-slate-200 px-4 py-3 text-left align-top min-w-[180px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/product/${p.id}`}
                    className="font-semibold text-slate-800 hover:underline line-clamp-2"
                  >
                    {p.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Убрать из сравнения"
                  >
                    ×
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ key, label }) => (
            <tr key={key} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="px-4 py-3 text-sm font-medium text-slate-600 bg-slate-50/50 w-40">
                {label}
              </td>
              {products.map((p) => (
                <td
                  key={p.id}
                  className="border-l border-slate-100 px-4 py-3 text-sm text-slate-800"
                >
                  {getCellValue(p, key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
