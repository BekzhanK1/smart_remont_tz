import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

const MAX_COMPARE = 4;

interface CompareState {
  items: Product[];
  add: (product: Product) => boolean;
  remove: (productId: number) => void;
  clear: () => void;
  has: (productId: number) => boolean;
  toggle: (product: Product) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        const { items } = get();
        if (items.some((p) => p.id === product.id)) return false;
        if (items.length >= MAX_COMPARE) return false;
        set({ items: [...items, product] });
        return true;
      },
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((p) => p.id !== productId) })),
      clear: () => set({ items: [] }),
      has: (productId) => get().items.some((p) => p.id === productId),
      toggle: (product) => {
        const { items, add, remove } = get();
        if (items.some((p) => p.id === product.id)) {
          remove(product.id);
          return false;
        }
        return add(product);
      },
    }),
    {
      name: "catalog-compare",
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export const MAX_COMPARE_ITEMS = MAX_COMPARE;
