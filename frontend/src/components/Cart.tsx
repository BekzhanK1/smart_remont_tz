"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/helpers";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
} from "@/services/api";

export default function Cart() {
  const { items, total, setCart, updateItemOptimistic, removeItemOptimistic, rollbackUpdate, rollbackRemove } =
    useCartStore();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCart()
      .then((cart) => {
        if (!cancelled) {
          useCartStore.getState().setCart(cart.items, cart.total);
          setSynced(true);
        }
      })
      .catch(() => setSynced(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const prev = item.quantity;
    updateItemOptimistic(itemId, newQty);
    try {
      const cart = await updateCartItem(itemId, newQty);
      setCart(cart.items, cart.total);
    } catch {
      rollbackUpdate(itemId, prev);
      toast.error("Не удалось изменить количество");
    }
  };

  const handleRemove = async (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    removeItemOptimistic(itemId);
    try {
      const cart = await removeCartItem(itemId);
      setCart(cart.items, cart.total);
      toast.success("Удалено из корзины");
    } catch {
      rollbackRemove(item);
      toast.error("Не удалось удалить");
    }
  };

  if (items.length === 0 && synced) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">Корзина пуста</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
        >
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h2 className="font-semibold text-slate-800">Корзина</h2>
      </div>
      <ul className="divide-y divide-slate-200">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {item.product_image ? (
                <Image
                  src={item.product_image}
                  alt={item.product_name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  Нет фото
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/product/${item.product_id}`}
                className="font-medium text-slate-800 hover:underline"
              >
                {item.product_name}
              </Link>
              <p className="text-sm text-slate-500">
                {formatPrice(item.product_price)} × {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={999}
                value={item.quantity}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!Number.isNaN(v) && v >= 1) handleQuantityChange(item.id, v);
                }}
                className="w-16 rounded border border-slate-300 px-2 py-1 text-center text-sm"
              />
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                aria-label="Удалить"
              >
                🗑
              </button>
            </div>
            <div className="w-24 text-right font-medium text-slate-800">
              {formatPrice(item.subtotal)}
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex justify-between items-center">
        <span className="font-semibold text-slate-800">Итого:</span>
        <span className="text-lg font-bold text-slate-900">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
