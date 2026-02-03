import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  total: number;
  setCart: (items: CartItem[], total: number) => void;
  addItemOptimistic: (item: CartItem) => void;
  updateItemOptimistic: (itemId: number, quantity: number) => void;
  removeItemOptimistic: (itemId: number) => void;
  rollbackAdd: (productId: number) => void;
  rollbackUpdate: (itemId: number, prevQuantity: number) => void;
  rollbackRemove: (item: CartItem) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      setCart: (items, total) => set({ items, total }),
      addItemOptimistic: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id);
          let nextItems: CartItem[];
          if (existing) {
            nextItems = state.items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.product_price }
                : i
            );
          } else {
            nextItems = [...state.items, { ...item, id: item.id || -state.items.length }];
          }
          const nextTotal = nextItems.reduce((s, i) => s + i.subtotal, 0);
          return { items: nextItems, total: nextTotal };
        }),
      updateItemOptimistic: (itemId, quantity) =>
        set((state) => {
          const items = state.items.map((i) =>
            i.id === itemId
              ? { ...i, quantity, subtotal: quantity * i.product_price }
              : i
          );
          const total = items.reduce((s, i) => s + i.subtotal, 0);
          return { items, total };
        }),
      removeItemOptimistic: (itemId) =>
        set((state) => {
          const items = state.items.filter((i) => i.id !== itemId);
          const total = items.reduce((s, i) => s + i.subtotal, 0);
          return { items, total };
        }),
      rollbackAdd: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.product_id !== productId);
          const total = items.reduce((s, i) => s + i.subtotal, 0);
          return { items, total };
        }),
      rollbackUpdate: (itemId, prevQuantity) =>
        set((state) => {
          const items = state.items.map((i) =>
            i.id === itemId
              ? { ...i, quantity: prevQuantity, subtotal: prevQuantity * i.product_price }
              : i
          );
          const total = items.reduce((s, i) => s + i.subtotal, 0);
          return { items, total };
        }),
      rollbackRemove: (item) =>
        set((state) => {
          const found = state.items.some((i) => i.id === item.id);
          const items = found ? state.items : [...state.items, item];
          const total = items.reduce((s, i) => s + i.subtotal, 0);
          return { items, total };
        }),
    }),
    {
      name: "catalog-cart",
      partialize: (s) => ({ items: s.items, total: s.total }),
    }
  )
);
