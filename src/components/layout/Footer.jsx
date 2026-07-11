// src/components/layout/Footer.jsx
// Footer de la aplicación. Bilingüe.
// Muestra logo-heart, mensaje de transparencia y link a administradores.

import React from 'react';
import { useI18nStore } from '@/stores/useI18nStore';
import logoHeart from '@/assets/logo-heart.png';

export function Footer() {
  const t = useI18nStore((s) => s.t);

  return (
    <footer className="bg-navy-dark text-white mt-auto">
      {/* Sección principal */}
      <div className="max-w-[1200px] mx-auto py-10 px-5 md:px-12 flex flex-wrap gap-7 items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoHeart} width="34" height="34" alt="" className="w-[34px] h-[34px]" />
          <div className="flex flex-col">
            <span className="font-extrabold text-lg">Hope en Venezuela</span>
            <span className="font-medium text-xs text-[#aebccb]">{t('footer.motto')}</span>
          </div>
        </div>
        <p className="margin-0 max-w-[34em] font-normal text-xs leading-relaxed text-[#aebccb]">
          {t('footer.transparency')}
        </p>
      </div>

      {/* Franja de derechos */}
      <div className="border-t border-white/12">
        <div className="max-w-[1200px] mx-auto py-4 px-5 md:px-12 flex flex-wrap gap-4 justify-between text-xs font-medium text-[#8ea0b4]">
          <span>{t('footer.rights')}</span>
          <div className="flex gap-4">
            <a href="/admin" className="text-[#8ea0b4] hover:text-white transition-colors">
              {t('footer.admin')}
            </a>
            <span>WhatsApp · Instagram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
