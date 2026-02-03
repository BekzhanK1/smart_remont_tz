import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/utils/helpers";
import { authMe } from "@/services/api";

interface AuthState {
  user: User | null;
  loaded: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loaded: false,
      setUser: (user) => set({ user, loaded: true }),
      setToken: (token) => {
        setAuthToken(token);
        set({ loaded: false });
        get().loadUser();
      },
      logout: () => {
        clearAuthToken();
        set({ user: null, loaded: true });
      },
      loadUser: async () => {
        if (typeof window === "undefined") return;
        const token = getAuthToken();
        if (!token) {
          set({ user: null, loaded: true });
          return;
        }
        try {
          const user = await authMe();
          set({ user, loaded: true });
        } catch {
          clearAuthToken();
          set({ user: null, loaded: true });
        }
      },
    }),
    {
      name: "catalog-auth",
      partialize: (s) => ({ user: s.user }),
    }
  )
);
