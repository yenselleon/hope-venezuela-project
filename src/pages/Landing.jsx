import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18nStore } from '@/stores/useI18nStore';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useCountUp } from '@/hooks/useCountUp';
import { KPIS, PLAN_ACCIONES, GALERIA_IMPACTO, CENTROS_ACOPIO, CANALES } from '@/utils/constants';
import { formatCount } from '@/utils/formatters';
import { images } from '@/assets/images';
import './Landing.css';

// Componente para animar de forma independiente cada KPI al entrar en el viewport
function KpiCounter({ value, suffix, labelKey, suffixStyle }) {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const [isVisible, setIsVisible] = useState(false);

  // Observa el elemento. Se activa cuando cruza el 30% del viewport.
  const elementRef = useIntersectionObserver(
    (entry) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    },
    { threshold: 0.3 }
  );

  const countValue = useCountUp(value, 1400, isVisible);

  return (
    <div
      ref={elementRef}
      className="bg-white border border-[#efe7d8] rounded-2xl p-6 md:p-5 flex flex-col justify-center"
    >
      <div className="flex items-baseline gap-0.5">
        <span className="font-black text-3xl md:text-4xl text-navy tracking-tight">
          {formatCount(countValue)}
        </span>
        {suffix && (
          <span
            className={
              suffixStyle === 'green'
                ? 'font-black text-2xl text-green'
                : 'font-black text-2xl text-navy'
            }
          >
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-2 font-semibold text-xs text-[#374151]">{t(labelKey)}</div>
    </div>
  );
}

export function Landing() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);

  // Sincronizar el estado del scroll con el body de forma 100% determinista y limpia
  useEffect(() => {
    const handleScroll = () => {
      // Si el scroll vertical de la ventana supera los 120px, consideramos que pasamos el Hero
      const past = window.scrollY > 120;
      document.body.classList.toggle('is-past-hero', past);
    };

    // Evaluar inmediatamente al montar (por si carga con un hash o recarga con scroll guardado)
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup: al desmontar la Landing, remover el listener y limpiar la clase del body
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('is-past-hero');
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* ===================== HERO ===================== */}
      <section
        id="top"
        className="hero-wrap flex flex-col-reverse md:flex-row items-stretch min-h-[460px] md:min-h-[clamp(460px,72vh,720px)]"
      >
        {/* Lado izquierdo - Info */}
        <div className="hero-copy flex-1 flex flex-col justify-center gap-5 bg-navy text-white py-12 px-6 md:py-16 md:px-12 lg:px-16">
          <div className="flex items-center gap-2">
            <span className="flex gap-1">
              <i className="w-2 h-2 rounded-full bg-flag-yellow"></i>
              <i className="w-2 h-2 rounded-full bg-flag-blue"></i>
              <i className="w-2 h-2 rounded-full bg-flag-red"></i>
            </span>
            <span className="font-bold text-xs tracking-widest uppercase text-flag-yellow">
              {t('hero.eyebrow')}
            </span>
          </div>
          <h1 className="margin-0 font-extrabold text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight max-w-xl">
            {t('hero.title')}
          </h1>
          <p className="margin-0 max-w-[30em] font-normal text-sm md:text-base leading-relaxed text-[#cfd9e4]">
            {t('hero.sub')}
          </p>
          <div className="flex flex-wrap gap-3 mt-1.5">
            <Link
              to="/registro"
              className="flex items-center justify-center h-12 md:h-14 px-6 md:px-7 rounded-xl bg-white hover:bg-[#eef3f8] !text-navy font-bold text-sm md:text-base transition-all transform hover:-translate-y-0.5"
            >
              {t('cta.volunteer')}
            </Link>
            <Link
              to="/donar"
              className="flex items-center justify-center h-12 md:h-14 px-6 md:px-7 rounded-xl border border-white/60 hover:bg-white/12 hover:border-white !text-white font-bold text-sm md:text-base transition-all"
            >
              {t('cta.donate')}
            </Link>
          </div>
          <div className="flex items-center gap-2.5 mt-2 opacity-92">
            <img src={images['logo-heart']} width="22" height="22" alt="" className="w-5.5 h-5.5" />
            <span className="font-medium text-xs text-[#aebccb]">{t('hero.trust')}</span>
          </div>
        </div>

        {/* Lado derecho - Media */}
        <div className="hero-media flex-1 relative min-h-[240px] md:min-h-0 bg-[#0a2647]">
          <img
            src={images['foto-familia-bandera']}
            alt="Familias con la bandera de Venezuela en una jornada comunitaria"
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/28 to-transparent"></div>
        </div>
      </section>

      {/* ===================== IMPACTO ===================== */}
      <section id="impacto" className="max-w-[1200px] mx-auto py-12 px-5 md:py-20 md:px-10 lg:px-12">
        <div className="flex flex-col gap-2.5 max-w-[640px] mb-8 md:mb-12">
          <span className="font-bold text-xs tracking-widest uppercase text-wine">
            {t('impact.eyebrow')}
          </span>
          <h2 className="margin-0 font-extrabold text-2xl md:text-3xl lg:text-4xl leading-snug tracking-tight text-text-primary">
            {t('impact.title')}
          </h2>
          <p className="margin-0 font-normal text-sm md:text-base leading-relaxed text-text-secondary">
            {t('impact.sub')}
          </p>
        </div>

        {/* Cifras animadas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8 md:mb-12">
          {KPIS.map((kpi, idx) => (
            <KpiCounter
              key={idx}
              value={kpi.value}
              suffix={kpi.suffix}
              labelKey={kpi.labelKey}
              suffixStyle={kpi.suffixStyle}
            />
          ))}
        </div>

        {/* Galería de imágenes en grilla responsive */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 auto-rows-[140px] md:auto-rows-[200px]">
          {GALERIA_IMPACTO.map((item, idx) => {
            const isSpan = item.span === '2x2';
            return (
              <figure
                key={idx}
                className={`margin-0 relative rounded-2xl overflow-hidden ${
                  isSpan ? 'col-span-2 row-span-2' : ''
                }`}
              >
                <img
                  src={images[item.src]}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 py-4 px-4 bg-gradient-to-t from-navy/80 to-transparent text-white font-semibold text-xs md:text-sm">
                  {item.caption}
                </figcaption>
              </figure>
            );
          })}
        </div>
        <p className="mt-3.5 font-medium text-xs text-[#9a9384]">
          {t('impact.disclaimer')}
        </p>
      </section>

      {/* ===================== QUIÉNES SOMOS ===================== */}
      <section id="nosotros" className="bg-white border-t border-b border-[#efe7d8]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-stretch gap-7 md:gap-12 lg:gap-16 py-12 px-5 md:py-20 md:px-10 lg:px-12">
          <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[300px] md:min-h-[360px]">
            <img
              src={images['foto-rescate-fe']}
              alt="Voluntario en labores de rescate"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-4">
            <span className="font-bold text-xs tracking-widest uppercase text-wine">
              {t('mission.eyebrow')}
            </span>
            <h2 className="margin-0 font-extrabold text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight text-text-primary">
              {t('mission.title')}
            </h2>
            <p className="margin-0 font-normal text-sm md:text-base leading-relaxed text-text-secondary">
              {t('mission.body')}
            </p>
            <div className="mt-1">
              <span className="font-extrabold text-lg md:text-xl lg:text-2xl leading-snug tracking-tight text-navy">
                {t('mission.tag')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== NUESTRA MISIÓN ===================== */}
      <section id="mision" className="bg-[#eef3f8] border-b border-[#dbe4ef]">
        <div className="max-w-[960px] mx-auto py-14 px-5 md:py-20 md:px-10 flex flex-col items-center text-center gap-4.5">
          <span className="font-bold text-xs tracking-widest uppercase text-wine">
            {t('purpose.eyebrow')}
          </span>
          <h2 className="margin-0 font-extrabold text-2xl md:text-3xl lg:text-4xl leading-snug tracking-tight text-navy max-w-lg text-wrap">
            {t('purpose.title')}
          </h2>
          <p className="margin-0 font-normal text-sm md:text-base lg:text-lg leading-relaxed text-[#374151] max-w-2xl">
            {t('purpose.body')}
          </p>
        </div>
      </section>

      {/* ===================== PLAN DE ACCIÓN ===================== */}
      <section id="plan" className="max-w-[1200px] mx-auto py-12 px-5 md:py-20 md:px-10 lg:px-12">
        <div className="flex flex-col gap-2.5 max-w-[620px] mb-8 md:mb-12">
          <span className="font-bold text-xs tracking-widest uppercase text-wine">
            {t('plan.eyebrow')}
          </span>
          <h2 className="margin-0 font-extrabold text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight text-text-primary">
            {t('plan.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAN_ACCIONES.map((action, idx) => (
            <article
              key={idx}
              className="bg-white border border-[#efe7d8] rounded-[18px] overflow-hidden flex flex-col"
            >
              <div className="h-[150px] relative">
                <img
                  src={images[action.img]}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <span className="w-7.5 h-7.5 rounded-full bg-navy text-white font-extrabold text-[13px] flex items-center justify-center">
                  {action.num}
                </span>
                <h3 className="margin-0 mt-0.5 font-bold text-[17px] text-text-primary">
                  {t(action.titleKey)}
                </h3>
                <p className="margin-0 font-normal text-xs md:text-sm leading-relaxed text-text-tertiary">
                  {t(action.descKey)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===================== CASA MISIONERA ===================== */}
      <section id="casa" className="bg-white border-t border-b border-[#efe7d8]">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-stretch gap-7 md:gap-12 py-12 px-5 md:py-20 md:px-10 lg:px-12">
          {/* Collage */}
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-[300px]">
            <div className="relative rounded-[18px] overflow-hidden row-span-2">
              <img
                src={images['casa-carpa']}
                alt="Voluntarios entregando insumos en punto de atención"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="relative rounded-[18px] overflow-hidden">
              <img
                src={images['casa-acopio']}
                alt="Voluntarios organizando agua e insumos"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="relative rounded-[18px] overflow-hidden">
              <img
                src={images['casa-brigada']}
                alt="Coordinación de la brigada de voluntarios"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Texto y Ubicación */}
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <span className="font-bold text-xs tracking-widest uppercase text-wine">
              {t('casa.eyebrow')}
            </span>
            <h2 className="margin-0 font-extrabold text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight text-text-primary">
              {t('casa.title')}
            </h2>
            <p className="margin-0 font-normal text-sm md:text-base leading-relaxed text-text-secondary">
              {t('casa.body')}
            </p>
            <div className="flex flex-col gap-2.5 p-4 md:p-5 bg-[#f6f4ee] rounded-[14px]">
              <div className="flex items-start gap-2.5">
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
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="font-medium text-xs md:text-sm leading-relaxed text-[#374151]">
                  {t('casa.addr')}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="#25D366"
                  className="flex-shrink-0"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="font-semibold text-xs md:text-sm text-[#374151]">
                  Arturo S. ·{' '}
                  <a href="https://wa.me/584127005231" target="_blank" rel="noopener noreferrer" className="text-navy hover:underline">
                    0412-7005231
                  </a>
                </span>
              </div>
            </div>
            <a
              href={CANALES.casaMisioneraMap}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start flex items-center gap-2 h-12 px-[22px] rounded-[11px] bg-navy hover:bg-[#00284f] !text-white font-bold text-sm transition-colors"
            >
              {t('casa.map')}
            </a>
          </div>
        </div>
      </section>

      {/* ===================== MANTENTE INFORMADO ===================== */}
      <section id="informado" className="bg-[#eef3f8] border-t border-b border-[#dbe4ef]">
        <div className="max-w-[1200px] mx-auto py-12 px-5 md:py-20 md:px-10 lg:px-12">
          <div className="flex flex-col gap-2.5 max-w-[620px] mb-8 md:mb-12">
            <span className="font-bold text-xs tracking-widest uppercase text-wine">
              {t('stay.eyebrow')}
            </span>
            <h2 className="margin-0 font-extrabold text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight text-text-primary">
              {t('stay.title')}
            </h2>
            <p className="margin-0 font-normal text-sm md:text-base leading-relaxed text-text-secondary">
              {t('stay.sub')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[640px]">
            {/* WhatsApp */}
            <a
              href={CANALES.whatsappCanal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-white border border-[#dbe4ef] rounded-2xl hover:border-[#25D366] hover:-translate-y-0.5 transition-all group"
            >
              <span className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </span>
              <div className="flex flex-col">
                <b className="font-bold text-sm text-text-primary group-hover:text-[#25D366] transition-colors">
                  {t('stay.whatsapp')}
                </b>
                <span className="font-normal text-xs text-text-tertiary mt-0.5">
                  {t('stay.whatsapp.desc')}
                </span>
              </div>
            </a>

            {/* Instagram */}
            <a
              href={CANALES.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-white border border-[#dbe4ef] rounded-2xl hover:border-[#E1306C] hover:-translate-y-0.5 transition-all group"
            >
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </span>
              <div className="flex flex-col">
                <b className="font-bold text-sm text-text-primary group-hover:text-[#E1306C] transition-colors">
                  {t('stay.instagram')}
                </b>
                <span className="font-normal text-xs text-text-tertiary mt-0.5">
                  {t('stay.instagram.desc')}
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ===================== CÓMO AYUDAR ===================== */}
      {/* Forzamos el fondo azul oscuro mediante style y flex layout para garantizar contraste */}
      <section 
        id="unete" 
        style={{ backgroundColor: '#003366' }}
        className="text-white py-12 px-5 md:py-20 md:px-10 lg:px-12"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-2.5 max-w-[620px] mb-8 md:mb-12">
            <span className="font-bold text-xs tracking-widest uppercase text-flag-yellow">
              {t('help.eyebrow')}
            </span>
            <h2 className="margin-0 font-extrabold text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight text-white">
              {t('help.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Orar */}
            <a
              href={CANALES.guiaOraciónPDF}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.16)' }}
              className="border rounded-2xl p-6 flex flex-col gap-3 !text-white hover:bg-white/12 hover:-translate-y-0.5 transition-all"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FCD116"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 7v14" />
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
              </svg>
              <b className="font-bold text-[17px] !text-white">{t('help1')}</b>
              <span className="font-normal text-xs md:text-sm leading-relaxed !text-[#cfd9e4]">
                {t('help1d')}
              </span>
            </a>

            {/* Donar */}
            <Link
              to="/donar"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.16)' }}
              className="border rounded-2xl p-6 flex flex-col gap-3 !text-white hover:bg-white/12 hover:-translate-y-0.5 transition-all"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FCD116"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
              </svg>
              <b className="font-bold text-[17px] !text-white">{t('help2')}</b>
              <span className="font-normal text-xs md:text-sm leading-relaxed !text-[#cfd9e4]">
                {t('help2d')}
              </span>
            </Link>

            {/* Voluntario */}
            <Link
              to="/registro"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.16)' }}
              className="border rounded-2xl p-6 flex flex-col gap-3 !text-white hover:bg-white/12 hover:-translate-y-0.5 transition-all"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FCD116"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <b className="font-bold text-[17px] !text-white">{t('help3')}</b>
              <span className="font-normal text-xs md:text-sm leading-relaxed !text-[#cfd9e4]">
                {t('help3d')}
              </span>
            </Link>

            {/* Compartir */}
            <a
              href={CANALES.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.16)' }}
              className="border rounded-2xl p-6 flex flex-col gap-3 !text-white hover:bg-white/12 hover:-translate-y-0.5 transition-all"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FCD116"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <b className="font-bold text-[17px] !text-white">{t('help4')}</b>
              <span className="font-normal text-xs md:text-sm leading-relaxed !text-[#cfd9e4]">
                {t('help4d')}
              </span>
            </a>
          </div>
        </div>
      </section>


      {/* ===================== FLOATING ACTION BAR (móvil) ===================== */}
      <div className="float-bar">
        <Link
          to="/registro"
          className="flex-1 flex items-center justify-center h-[50px] rounded-xl bg-navy !text-white font-bold text-sm"
        >
          {t('cta.volunteerShort')}
        </Link>
        <Link
          to="/donar"
          className="flex-1 flex items-center justify-center h-[50px] rounded-xl border border-navy !text-navy font-bold text-sm"
        >
          {t('cta.donate')}
        </Link>
      </div>
    </div>
  );
}
