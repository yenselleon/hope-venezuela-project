// src/stores/useAuthStore.js
// Store Zustand para estado de autenticación efímero.
// Solo estado del cliente: usuario, rol y sesión.
// Los datos del servidor (voluntarios, etc.) van en TanStack Query.

import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true, // true hasta que se verifique la sesión inicial

  /**
   * Sincroniza el store con una sesión de Supabase.
   * Se llama desde useAuth hook al recibir onAuthStateChange.
   */
  setSession: (session) => {
    if (session?.user) {
      set({
        user: session.user,
        role: session.user.user_metadata?.role || 'coordinador',
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ user: null, role: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearSession: () => set({ user: null, role: null, isAuthenticated: false, isLoading: false }),
}));
