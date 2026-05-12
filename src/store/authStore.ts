import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken: string, refreshToken: string) => {
        try {
          const decoded: any = jwtDecode(accessToken);
          set({
            accessToken,
            refreshToken,
            user: {
              id: decoded.sub ?? decoded.nameid ?? '',
              email: decoded.email ?? '',
              displayName: decoded.name ?? decoded.unique_name ?? '',
              avatarUrl: decoded.avatarUrl,
              roles: decoded.roles ?? decoded.role ?? [],
            },
          });
        } catch {
          set({ accessToken, refreshToken });
        }
      },
      setUser: (user: User) => set({ user }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
      isAuthenticated: () => !!get().accessToken,
      hasRole: (role: string) =>
        get().user?.roles?.includes(role) ?? false,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof document === 'undefined') return null;
          const match = document.cookie.match(
            new RegExp('(^| )' + name + '=([^;]+)')
          );
          return match ? decodeURIComponent(match[2]) : null;
        },
        setItem: (name, value) => {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=${encodeURIComponent(
            value
          )};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
        },
        removeItem: (name) => {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=;path=/;max-age=0`;
        },
      })),
    }
  )
);
