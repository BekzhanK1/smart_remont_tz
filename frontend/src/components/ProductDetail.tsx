"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProductDetail as ProductDetailType } from "@/types";
import { formatPrice } from "@/utils/helpers";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useCompareStore, MAX_COMPARE_ITEMS } from "@/store/compareStore";
import { addToCart } from "@/services/api";
import { toast } from "react-toastify";

interface ProductDetailProps {
  product: ProductDetailType;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
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

  const handleAddToCart = async () => {
    if (adding || quantity < 1 || !user) return;
    setAdding(true);
    const optimisticItem = {
      id: 0,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image,
      quantity,
      subtotal: product.price * quantity,
    };
    addItemOptimistic(optimisticItem);
    try {
      const cart = await addToCart(product.id, quantity);
      setCart(cart.items, cart.total);
      toast.success("Добавлено в корзину");
    } catch {
      rollbackAdd(product.id);
      toast.error("Не удалось добавить в корзину");
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="mx-auto max-w-4xl">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              Нет фото
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium uppercase text-slate-500">
            {product.category}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            {formatPrice(product.price)}
          </p>
          {product.description && (
            <div className="mt-6 text-slate-600">
              <h2 className="font-semibold text-slate-800">Описание</h2>
              <p className="mt-2 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {user && (
              <label className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Количество:</span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 rounded-xl border-2 border-slate-200 px-3 py-2 text-center focus:border-emerald-500 focus:outline-none"
                />
              </label>
            )}
            {!user ? (
              <Link
                href="/login"
                className="rounded-xl border-2 border-slate-200 bg-white px-6 py-2.5 font-medium text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                Войти, чтобы добавить в корзину
              </Link>
            ) : inCart ? (
              <Link
                href="/cart"
                className="rounded-xl bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-500 transition-colors"
              >
                В корзине →
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
              >
                {adding ? "Добавляем…" : "В корзину"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const added = toggleCompare(product);
                if (added) toast.success("Добавлено в сравнение");
                else toast.info("Убрано из сравнения");
              }}
              disabled={!inCompare && compareCount >= MAX_COMPARE_ITEMS}
              className={`rounded-xl border-2 px-4 py-2.5 font-medium transition-colors ${
                inCompare
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              } disabled:opacity-50`}
            >
              {inCompare ? "В сравнении ✓" : "Сравнить"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
