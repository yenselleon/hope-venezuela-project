// src/components/ui/LanguageSwitcher.jsx
// Selector de idioma reutilizable. Usa Zustand store para i18n.

import React from 'react';
import { useI18nStore } from '@/stores/useI18nStore';
import { cn } from '@/utils/helpers';

export function LanguageSwitcher() {
  const { lang, setLang } = useI18nStore();

  return (
    <div className="flex items-center border border-input-border rounded-full p-0.5 bg-transparent">
      <button
        type="button"
        id="lngES"
        className={cn(
          "px-2.5 py-1 rounded-full font-semibold text-xs transition-all cursor-pointer",
          lang === 'es' ? "bg-navy text-white shadow-sm" : "text-text-tertiary hover:text-text-primary"
        )}
        onClick={() => setLang('es')}
      >
        ES
      </button>
      <button
        type="button"
        id="lngEN"
        className={cn(
          "px-2.5 py-1 rounded-full font-semibold text-xs transition-all cursor-pointer",
          lang === 'en' ? "bg-navy text-white shadow-sm" : "text-text-tertiary hover:text-text-primary"
        )}
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  );
}
