// src/components/layout/Header.jsx
// Header de la aplicación. Bilingüe y responsive.
// Implementa renderizado condicional según la ruta actual (Landing vs. Páginas internas).
// Los botones del Hero/Header usan especificidad forzada (!text-*) para evitar sobreescritura de estilos base.

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18nStore } from '@/stores/useI18nStore';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import logoFull from '@/assets/logo-full.png';
import './Header.css';

export function Header() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const location = useLocation();
  const isHome = location.pathname === '/';

  // ─── Header de Páginas Internas (Compacto) ───────────────────────────────
  if (!isHome) {
    return (
      <header className="sticky top-0 z-50 bg-[#faf7f2]/90 backdrop-blur-md border-b border-card-border-light shadow-sm">
        <div className="max-w-[900px] mx-auto flex items-center justify-between gap-4 py-3 px-4 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-semibold text-xs md:text-sm !text-[#374151] hover:!text-navy transition-colors select-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            {t('cta.back')}
          </Link>
          <div className="flex items-center gap-4">
            <img src={logoFull} alt="Hope en Venezuela" className="h-10 md:h-11 w-auto" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>
    );
  }

  // ─── Header de la Landing Page (Completo y Dinámico) ──────────────────────
  return (
    <header className="sticky top-0 z-50 bg-[#faf7f2]/86 backdrop-blur-md border-b border-card-border-light">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-5 py-3 px-[clamp(18px,4vw,40px)]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoFull} alt="Hope en Venezuela" className="h-[48px] w-auto" />
        </Link>

        {/* Links de navegación (ocultos en móvil/tablet <= 900px) */}
        <nav className="hidden md:hidden lg:flex items-center gap-[26px]">
          <a href="#nosotros" className="font-semibold text-sm !text-[#374151] hover:!text-navy transition-colors font-sans">
            {t('nav.about')}
          </a>
          <a href="#plan" className="font-semibold text-sm !text-[#374151] hover:!text-navy transition-colors font-sans">
            {t('nav.plan')}
          </a>
          <a href="#impacto" className="font-semibold text-sm !text-[#374151] hover:!text-navy transition-colors font-sans">
            {t('nav.impact')}
          </a>
          <a href="#unete" className="font-semibold text-sm !text-[#374151] hover:!text-navy transition-colors font-sans">
            {t('nav.help')}
          </a>
        </nav>

        {/* CTAs e Idioma */}
        <div className="flex items-center gap-3.5">
          {/* CTAs del header: revelados tras hacer scroll past el Hero (vía clase is-past-hero en body) */}
          <div className="header-cta items-center">
            <Link
              to="/registro"
              className="flex items-center h-10 px-4 rounded-[10px] bg-navy hover:bg-navy-hover !text-white font-semibold text-[13px] transition-colors"
            >
              {t('cta.volunteer')}
            </Link>
            <Link
              to="/donar"
              className="flex items-center h-10 px-4 rounded-[10px] border border-navy !text-navy hover:bg-[#eef3f8] font-semibold text-[13px] transition-colors"
            >
              {t('cta.donate')}
            </Link>
          </div>

          {/* Botón de Acceso Admin */}
          <Link
            to="/admin"
            className="flex items-center h-[34px] px-3.5 rounded-full border border-input-border hover:border-navy hover:bg-info-bg !text-text-secondary hover:!text-navy font-semibold text-[11px] sm:text-xs transition-colors shrink-0 select-none"
          >
            <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>{t('nav.admin')}</span>
          </Link>

          {/* Selector de idioma */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
