import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { apiService } from '@/lib/api';
import { APP_CONSTANTS } from '@/lib/constants';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Getters
  isAdmin: () => boolean;
  isUser: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Actions
      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          // Validation côté client
          if (!email.trim() || !password) {
            set({ error: 'Email et mot de passe requis', isLoading: false });
            return false;
          }

          if (!isValidEmail(email)) {
            set({ error: 'Format d\'email invalide', isLoading: false });
            return false;
          }

          if (password.length < APP_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH) {
            set({ error: 'Le mot de passe doit contenir au moins 6 caractères', isLoading: false });
            return false;
          }

          // Tentative de connexion
          const response = await apiService.login({
            email: email.trim(),
            mot_de_passe: password,
          });

          // Sauvegarder le token et l'utilisateur
          apiService.setAuthToken(response.token);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error: any) {
          set({
            error: error.message || APP_CONSTANTS.ERRORS.UNKNOWN,
            isLoading: false,
          });
          return false;
        }
      },

      logout: async (): Promise<void> => {
        set({ isLoading: true });
        
        try {
          apiService.clearAuth();
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Même en cas d'erreur, nettoyer l'état local
          apiService.clearAuth();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshUser: async (): Promise<void> => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await apiService.getProfile();
          set({ user: response.user });
        } catch (error: any) {
          // Si erreur, probablement session expirée
          get().logout();
        }
      },

      changePassword: async (oldPassword: string, newPassword: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          // Validation côté client
          if (!oldPassword || !newPassword) {
            set({ error: 'Ancien et nouveau mot de passe requis', isLoading: false });
            return false;
          }

          if (newPassword.length < APP_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH) {
            set({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères', isLoading: false });
            return false;
          }

          if (oldPassword === newPassword) {
            set({ error: 'Le nouveau mot de passe doit être différent de l\'ancien', isLoading: false });
            return false;
          }

          await apiService.changePassword({
            ancien_mot_de_passe: oldPassword,
            nouveau_mot_de_passe: newPassword,
          });

          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({
            error: error.message || APP_CONSTANTS.ERRORS.UNKNOWN,
            isLoading: false,
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Getters
      isAdmin: () => get().user?.role === APP_CONSTANTS.ROLES.ADMIN,
      isUser: () => get().user?.role === APP_CONSTANTS.ROLES.USER,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Fonction utilitaire pour valider l'email
function isValidEmail(email: string): boolean {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

// Initialiser l'authentification au chargement
if (typeof window !== 'undefined') {
  const state = useAuthStore.getState();
  if (state.token) {
    apiService.setAuthToken(state.token);
    // Vérifier la validité du token
    state.refreshUser();
  }
}