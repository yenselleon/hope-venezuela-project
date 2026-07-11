// src/stores/useUIStore.js
// Store Zustand para estado de UI transversal: toasts, modales.
// No necesita Provider.

import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // ─── Toast ────────────────────────────────────────────────────────────────
  toast: null, // { message: string, type: 'success' | 'info' | 'error' }
  _toastTimer: null,

  showToast: (message, type = 'success', duration = 1900) => {
    const prev = get()._toastTimer;
    if (prev) clearTimeout(prev);

    set({ toast: { message, type } });

    const timer = setTimeout(() => {
      set({ toast: null, _toastTimer: null });
    }, duration);

    set({ _toastTimer: timer });
  },

  hideToast: () => {
    const prev = get()._toastTimer;
    if (prev) clearTimeout(prev);
    set({ toast: null, _toastTimer: null });
  },
}));
