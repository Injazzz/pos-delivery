/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth";
import { authApi } from "@/api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  isAuthenticated: () => boolean;

  // Role helpers
  isManager: () => boolean;
  isKasir: () => boolean;
  isKurir: () => boolean;
  isPelanggan: () => boolean;
  hasRole: (...roles: User["role"][]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        localStorage.setItem("auth_token", token);
        set({ user, token });
      },

      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          await authApi.logout();
        } catch (_) {
          // silent fail — tetap logout di client
        } finally {
          localStorage.removeItem("auth_token");
          set({ user: null, token: null });
        }
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const res = await authApi.me();
          set({ user: res.data.data });
        } catch (_) {
          localStorage.removeItem("auth_token");
          set({ user: null, token: null });
        } finally {
          set({ isLoading: false });
        }
      },

      isAuthenticated: () => !!get().token && !!get().user,

      isManager: () => get().user?.role === "manager",
      isKasir: () => get().user?.role === "kasir",
      isKurir: () => get().user?.role === "kurir",
      isPelanggan: () => get().user?.role === "pelanggan",

      hasRole: (...roles) => {
        const role = get().user?.role;
        return role ? roles.includes(role) : false;
      },
    }),
    {
      name: "auth-storage",
      // Hanya persist token dan user, bukan isLoading
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
