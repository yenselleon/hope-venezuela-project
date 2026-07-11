// src/pages/Donar.jsx
// Página de Donaciones. Bilingüe.
// Muestra centros de acopio y datos bancarios reales (Banesco y Zelle).
// Implementa copiado al portapapeles y notificaciones tipo toast.

import React, { useState } from 'react';
import { useI18nStore } from '@/stores/useI18nStore';
import { useClipboard } from '@/hooks/useClipboard';
import { CENTROS_ACOPIO, DONACION_BANESCO, DONACION_ZELLE } from '@/utils/constants';

import { cn } from '@/utils/helpers';

export function Donar() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const [activeTab, setActiveTab] = useState('acopio'); // 'acopio' | 'fondos'
  const { copy: copyBanesco } = useClipboard(t('donar.copiado'));
  const { copy: copyZelle } = useClipboard(t('donar.copiado'));

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-[900px] mx-auto py-8 px-4 md:py-14 md:px-8">
        {/* Cabecera */}
        <div className="flex flex-col gap-2.5 mb-7">
          <span className="font-bold text-xs tracking-widest uppercase text-wine">
            {t('donar.eyebrow')}
          </span>
          <h1 className="margin-0 font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-text-primary">
            {t('donar.title')}
          </h1>
          <p className="margin-0 font-normal text-base md:text-lg leading-relaxed text-text-secondary max-w-2xl">
            {t('donar.sub')}
          </p>
        </div>

        {/* Pestañas (Tabs) */}
        <div className="flex gap-1 bg-[#eee7d9] rounded-xl p-1 mb-7">
          <button
            type="button"
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-11 rounded-lg font-semibold text-sm transition-all cursor-pointer",
              activeTab === 'acopio'
                ? "bg-white text-navy shadow-sm"
                : "text-text-tertiary hover:text-text-primary"
            )}
            onClick={() => setActiveTab('acopio')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8v13H3V8" />
              <path d="M1 3h22v5H1z" />
              <path d="M10 12h4" />
            </svg>
            {t('donar.tab.acopio')}
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-11 rounded-lg font-semibold text-sm transition-all cursor-pointer",
              activeTab === 'fondos'
                ? "bg-white text-navy shadow-sm"
                : "text-text-tertiary hover:text-text-primary"
            )}
            onClick={() => setActiveTab('fondos')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            {t('donar.tab.fondos')}
          </button>
        </div>

        {/* Panel Acopio */}
        {activeTab === 'acopio' && (
          <div className="animate-[fade_0.3s_ease]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CENTROS_ACOPIO.map((centro) => (
                <article
                  key={centro.id}
                  className="bg-white border border-[#efe7d8] rounded-2xl p-5.5 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[10px] tracking-wider text-wine uppercase">
                      {centro.zona}
                    </span>
                    {centro.horario ? (
                      <span className="font-semibold text-[11px] text-navy bg-[#eef3f8] px-2.5 py-1 rounded-full">
                        {centro.horario}
                      </span>
                    ) : (
                      <span className="flex gap-1">
                        <i className="w-2 h-2 rounded-full bg-flag-yellow"></i>
                        <i className="w-2 h-2 rounded-full bg-flag-blue"></i>
                        <i className="w-2 h-2 rounded-full bg-flag-red"></i>
                      </span>
                    )}
                  </div>
                  <b className="font-bold text-lg text-text-primary">{centro.nombre}</b>
                  <p className="margin-0 font-normal text-xs md:text-sm leading-relaxed text-text-secondary">
                    {centro.direccion}
                  </p>
                  <div className="font-medium text-[13px] leading-relaxed text-text-tertiary border-t border-[#f0eadf] pt-3">
                    {centro.contactos.map((c, i) => (
                      <div key={i}>
                        {c.nombre ? `${c.nombre} · ` : ''}
                        <a href={`tel:${c.tel}`} className="text-navy">
                          {c.telefono}
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-1.5 flex">
                    <a
                      href={centro.mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-lg border border-navy text-navy font-bold text-xs md:text-sm hover:bg-[#eef3f8] transition-colors"
                    >
                      {t('donar.verUbicacion')}
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Aviso informativo */}
            <div className="mt-5 bg-[#eef3f8] rounded-xl p-4.5 flex gap-3 items-start">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#003366"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <p className="margin-0 font-medium text-xs md:text-sm leading-relaxed text-[#374151]">
                {t('donar.insumos.info')}
              </p>
            </div>
          </div>
        )}

        {/* Panel Fondos */}
        {activeTab === 'fondos' && (
          <div className="animate-[fade_0.3s_ease]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Banesco */}
              <article className="bg-white border border-[#efe7d8] rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <b className="font-bold text-xl text-text-primary">{DONACION_BANESCO.banco}</b>
                  <span className="font-semibold text-[11px] text-navy bg-[#eef3f8] px-3 py-1.5 rounded-full">
                    {DONACION_BANESCO.tipo}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[11px] text-[#9a9384] uppercase tracking-wider">
                      Cuenta ({DONACION_BANESCO.tipoCuenta})
                    </span>
                    <div className="flex justify-between items-center gap-2.5 bg-[#f6f4ee] rounded-lg p-2.5">
                      <span className="font-semibold text-sm md:text-base font-mono text-text-primary">
                        {DONACION_BANESCO.cuenta}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyBanesco(DONACION_BANESCO.cuentaCopy)}
                        className="inline-flex items-center gap-1.5 h-9.5 px-4.5 rounded-lg font-bold text-xs text-white bg-navy hover:bg-[#00284f] cursor-pointer transition-colors"
                      >
                        {t('donar.copiar')}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-5 flex-wrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[11px] text-[#9a9384] uppercase tracking-wider">
                        Titular
                      </span>
                      <span className="font-semibold text-xs md:text-sm text-[#374151]">
                        {DONACION_BANESCO.titular}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[11px] text-[#9a9384] uppercase tracking-wider">
                        RIF / Cédula
                      </span>
                      <span className="font-semibold text-xs md:text-sm text-[#374151]">
                        V-{DONACION_BANESCO.cedula}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#fdf6e3] border border-[#f2e4b8] rounded-lg p-3">
                  <span className="font-medium text-xs text-[#7a5c12]">Concepto:</span>
                  <b className="font-bold text-xs text-wine">
                    {lang === 'es' ? DONACION_BANESCO.concepto : DONACION_BANESCO.conceptoEN}
                  </b>
                </div>
              </article>

              {/* Zelle */}
              <article className="bg-[#fbfcfa] border border-[#cfdac4] rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <b className="font-bold text-xl text-text-primary">{DONACION_ZELLE.metodo}</b>
                  <span className="font-semibold text-[11px] text-green bg-[#eef2ea] px-3 py-1.5 rounded-full">
                    {DONACION_ZELLE.tipo}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[11px] text-[#9a9384] uppercase tracking-wider">
                      Teléfono Zelle
                    </span>
                    <div className="flex justify-between items-center gap-2.5 bg-[#eef2ea] rounded-lg p-2.5">
                      <span className="font-semibold text-sm md:text-base font-mono text-text-primary">
                        {DONACION_ZELLE.numero}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyZelle(DONACION_ZELLE.numeroCopy)}
                        className="inline-flex items-center gap-1.5 h-9.5 px-4.5 rounded-lg font-bold text-xs text-white bg-green hover:bg-[#3a4a2e] cursor-pointer transition-colors"
                      >
                        {t('donar.copiar')}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-[11px] text-[#9a9384] uppercase tracking-wider">
                      A nombre de
                    </span>
                    <span className="font-semibold text-xs md:text-sm text-[#374151]">
                      {DONACION_ZELLE.titular}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#eef2ea] rounded-lg p-3 text-[#3a4a2e]">
                  <span className="font-medium text-xs">
                    {lang === 'es' ? DONACION_ZELLE.nota : DONACION_ZELLE.notaEN}
                  </span>
                </div>
              </article>
            </div>

            {/* Aviso sobre datos reales */}
            <div className="mt-5 bg-[#eef3f8] rounded-xl p-4.5 flex gap-3 items-start">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#003366"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 mt-0.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="margin-0 font-medium text-xs md:text-sm leading-relaxed text-[#374151]">
                Datos de cuenta verificados de los coordinadores financieros de la campaña.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
