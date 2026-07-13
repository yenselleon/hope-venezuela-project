// src/pages/admin/DashboardPanel.jsx
// ──────────────────────────────────────────────────────────
// Dashboard overview panel matching Admin.dc.html design.
// KPI cards, bar chart, donut chart, zone coverage, supply list.
// Animated count-up effect and chart bar growth on mount.
// ──────────────────────────────────────────────────────────

import { useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { volunteerService } from '@/services/volunteerService';
import './Admin.css';

// ── Demo data (matches the design reference) ─────────────────
const DEMO_AREAS = [
  { key: 'Salud', count: 96 },
  { key: 'Logística', count: 68 },
  { key: 'Transporte', count: 50 },
  { key: 'Familias', count: 78 },
  { key: 'Rescate', count: 37, isRed: true },
];

const DEMO_ZONES = [
  { name: 'Vargas', pct: 82, count: 64 },
  { name: 'Miranda S.A.', pct: 56, count: 41 },
  { name: 'Los Teques', pct: 26, count: 18, isRed: true },
  { name: 'Aragua', pct: 44, count: 29 },
];

const DEMO_SUPPLIES = [
  { name: 'admin.supply.water', status: 'ok', label: 'OK · 620 u' },
  { name: 'admin.supply.food', status: 'warn', label: 'Stock bajo · 90 u' },
  { name: 'admin.supply.medicine', status: 'crit', label: 'Vence pronto · 40 u' },
  { name: 'admin.supply.hygiene', status: 'ok', label: 'OK · 310 u' },
  { name: 'admin.supply.mattresses', status: 'warn', label: 'Stock bajo · 48 u' },
];

// ── Animated Counter Hook ────────────────────────────────────
function useCountUp(target, duration = 1100) {
  const ref = useRef(null);
  const animated = useRef(false);

  const animate = useCallback(() => {
    if (animated.current || !ref.current) return;
    animated.current = true;
    const el = ref.current;
    const t0 = performance.now();
    const fmt = (n) => (n >= 1000 ? n.toLocaleString('es-ES') : String(n));

    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      el.textContent = fmt(target);
    } else {
      el.textContent = '0';
      requestAnimationFrame(step);
    }
  }, [target, duration]);

  // Trigger on ref attach
  const setRef = useCallback(
    (node) => {
      ref.current = node;
      if (node) animate();
    },
    [animate]
  );

  return setRef;
}

// ── KPI Card ─────────────────────────────────────────────────
function KpiCard({ count, label, color, variant, onClick, arrowIcon, children }) {
  const countRef = useCountUp(count);
  const classes = ['admin-kpi'];
  if (variant === 'warn') classes.push('admin-kpi--warn');
  if (variant === 'crit') classes.push('admin-kpi--crit');

  return (
    <div className={classes.join(' ')} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <span className="admin-kpi-number" ref={countRef} style={color ? { color } : undefined}>
        0
      </span>
      <span className="admin-kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {label}
        {arrowIcon && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </span>
      {children}
    </div>
  );
}

// ── Bar Chart ────────────────────────────────────────────────
function BarChart({ areas, total, t }) {
  const maxCount = Math.max(...areas.map((a) => a.count));

  return (
    <div className="admin-dash-card" style={{ gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b className="admin-dash-card-title">{t('admin.dash.byArea')}</b>
        <span className="admin-pill admin-pill-neutral">Total {total}</span>
      </div>
      <div className="admin-chart-wrap">
        {areas.map((area) => {
          const heightPct = Math.round((area.count / maxCount) * 74);
          return (
            <div className="admin-chart-col" key={area.key}>
              <span className="admin-chart-val">{area.count}</span>
              <div
                className={`admin-chartbar${area.isRed ? ' admin-chartbar--red' : ''}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className="admin-chart-label">{area.key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Donut Chart ──────────────────────────────────────────────
function DonutChart({ total, t }) {
  return (
    <div className="admin-dash-card" style={{ gap: 14 }}>
      <b className="admin-dash-card-title">{t('admin.dash.byStatus')}</b>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 22, justifyContent: 'center' }}>
        <div className="admin-donut">
          <div className="admin-donut-center">
            <b>{total}</b>
            <span>total</span>
          </div>
        </div>
        <div className="admin-legend">
          <div className="admin-legend-item">
            <i className="admin-legend-dot" style={{ background: '#2f7d4f' }} />
            <span className="admin-legend-label">{t('admin.status.activos')}</span>
            <b className="admin-legend-pct">62%</b>
          </div>
          <div className="admin-legend-item">
            <i className="admin-legend-dot" style={{ background: '#e6a93a' }} />
            <span className="admin-legend-label">{t('admin.status.pendientes')}</span>
            <b className="admin-legend-pct">16%</b>
          </div>
          <div className="admin-legend-item">
            <i className="admin-legend-dot" style={{ background: '#8fa3b8' }} />
            <span className="admin-legend-label">{t('admin.dash.aprobados')}</span>
            <b className="admin-legend-pct">22%</b>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Zone Coverage ────────────────────────────────────────────
function ZoneCoverage({ zones, t }) {
  return (
    <div className="admin-dash-card" style={{ gap: 14 }}>
      <b className="admin-dash-card-title">{t('admin.dash.zoneCoverage')}</b>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {zones.map((zone) => (
          <div className="admin-progress-row" key={zone.name}>
            <span className="admin-progress-name">{zone.name}</span>
            <div className="admin-progress-track">
              <div
                className={`admin-progress-fill${zone.isRed ? ' admin-progress-fill--red' : ''}`}
                style={{ width: `${zone.pct}%` }}
              />
            </div>
            <b className={`admin-progress-val${zone.isRed ? ' admin-progress-val--red' : ''}`}>
              {zone.count}
            </b>
          </div>
        ))}
      </div>
      <div className="admin-alert-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b02a24" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
        <span>{t('admin.dash.lowCoverage')}</span>
      </div>
    </div>
  );
}

// ── Supply List ──────────────────────────────────────────────
function SupplyList({ supplies, t }) {
  const pillClass = { ok: 'admin-pill-ok', warn: 'admin-pill-warn', crit: 'admin-pill-crit' };

  return (
    <div className="admin-dash-card" style={{ gap: 12 }}>
      <b className="admin-dash-card-title">{t('admin.dash.supplies')}</b>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {supplies.map((s) => (
          <div className="admin-supply-item" key={s.name}>
            <span className="admin-supply-name">{t(s.name)}</span>
            <span className={`admin-pill ${pillClass[s.status]}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard Panel ─────────────────────────────────────
export default function DashboardPanel() {
  const t = useI18nStore((s) => s.t);
  const navigate = useNavigate();

  // Real data query (for counts)
  const { data: volData } = useQuery({
    queryKey: ['volunteers', 'all-count'],
    queryFn: () => volunteerService.getAll({ pageSize: 1 }),
    select: (res) => res.total,
    staleTime: 60_000,
  });

  const { data: pendingCount } = useQuery({
    queryKey: ['volunteers', 'pending-count'],
    queryFn: () => volunteerService.getAll({ estado_voluntario: 'pendiente', pageSize: 1 }),
    select: (res) => res.total,
    staleTime: 30_000,
  });

  const { data: activeCount } = useQuery({
    queryKey: ['volunteers', 'active-count'],
    queryFn: () => volunteerService.getAll({ estado_voluntario: 'activo', pageSize: 1 }),
    select: (res) => res.total,
    staleTime: 60_000,
  });

  // Use real data if available, fallback to demo
  const totalVol = volData ?? 342;
  const pending = pendingCount ?? 5;
  const active = activeCount ?? 218;

  return (
    <div className="admin-panel admin-fade">
      {/* ── KPI Row ── */}
      <div className="admin-kpi-row">
        <KpiCard count={totalVol} label={t('admin.dash.kpi.total')} />
        <KpiCard count={active} label={t('admin.status.activo')} color="#2f7d4f" />
        <KpiCard
          count={pending}
          label={t('admin.dash.kpi.pending')}
          variant="warn"
          arrowIcon
          onClick={() => navigate('/admin/aprobacion')}
        />
        <KpiCard count={1860} label={t('admin.dash.kpi.supplies')} />
        <KpiCard count={5} label={t('admin.dash.kpi.alerts')} variant="crit" />
      </div>

      {/* ── Dashboard Grid ── */}
      <div className="admin-dash-grid">
        <BarChart areas={DEMO_AREAS} total={totalVol} t={t} />
        <DonutChart total={totalVol} t={t} />
        <ZoneCoverage zones={DEMO_ZONES} t={t} />
        <SupplyList supplies={DEMO_SUPPLIES} t={t} />
      </div>
    </div>
  );
}
