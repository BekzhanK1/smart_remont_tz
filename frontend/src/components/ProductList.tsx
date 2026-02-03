"use client";

import type { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: Product[];
  onDragStart?: (e: React.DragEvent, product: Product) => void;
  draggable?: boolean;
}

export default function ProductList({
  products,
  onDragStart,
  draggable = true,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500 rounded-2xl bg-white/60 border-2 border-dashed border-slate-200">
        Товары не найдены. Измените фильтры или поиск.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            draggable={draggable}
            onDragStart={onDragStart}
          />
        </li>
      ))}
    </ul>
  );
}
