"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import type { Product } from "@/types";
import { formatPrice } from "@/utils/helpers";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useCompareStore, MAX_COMPARE_ITEMS } from "@/store/compareStore";
import { addToCart } from "@/services/api";

interface ProductCardProps {
  product: Product;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, product: Product) => void;
}

export default function ProductCard({
  product,
  draggable = true,
  onDragStart,
}: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const user = useAuthStore((s) => s.user);
  const addItemOptimistic = useCartStore((s) => s.addItemOptimistic);
  const setCart = useCartStore((s) => s.setCart);
  const rollbackAdd = useCartStore((s) => s.rollbackAdd);
  const cartItems = useCartStore((s) => s.items);
  const inCart = cartItems.some((i) => i.product_id === product.id);
  const inCompare = useCompareStore((s) => s.has(product.id));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const compareCount = useCompareStore((s) => s.items.length);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (adding || !user) return;
    setAdding(true);
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
    try {
      const cart = await addToCart(product.id, 1);
      setCart(cart.items, cart.total);
      toast.success("Добавлено в корзину");
    } catch {
      rollbackAdd(product.id);
      toast.error("Не удалось добавить в корзину");
    } finally {
      setAdding(false);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    const added = toggleCompare(product);
    if (added) toast.success("Добавлено в сравнение");
    else toast.info("Убрано из сравнения");
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable || !onDragStart) return;
    e.dataTransfer.setData("application/json", JSON.stringify(product));
    e.dataTransfer.effectAllowed = "copy";
    onDragStart(e, product);
  };

  return (
    <article
      draggable={draggable}
      onDragStart={handleDragStart}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300"
    >
      <Link href={`/product/${product.id}`} className="block overflow-hidden rounded-t-xl">
        <div className="relative aspect-square bg-slate-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              Нет фото
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase text-slate-500">{product.category}</p>
        <Link href={`/product/${product.id}`}>
          <h3 className="mt-1 font-semibold text-slate-800 line-clamp-2 hover:text-slate-600">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-lg font-bold text-slate-900">{formatPrice(product.price)}</p>
        <div className="mt-auto mt-3 flex gap-2">
          {!user ? (
            <Link
              href="/login"
              className="flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Войти, чтобы добавить
            </Link>
          ) : inCart ? (
            <span className="flex flex-1 items-center justify-center rounded-lg bg-slate-600 py-2.5 text-sm font-medium text-white">
              Добавлено
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
            >
              {adding ? "Добавляем…" : "В корзину"}
            </button>
          )}
          <button
            type="button"
            onClick={handleCompare}
            disabled={!inCompare && compareCount >= MAX_COMPARE_ITEMS}
            title={inCompare ? "Убрать из сравнения" : "Добавить в сравнение"}
            className={`rounded-lg border px-2.5 py-2.5 text-sm font-medium transition-colors ${
              inCompare
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-slate-300 text-slate-600 hover:border-slate-400"
            } disabled:opacity-50`}
          >
            {inCompare ? "✓" : "⇔"}
          </button>
        </div>
      </div>
    </article>
  );
}
