import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (admin: AdminUser, token: string) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,

      login: (admin, token) => set({ admin, token, isAuthenticated: true }),

      logout: () => set({ admin: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'lcvn-admin',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
