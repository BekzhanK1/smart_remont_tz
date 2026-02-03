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
  const [qty, setQty] = useState(1);
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
    const amount = Math.max(1, Math.min(99, qty));
    if (adding || !user) return;
    setAdding(true);
    const optimisticItem = {
      id: 0,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image,
      quantity: amount,
      subtotal: product.price * amount,
    };
    addItemOptimistic(optimisticItem);
    try {
      const cart = await addToCart(product.id, amount);
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
      className="group flex flex-col rounded-2xl border-2 border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-lg hover:border-emerald-200/80"
    >
      <Link href={`/product/${product.id}`} className="block overflow-hidden rounded-t-2xl">
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
        <div className="mt-auto mt-3 flex flex-wrap items-center gap-2">
          {!user ? (
            <Link
              href="/login"
              className="flex flex-1 min-w-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              Войти, чтобы добавить
            </Link>
          ) : inCart ? (
            <Link
              href="/cart"
              className="flex flex-1 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              В корзине →
            </Link>
          ) : (
            <>
              <input
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)))}
                className="w-14 rounded-xl border-2 border-slate-200 px-2 py-1.5 text-center text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 min-w-0 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
              >
                {adding ? "…" : "В корзину"}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleCompare}
            disabled={!inCompare && compareCount >= MAX_COMPARE_ITEMS}
            title={inCompare ? "Убрать из сравнения" : "Добавить в сравнение"}
            className={`rounded-xl border-2 px-2.5 py-2.5 text-sm font-medium transition-colors ${
              inCompare
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            } disabled:opacity-50`}
          >
            {inCompare ? "✓" : "⇔"}
          </button>
        </div>
      </div>
    </article>
  );
}
