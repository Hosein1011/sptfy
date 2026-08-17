import { create } from "zustand";
import { authApi, tokenStorage } from "../lib/api";
import { storage } from "../lib/storage";
import { User, Role, SubscriptionTier } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  updateSubscription: (planType: SubscriptionTier) => void;
  setUser: (user: User) => void;
  hasPermission: (requiredRole: Role) => boolean;
}

const roleHierarchy: Record<Role, number> = {
  USER: 1,
  ARTIST: 2,
  SUPPORTER: 3,
  ADMIN: 4,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  hydrate: async () => {
    const localUser = storage.getCurrentUser();
    if (!tokenStorage.get()) {
      set({ user: localUser, isAuthenticated: Boolean(localUser), isHydrated: true });
      return;
    }
    try {
      const user = await authApi.me();
      storage.setCurrentUser(user);
      set({ user, isAuthenticated: true, isHydrated: true });
    } catch {
      tokenStorage.clear();
      storage.logout();
      set({ user: null, isAuthenticated: false, isHydrated: true });
    }
  },

  login: async (email, pass) => {
    try {
      const result = await authApi.login(email, pass);
      tokenStorage.set(result.token);
      storage.setCurrentUser(result.user);
      set({ user: result.user, isAuthenticated: true, isHydrated: true });
      return true;
    } catch {
      // Keeps the original phase-one mock accounts usable when the API is offline.
      const isValid = storage.login(email, pass);
      if (!isValid) return false;
      const user = storage.getCurrentUser();
      set({ user, isAuthenticated: Boolean(user), isHydrated: true });
      return Boolean(user);
    }
  },

  logout: async () => {
    try {
      if (tokenStorage.get()) await authApi.logout();
    } catch {
      // Local cleanup must still happen if the backend is unavailable.
    }
    tokenStorage.clear();
    storage.logout();
    set({ user: null, isAuthenticated: false });
  },

  deleteAccount: async () => {
    const { user } = get();
    try {
      if (tokenStorage.get()) {
        await authApi.deleteAccount();
      }
    } catch (err) {
      // If backend is unreachable or offline, proceed with local cleanup
      console.warn("Backend account deletion could not be completed, proceeding with local deletion:", err);
    }
    if (user?.id) {
      storage.deleteUser(user.id);
    }
    tokenStorage.clear();
    storage.logout();
    set({ user: null, isAuthenticated: false });
    return true;
  },

  setUser: (user) => {
    storage.saveUser(user);
    storage.setCurrentUser(user);
    set({ user, isAuthenticated: true, isHydrated: true });
  },

  updateSubscription: (planType) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, tier: planType };
      storage.saveUser(updatedUser);
      storage.setCurrentUser(updatedUser);
      return { user: updatedUser };
    });
  },

  hasPermission: (requiredRole) => {
    const { user } = get();
    if (!user) return false;
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  },
}));
