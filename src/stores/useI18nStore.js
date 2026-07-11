// src/stores/useI18nStore.js
// Store Zustand para el idioma global de la aplicación.
// Usa middleware `persist` para sobrevivir recargas de página.
// No necesita Provider — se usa directamente en cualquier componente.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import translations from '@/i18n/translations';

export const useI18nStore = create()(
  persist(
    (set, get) => ({
      lang: 'es',

      setLang: (lang) => set({ lang }),

      /**
       * Traduce una clave al idioma activo.
       * Si la clave no existe, retorna la clave misma.
       * @param {string} key
       * @returns {string}
       */
      t: (key) => {
        const lang = get().lang;
        const entry = translations[key];
        if (!entry) return key;
        return entry[lang] ?? entry['es'] ?? key;
      },
    }),
    {
      name: 'hope-lang', // key en localStorage
      partialize: (state) => ({ lang: state.lang }), // solo persiste el idioma
    }
  )
);
