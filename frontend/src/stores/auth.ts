import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (workspaceId: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      workspaces: [],
      currentWorkspaceId: null,
      isAuthenticated: false,

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          workspaces: [],
          currentWorkspaceId: null,
          isAuthenticated: false,
        }),

      setWorkspaces: (workspaces) => set({ workspaces }),

      setCurrentWorkspace: (workspaceId) =>
        set({ currentWorkspaceId: workspaceId }),
    }),
    {
      name: 'lcvn-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    }
  )
);
