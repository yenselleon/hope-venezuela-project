// src/pages/Registro.jsx
// Formulario de Registro de Voluntarios (Multi-step). Bilingüe.
// Implementa 4 pasos con validación estricta y pantalla de confirmación.
// Utiliza TanStack Query para la mutación del submit.

import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useFormStore } from '@/stores/useFormStore';
import { useI18nStore } from '@/stores/useI18nStore';
import { volunteerService } from '@/services/volunteerService';
import { GridTurnos } from '@/components/ui/GridTurnos';
import {
  ESTADOS_VENEZUELA,
  AREAS_APOYO,
  CERTIFICACIONES,
  TIPOS_VEHICULO,
  GRADOS_ACADEMICOS,
  ZONAS_DESPLIEGUE,
  OPCIONES_HOSPEDAJE,
  OPCIONES_MOVIL,
  APOYO_LOGISTICO,
  DURACION_OPCIONES,
  GENEROS,
  CANALES,
} from '@/utils/constants';
import {
  buildStep1Summary,
  buildStep2Chips,
  buildStep3Summary,
  formatPhone,
} from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import './Registro.css';

export function Registro() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);

  // Zustand Store de Formulario
  const {
    currentStep,
    submitted,
    errors,
    step1,
    step2,
    step3,
    updateField,
    toggleArrayField,
    nextStep,
    prevStep,
    goToStep,
    setSubmitted,
    resetForm,
  } = useFormStore();

  // Mutación para el envío vía TanStack Query
  const mutation = useMutation({
    mutationFn: (data) => volunteerService.create(data),
    onSuccess: () => {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const handleSubmit = () => {
    // Validar consentimiento
    const consent = document.getElementById('consent-checkbox')?.checked;
    if (!consent) {
      updateField(4, 'consentError', true);
      return;
    }
    updateField(4, 'consentError', false);

    // Enviar todos los datos recolectados
    mutation.mutate({
      step1,
      step2,
      step3,
    });
  };

  // Renderizar indicador de progreso
  const progressPct = currentStep * 25;

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow w-full max-w-[760px] mx-auto py-10 px-4">
          <div id="confirm" className="text-center py-10">
            <div className="w-[84px] h-[84px] rounded-full bg-[#eef2ea] border-2 border-green flex items-center justify-center mx-auto mb-5.5">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4A5D3A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="margin-0 mb-3 font-extrabold text-3xl leading-tight tracking-tight text-text-primary">
              {t('confirm.title')}
            </h2>
            <p className="margin-0 mx-auto mb-6.5 max-w-[30em] font-normal text-sm md:text-base leading-relaxed text-text-secondary">
              {t('confirm.sub')}
            </p>

            <div className="max-w-[420px] mx-auto mb-7 text-left bg-white border border-[#efe7d8] rounded-2xl p-5.5">
              <span className="font-bold text-[11px] tracking-wider uppercase text-wine">
                {t('confirm.next.eyebrow')}
              </span>
              <div className="flex flex-col gap-3.5 mt-3.5">
                <div className="flex gap-3 items-center">
                  <span className="w-6.5 h-6.5 rounded-full bg-navy text-white font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <span className="font-medium text-sm text-[#374151]">{t('confirm.next.1')}</span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="w-6.5 h-6.5 rounded-full bg-navy text-white font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <span className="font-medium text-sm text-[#374151]">{t('confirm.next.2')}</span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="w-6.5 h-6.5 rounded-full bg-navy text-white font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <span className="font-medium text-sm text-[#374151]">{t('confirm.next.3')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 max-w-[420px] mx-auto">
              <a
                href={CANALES.whatsappCanal}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-13 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm transition-colors cursor-pointer"
              >
                {t('confirm.whatsapp')}
              </a>
              <a
                href={CANALES.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-13 rounded-xl border border-card-border-light bg-white hover:bg-surface-warm text-text-primary font-bold text-sm transition-colors cursor-pointer"
              >
                {t('confirm.instagram')}
              </a>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  goToStep(1);
                }}
                className="h-11 font-bold text-sm text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              >
                {t('confirm.home')}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-[760px] mx-auto py-8 px-4 md:py-11 md:px-8">
        <div id="form-wrap">
          {/* Indicador de Progreso */}
          <div className="mb-7">
            <div className="flex justify-between items-baseline mb-2.5">
              <span id="step-label" className="font-bold text-[13px] text-navy">
                {t('registro.stepLabel')} {currentStep} {t('registro.stepOf')} 4 ·{' '}
                {t(`registro.step${currentStep}.title`)}
              </span>
              <span id="step-pct" className="font-semibold text-xs text-[#9a9384]">
                {progressPct}%
              </span>
            </div>
            <div className="h-[7px] rounded-full bg-[#eee7d9] overflow-hidden">
              <div
                id="bar"
                style={{ width: `${progressPct}%` }}
                className="h-full bg-navy rounded-full transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
              ></div>
            </div>
          </div>

          {/* ===== PASO 1 · DATOS PERSONALES ===== */}
          {currentStep === 1 && (
            <section className="animate-[fade_0.3s_ease]">
              <h2 className="margin-0 font-extrabold text-2xl text-text-primary tracking-tight">
                {t('registro.step1.title')}
              </h2>
              <p className="margin-0 mt-1 mb-5.5 font-normal text-sm text-[#6B7280]">
                {t('registro.step1.sub')}
              </p>
              <div className="flex flex-col gap-4.5">
                <div>
                  <label className="lbl">
                    {t('campo.nombre')} <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className={cn("fld", errors.nombre && "bad")}
                    placeholder="Ej. María González"
                    value={step1.nombre}
                    onChange={(e) => updateField(1, 'nombre', e.target.value)}
                  />
                  {errors.nombre && <div className="err on">{errors.nombre}</div>}
                </div>
                <div>
                  <label className="lbl">
                    {t('campo.cedula')} <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={cn("fld", errors.cedula && "bad")}
                    placeholder="Solo números — ej. 12345678"
                    value={step1.cedula}
                    onChange={(e) => updateField(1, 'cedula', e.target.value)}
                  />
                  {errors.cedula && <div className="err on">{errors.cedula}</div>}
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="lbl">
                      {t('campo.edad')} <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      className={cn("fld", errors.edad && "bad")}
                      placeholder="Años"
                      value={step1.edad}
                      onChange={(e) => updateField(1, 'edad', e.target.value)}
                    />
                    {errors.edad && <div className="err on">{errors.edad}</div>}
                    {errors.edadMenor && <div className="err on text-wine">{errors.edadMenor}</div>}
                  </div>
                  <div>
                    <label className="lbl">
                      {t('campo.telefono')} <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      className={cn("fld", errors.telefono && "bad")}
                      placeholder="0412-0000000"
                      value={formatPhone(step1.telefono)}
                      onChange={(e) => updateField(1, 'telefono', e.target.value)}
                    />
                    {errors.telefono && <div className="err on">{errors.telefono}</div>}
                  </div>
                </div>
                <div>
                  <label className="lbl">{t('campo.genero')}</label>
                  <div className="flex gap-2.5">
                    {GENEROS.map((gen) => {
                      const isSel = step1.genero === gen.value;
                      return (
                        <button
                          key={gen.value}
                          type="button"
                          className={cn("chip seg cursor-pointer", isSel && "on")}
                          onClick={() => updateField(1, 'genero', gen.value)}
                        >
                          <span className="tick">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                          {gen.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="tile flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="extranjero-checkbox"
                      className="hidden peer"
                      checked={!!step1.extranjero}
                      onChange={(e) => {
                        updateField(1, 'extranjero', e.target.checked);
                        if (e.target.checked) {
                          updateField(1, 'estado', '');
                          updateField(1, 'municipio', '');
                        } else {
                          updateField(1, 'pais', '');
                        }
                      }}
                    />
                    <span className={cn(
                      "tick flex-shrink-0 w-[18px] h-[18px] border-2 border-[#dcdfd8] rounded flex items-center justify-center transition-colors",
                      step1.extranjero ? "bg-navy border-navy" : "bg-white"
                    )}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-opacity", step1.extranjero ? "opacity-100" : "opacity-0")}>
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="font-semibold text-xs md:text-[13px] leading-relaxed text-text-primary">
                      {t('campo.extranjero')}
                    </span>
                  </label>
                </div>
                {step1.extranjero ? (
                  <div>
                    <label className="lbl">
                      {t('campo.pais')} <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className={cn("fld", errors.pais && "bad")}
                      placeholder={lang === 'es' ? 'Ej. España, Estados Unidos, Colombia…' : 'e.g. Spain, United States, Colombia…'}
                      value={step1.pais}
                      onChange={(e) => updateField(1, 'pais', e.target.value)}
                    />
                    {errors.pais && <div className="err on">{errors.pais}</div>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="lbl">
                        {t('campo.estado')} <span className="req">*</span>
                      </label>
                      <select
                        className={cn("fld cursor-pointer", errors.estado && "bad")}
                        value={step1.estado}
                        onChange={(e) => updateField(1, 'estado', e.target.value)}
                      >
                        {ESTADOS_VENEZUELA.map((est) => (
                          <option key={est.value} value={est.value}>
                            {est.label}
                          </option>
                        ))}
                      </select>
                      {errors.estado && <div className="err on">{errors.estado}</div>}
                    </div>
                    <div>
                      <label className="lbl">{t('campo.municipio')}</label>
                      <input
                        type="text"
                        className="fld"
                        placeholder="Ej. Vargas"
                        value={step1.municipio}
                        onChange={(e) => updateField(1, 'municipio', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="lbl">{t('campo.profesion')}</label>
                  <input
                    type="text"
                    className="fld"
                    placeholder={lang === 'es' ? 'Ej. Docente, Ingeniero, Enfermera…' : 'e.g. Teacher, Engineer, Nurse…'}
                    value={step1.profesion}
                    onChange={(e) => updateField(1, 'profesion', e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {/* ===== PASO 2 · ÁREAS DE APOYO ===== */}
          {currentStep === 2 && (
            <section className="animate-[fade_0.3s_ease]">
              <h2 className="margin-0 font-extrabold text-2xl text-text-primary tracking-tight">
                {t('registro.step2.title')}
              </h2>
              <p className="margin-0 mt-1 mb-5.5 font-normal text-sm text-[#6B7280]">
                {t('registro.step2.sub')}
              </p>
              <div className="flex flex-col gap-3">
                {AREAS_APOYO.map((area) => {
                  const isSel = step2.areas.includes(area.value);
                  return (
                    <div key={area.value}>
                      <button
                        type="button"
                        className={cn("tile w-full text-left cursor-pointer", isSel && "on")}
                        onClick={() => toggleArrayField(2, 'areas', area.value)}
                      >
                        <span className="tick mt-0.5">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <div>
                          <b className="font-bold text-sm md:text-[15px] text-text-primary">
                            {area.label}
                          </b>
                          <div className="font-normal text-xs text-[#6B7280] mt-0.5">
                            {area.desc}
                          </div>
                        </div>
                      </button>

                      {/* Campos dinámicos de Salud */}
                      {area.value === 'Salud' && isSel && (
                        <div className="sub on">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="lbl">{t('campo.especialidad')}</label>
                              <input
                                type="text"
                                className="fld"
                                placeholder="Ej. Traumatología"
                                value={step2.especialidad}
                                onChange={(e) => updateField(2, 'especialidad', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="lbl">{t('campo.grado')}</label>
                              <select
                                className="fld cursor-pointer"
                                value={step2.gradoAcademico}
                                onChange={(e) => updateField(2, 'gradoAcademico', e.target.value)}
                              >
                                {GRADOS_ACADEMICOS.map((g) => (
                                  <option key={g.value} value={g.value}>
                                    {g.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Campos dinámicos de Transporte */}
                      {area.value === 'Transporte' && isSel && (
                        <div className="sub on">
                          <label className="lbl">{t('campo.vehiculo')}</label>
                          <div className="flex gap-2 flex-wrap">
                            {TIPOS_VEHICULO.map((veh) => {
                              const isVehSel = step2.vehiculo === veh.value;
                              return (
                                <button
                                  key={veh.value}
                                  type="button"
                                  className={cn("chip cursor-pointer", isVehSel && "on")}
                                  onClick={() => updateField(2, 'vehiculo', veh.value)}
                                >
                                  {veh.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Certificaciones */}
                <div className="border-t border-[#ece3d4] pt-4 mt-2">
                  <label className="lbl">{t('campo.certificaciones')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {CERTIFICACIONES.map((cert) => {
                      const isCertSel = step2.certificaciones.includes(cert.value);
                      return (
                        <button
                          key={cert.value}
                          type="button"
                          className={cn("chip cursor-pointer", isCertSel && "on")}
                          onClick={() => toggleArrayField(2, 'certificaciones', cert.value)}
                        >
                          <span className="tick">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                          {cert.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errors.areas && <div className="err on">{errors.areas}</div>}
              </div>
            </section>
          )}

          {/* ===== PASO 3 · DISPONIBILIDAD ===== */}
          {currentStep === 3 && (
            <section className="animate-[fade_0.3s_ease]">
              <h2 className="margin-0 font-extrabold text-2xl text-text-primary tracking-tight">
                {t('registro.step3.title')}
              </h2>
              <p className="margin-0 mt-1 mb-5.5 font-normal text-sm text-[#6B7280]">
                {t('registro.step3.sub')}
              </p>
              <div className="flex flex-col gap-5.5">
                {/* Zonas de Despliegue */}
                <div>
                  <label className="lbl">
                    {t('campo.zonas')} <span className="req">*</span>{' '}
                    <span className="font-medium text-[#9a9384]">(una o varias)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {ZONAS_DESPLIEGUE.map((zona) => {
                      const isSel = step3.zonas.includes(zona.value);
                      return (
                        <button
                          key={zona.value}
                          type="button"
                          className={cn("chip cursor-pointer", isSel && "on")}
                          onClick={() => toggleArrayField(3, 'zonas', zona.value)}
                        >
                          {zona.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.zonas && <div className="err on">{errors.zonas}</div>}
                </div>

                {/* Hospedaje */}
                <div>
                  <label className="lbl">{t('campo.hospedaje')}</label>
                  <div className="flex gap-2.5 flex-wrap">
                    {OPCIONES_HOSPEDAJE.map((opt) => {
                      const isSel = step3.hospedaje === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={cn("chip seg cursor-pointer", isSel && "on")}
                          onClick={() => updateField(3, 'hospedaje', opt.value)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className={cn(
                      "chip cursor-pointer mt-2.5 inline-flex items-center",
                      step3.familia.includes('Familiar') && "on"
                    )}
                    onClick={() => toggleArrayField(3, 'familia', 'Familiar')}
                  >
                    <span className="tick">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    {t('campo.familiarZona')}
                  </button>
                </div>

                {/* Movilización */}
                <div>
                  <label className="lbl">{t('campo.movilizacion')}</label>
                  <div className="flex gap-2.5 flex-wrap">
                    {OPCIONES_MOVIL.map((opt) => {
                      const isSel = step3.movilizacion === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={cn("chip seg cursor-pointer", isSel && "on")}
                          onClick={() => updateField(3, 'movilizacion', opt.value)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Apoyo Logístico */}
                <div>
                  <label className="lbl">{t('campo.apoyoLogistico')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {APOYO_LOGISTICO.map((opt) => {
                      const isSel = step3.apoyoLogistico.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={cn("chip cursor-pointer", isSel && "on")}
                          onClick={() => toggleArrayField(3, 'apoyoLogistico', opt.value)}
                        >
                          <span className="tick">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grilla Semanal */}
                <div>
                  <label className="lbl">
                    {t('campo.horario')} <span className="font-medium text-[#9a9384]">({t('campo.horarioHint')})</span>
                  </label>
                  <GridTurnos />
                </div>

                {/* Duración */}
                <div>
                  <label className="lbl">{t('campo.duracion')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {DURACION_OPCIONES.map((opt) => {
                      const isSel = step3.duracion === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={cn("chip cursor-pointer", isSel && "on")}
                          onClick={() => updateField(3, 'duracion', opt.value)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {step3.duracion === 'Personalizado' && (
                    <div className="sub on">
                      <label className="lbl">{t('campo.duracionPersonalizada')}</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="btn btn-ghost h-11 w-11 p-0 text-xl font-bold cursor-pointer"
                          onClick={() => updateField(3, 'duracionDias', Math.max(1, step3.duracionDias - 1))}
                        >
                          −
                        </button>
                        <span id="days-val" className="font-extrabold text-xl md:text-2xl text-navy min-w-[64px] text-center select-none">
                          {step3.duracionDias}{' '}
                          <span className="font-semibold text-sm text-[#6B7280]">
                            {lang === 'es' ? 'días' : 'days'}
                          </span>
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost h-11 w-11 p-0 text-xl font-bold cursor-pointer"
                          onClick={() => updateField(3, 'duracionDias', Math.min(180, step3.duracionDias + 1))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ===== PASO 4 · REVISIÓN ===== */}
          {currentStep === 4 && (
            <section className="animate-[fade_0.3s_ease]">
              <h2 className="margin-0 font-extrabold text-2xl text-text-primary tracking-tight">
                {t('registro.step4.title')}
              </h2>
              <p className="margin-0 mt-1 mb-5.5 font-normal text-sm text-[#6B7280]">
                {t('registro.step4.sub')}
              </p>
              <div className="flex flex-col gap-3.5">
                {/* Revisión Paso 1 */}
                <div className="bg-white border border-[#efe7d8] rounded-[14px] p-4.5 md:p-5">
                  <div className="flex justify-between items-center mb-3">
                    <b className="font-bold text-sm text-text-primary">{t('review.personal')}</b>
                    <button
                      type="button"
                      className="font-semibold text-xs text-navy cursor-pointer"
                      onClick={() => goToStep(1)}
                    >
                      {t('registro.edit')}
                    </button>
                  </div>
                  <div className="font-medium text-sm leading-relaxed text-[#4B5563]">
                    {buildStep1Summary(step1).map((line, idx) => (
                      <div key={idx} dangerouslySetInnerHTML={{ __html: line }}></div>
                    ))}
                  </div>
                </div>

                {/* Revisión Paso 2 */}
                <div className="bg-white border border-[#efe7d8] rounded-[14px] p-4.5 md:p-5">
                  <div className="flex justify-between items-center mb-3">
                    <b className="font-bold text-sm text-text-primary">{t('review.areas')}</b>
                    <button
                      type="button"
                      className="font-semibold text-xs text-navy cursor-pointer"
                      onClick={() => goToStep(2)}
                    >
                      {t('registro.edit')}
                    </button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {buildStep2Chips(step2).map((chip, idx) => (
                      <span
                        key={idx}
                        className="bg-[#eef3f8] text-navy font-semibold text-xs px-3 py-1.5 rounded-full"
                      >
                        {chip}
                      </span>
                    ))}
                    {buildStep2Chips(step2).length === 0 && (
                      <span className="text-[#9a9384]">—</span>
                    )}
                  </div>
                </div>

                {/* Revisión Paso 3 */}
                <div className="bg-white border border-[#efe7d8] rounded-[14px] p-4.5 md:p-5">
                  <div className="flex justify-between items-center mb-3">
                    <b className="font-bold text-sm text-text-primary">{t('review.availability')}</b>
                    <button
                      type="button"
                      className="font-semibold text-xs text-navy cursor-pointer"
                      onClick={() => goToStep(3)}
                    >
                      {t('registro.edit')}
                    </button>
                  </div>
                  <div className="font-medium text-sm leading-relaxed text-[#4B5563]">
                    {buildStep3Summary(step3).map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </div>

                {/* Consentimiento */}
                <label className="tile mt-2 flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="consent-checkbox"
                    className="hidden peer"
                    onChange={(e) => {
                      updateField(4, 'consent', e.target.checked);
                      updateField(4, 'consentError', false);
                    }}
                  />
                  <span className="tick peer-checked:bg-navy peer-checked:border-navy mt-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 peer-checked:opacity-100">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="font-medium text-xs md:text-[13px] leading-relaxed text-[#374151]">
                    {t('registro.consent')}
                  </span>
                </label>
                {errors.consentError && <div className="err on">{t('registro.consent')}</div>}
              </div>
            </section>
          )}

          {/* Navegación entre pasos */}
          <div className="flex gap-3 mt-7.5">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-ghost cursor-pointer"
                onClick={prevStep}
                disabled={mutation.isPending}
              >
                {t('registro.prev')}
              </button>
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                className="btn btn-pri flex-1 cursor-pointer"
                onClick={nextStep}
              >
                {t('registro.next')}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-pri flex-1 bg-green hover:bg-green-dark cursor-pointer disabled:opacity-50"
                onClick={handleSubmit}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? t('registro.submitting') : t('registro.submit')}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
