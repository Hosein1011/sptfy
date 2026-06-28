
import { create } from 'zustand';
import { storage } from '../lib/storage';
import { User, Role, SubscriptionTier } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateSubscription: (planType: SubscriptionTier) => void;
  hasPermission: (requiredRole: Role) => boolean;
}

const roleHierarchy: Record<Role, number> = {
  USER: 1,
  ARTIST: 2,
  SUPPORTER: 3,
  ADMIN: 4
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, pass) => {
    const isValid = storage.login(email, pass);
    if (isValid) {
      const users = JSON.parse(localStorage.getItem('sptfy_users') || '[]');
      const loggedInUser = users.find((u: User) => u.email === email);
      set({ user: loggedInUser, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => set({ user: null, isAuthenticated: false }),

  updateSubscription: (planType) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, tier: planType };
      storage.saveUser(updatedUser); 
      return { user: updatedUser };
    });
  },

  hasPermission: (requiredRole) => {
    const { user } = get();
    if (!user) return false;
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }
}));