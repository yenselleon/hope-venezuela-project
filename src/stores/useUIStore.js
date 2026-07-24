// src/stores/useUIStore.js
// Store Zustand para estado de UI transversal: toasts, modales, búsqueda global.

import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // ─── Búsqueda Global ───
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // ─── Filtros de Topbar Admin ───
  selectedZoneFilter: 'Todas',
  setSelectedZoneFilter: (zone) => set({ selectedZoneFilter: zone }),

  selectedDateRangeFilter: '7d', // '7d' | '15d' | '30d' | 'all'
  setSelectedDateRangeFilter: (range) => set({ selectedDateRangeFilter: range }),

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
