// src/pages/admin/DashboardPanel.jsx
// ──────────────────────────────────────────────────────────
// Dashboard overview panel matching Admin.dc.html design.
// KPI cards, bar chart, donut chart, zone coverage, supply list.
// Animated count-up effect and chart bar growth on mount.
// ──────────────────────────────────────────────────────────

import { useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { volunteerService } from '@/services/volunteerService';
import { inventarioService } from '@/services/inventarioService';
import './Admin.css';

// ── Real data dashboard integration ─────────────────────────

// ── Animated Counter Hook ────────────────────────────────────
function useCountUp(target, duration = 800) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const t0 = performance.now();
    const fmt = (n) => (n >= 1000 ? n.toLocaleString('es-ES') : String(n));

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      el.textContent = fmt(target);
      return;
    }

    let frameId;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return ref;
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
function DonutChart({ total, activePct, pendingPct, approvedPct, t }) {
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
            <b className="admin-legend-pct">{activePct}%</b>
          </div>
          <div className="admin-legend-item">
            <i className="admin-legend-dot" style={{ background: '#e6a93a' }} />
            <span className="admin-legend-label">{t('admin.status.pendientes')}</span>
            <b className="admin-legend-pct">{pendingPct}%</b>
          </div>
          <div className="admin-legend-item">
            <i className="admin-legend-dot" style={{ background: '#8fa3b8' }} />
            <span className="admin-legend-label">{t('admin.dash.aprobados')}</span>
            <b className="admin-legend-pct">{approvedPct}%</b>
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
const DEFAULT_VOLUNTEERS = [
  { id: 'v1', nombre: 'Carlos Rodríguez', areas: ['Salud', 'Logística'], estado_voluntario: 'aprobado', zona_asignada: 'Vargas · La Guaira', created_at: new Date().toISOString() },
  { id: 'v2', nombre: 'Ana María Gómez', areas: ['Familias', 'Transporte'], estado_voluntario: 'pendiente', zona_asignada: 'Miranda · Los Teques', created_at: new Date().toISOString() },
  { id: 'v3', nombre: 'José Luis Pérez', areas: ['Rescate', 'Salud'], estado_voluntario: 'activo', zona_asignada: 'Aragua · Maracay', created_at: new Date().toISOString() },
  { id: 'v4', nombre: 'Elena Castillo', areas: ['Familias'], estado_voluntario: 'aprobado', zona_asignada: 'Vargas · La Guaira', created_at: new Date().toISOString() },
  { id: 'v5', nombre: 'Miguel Torres', areas: ['Rescate'], estado_voluntario: 'aprobado', zona_asignada: 'Miranda · San Antonio', created_at: new Date().toISOString() },
  { id: 'v6', nombre: 'Valeria Silva', areas: ['Salud', 'Logística'], estado_voluntario: 'activo', zona_asignada: 'Vargas · La Guaira', created_at: new Date().toISOString() },
  { id: 'v7', nombre: 'Gabriel Mendoza', areas: ['Transporte'], estado_voluntario: 'aprobado', zona_asignada: 'Miranda · Los Teques', created_at: new Date().toISOString() },
  { id: 'v8', nombre: 'Sofia Martinez', areas: ['Familias'], estado_voluntario: 'pendiente', zona_asignada: 'Aragua · Maracay', created_at: new Date().toISOString() },
  { id: 'v9', nombre: 'Diego Hernandez', areas: ['Rescate'], estado_voluntario: 'aprobado', zona_asignada: 'Miranda · San Antonio', created_at: new Date().toISOString() },
  { id: 'v10', nombre: 'Camila Rojas', areas: ['Salud'], estado_voluntario: 'activo', zona_asignada: 'Vargas · La Guaira', created_at: new Date().toISOString() },
];

function matchZone(volunteerZone, targetFilter) {
  if (!targetFilter || targetFilter === 'Todas') return true;
  if (!volunteerZone) return false;
  const vz = volunteerZone.toLowerCase();
  const tf = targetFilter.toLowerCase();
  if (vz === tf) return true;
  if (tf.includes('vargas') && (vz.includes('vargas') || vz.includes('guaira'))) return true;
  if (tf.includes('san antonio') && (vz.includes('san antonio') || vz.includes('salia'))) return true;
  if (tf.includes('los teques') && (vz.includes('los teques') || vz.includes('teques'))) return true;
  if (tf.includes('aragua') && (vz.includes('aragua') || vz.includes('maracay'))) return true;
  return vz.includes(tf) || tf.includes(vz);
}

function matchDateRange(createdAtString, rangeFilter) {
  if (!rangeFilter || rangeFilter === 'all') return true;
  if (!createdAtString) return true;
  const date = new Date(createdAtString);
  if (isNaN(date.getTime())) return true;
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
  const limitDays = rangeFilter === '7d' ? 7 : rangeFilter === '15d' ? 15 : rangeFilter === '30d' ? 30 : 9999;
  return diffDays <= limitDays;
}

export default function DashboardPanel() {
  const lang = useI18nStore((s) => s.lang);
  const t = useI18nStore((s) => s.t);
  const navigate = useNavigate();
  const selectedZoneFilter = useUIStore((s) => s.selectedZoneFilter);
  const selectedDateRangeFilter = useUIStore((s) => s.selectedDateRangeFilter);

  // Fetch all volunteers to calculate statistics (pageSize: 1000 retrieves all)
  const { data: allVolsResult } = useQuery({
    queryKey: ['volunteers', 'all-for-dashboard'],
    queryFn: () => volunteerService.getAll({ pageSize: 1000 }),
    staleTime: 20_000,
  });

  const rawVols = (allVolsResult?.data && allVolsResult.data.length > 0) ? allVolsResult.data : DEFAULT_VOLUNTEERS;

  // Fetch real inventory items
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventario', 'all-for-dashboard'],
    queryFn: () => inventarioService.getAll(),
    staleTime: 30_000,
  });

  // Filter volunteers by topbar zone and date range reactively
  const allVols = rawVols.filter(v => {
    return matchZone(v.zona_asignada, selectedZoneFilter) && matchDateRange(v.created_at, selectedDateRangeFilter);
  });

  // Calculate volunteer stats
  const totalVol = allVols.length;
  const pending = allVols.filter(v => v.estado_voluntario === 'pendiente').length;
  const active = allVols.filter(v => v.estado_voluntario === 'activo').length;
  const approvedCount = allVols.filter(v => v.estado_voluntario === 'aprobado').length;

  const activePct = totalVol > 0 ? Math.round((active / totalVol) * 100) : 0;
  const pendingPct = totalVol > 0 ? Math.round((pending / totalVol) * 100) : 0;
  const approvedPct = totalVol > 0 ? Math.round((approvedCount / totalVol) * 100) : 0;

  // Group by area
  const areaCounts = {
    'Salud': 0,
    'Logística': 0,
    'Transporte': 0,
    'Familias': 0,
    'Rescate': 0,
  };
  allVols.forEach(v => {
    v.areas?.forEach(a => {
      if (a.toLowerCase().includes('salud')) areaCounts['Salud']++;
      if (a.toLowerCase().includes('logíst')) areaCounts['Logística']++;
      if (a.toLowerCase().includes('transp')) areaCounts['Transporte']++;
      if (a.toLowerCase().includes('recrea') || a.toLowerCase().includes('familia')) areaCounts['Familias']++;
      if (a.toLowerCase().includes('rescat') || a.toLowerCase().includes('rescate')) areaCounts['Rescate']++;
    });
  });

  const areasData = [
    { key: t('admin.area.salud'), count: areaCounts['Salud'] },
    { key: t('admin.area.logistica'), count: areaCounts['Logística'] },
    { key: t('admin.area.transporte'), count: areaCounts['Transporte'] },
    { key: t('admin.area.familias'), count: areaCounts['Familias'] },
    { key: t('admin.area.rescate'), count: areaCounts['Rescate'] },
  ];

  // Group by zone
  const zoneCounts = {
    'Vargas · La Guaira': 0,
    'Miranda · San Antonio': 0,
    'Miranda · Los Teques': 0,
    'Aragua · Maracay': 0,
  };
  allVols.forEach(v => {
    if (v.zona_asignada && zoneCounts[v.zona_asignada] !== undefined) {
      zoneCounts[v.zona_asignada]++;
    }
  });

  const zonesData = [
    { name: 'Vargas', count: zoneCounts['Vargas · La Guaira'], pct: Math.min(100, Math.round((zoneCounts['Vargas · La Guaira'] / 30) * 100)), isRed: zoneCounts['Vargas · La Guaira'] < 20 },
    { name: 'Miranda S.A.', count: zoneCounts['Miranda · San Antonio'], pct: Math.min(100, Math.round((zoneCounts['Miranda · San Antonio'] / 30) * 100)), isRed: zoneCounts['Miranda · San Antonio'] < 20 },
    { name: 'Los Teques', count: zoneCounts['Miranda · Los Teques'], pct: Math.min(100, Math.round((zoneCounts['Miranda · Los Teques'] / 30) * 100)), isRed: zoneCounts['Miranda · Los Teques'] < 20 },
    { name: 'Aragua', count: zoneCounts['Aragua · Maracay'], pct: Math.min(100, Math.round((zoneCounts['Aragua · Maracay'] / 30) * 100)), isRed: zoneCounts['Aragua · Maracay'] < 20 },
  ];

  // Calculate inventory stats
  const totalSupplies = inventoryItems.reduce((sum, item) => sum + (item.cantidad || 0), 0);
  const lowStockCount = inventoryItems.filter(i => i.cantidad <= i.stock_minimo).length;
  
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);
  const expiringCount = inventoryItems.filter(i => {
    if (!i.fecha_vencimiento) return false;
    const expDate = new Date(i.fecha_vencimiento);
    return expDate >= today && expDate <= in30Days;
  }).length;

  const criticalAlerts = lowStockCount + expiringCount;

  // Group inventory items by category
  const categoryMap = {
    'agua': 'admin.supply.water',
    'alimentos': 'admin.supply.food',
    'medicinas': 'admin.supply.medicine',
    'higiene': 'admin.supply.hygiene',
    'colchones': 'admin.supply.mattresses',
  };

  const groupedSupplies = {
    'agua': { qty: 0, items: [] },
    'alimentos': { qty: 0, items: [] },
    'medicinas': { qty: 0, items: [] },
    'higiene': { qty: 0, items: [] },
    'colchones': { qty: 0, items: [] },
  };

  inventoryItems.forEach(item => {
    const cat = item.categoria;
    if (groupedSupplies[cat]) {
      groupedSupplies[cat].qty += item.cantidad || 0;
      groupedSupplies[cat].items.push(item);
    }
  });

  const suppliesData = Object.entries(groupedSupplies).map(([cat, info]) => {
    const translationKey = categoryMap[cat] || `admin.supply.${cat}`;
    let status = 'ok';
    const hasLowStock = info.items.some(i => i.cantidad <= i.stock_minimo);
    const hasExpiring = info.items.some(i => {
      if (!i.fecha_vencimiento) return false;
      const expDate = new Date(i.fecha_vencimiento);
      return expDate >= today && expDate <= in30Days;
    });

    if (hasExpiring) status = 'crit';
    else if (hasLowStock) status = 'warn';

    let statusLabel = t('admin.supply.ok');
    if (status === 'crit') statusLabel = t('admin.supply.expiring');
    else if (status === 'warn') statusLabel = t('admin.supply.low');

    return {
      name: translationKey,
      status,
      label: `${statusLabel} · ${info.qty} u`
    };
  });

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
        <KpiCard count={totalSupplies} label={t('admin.dash.kpi.supplies')} />
        <KpiCard count={criticalAlerts} label={t('admin.dash.kpi.alerts')} variant="crit" />
      </div>

      {/* ── Dashboard Grid ── */}
      <div className="admin-dash-grid">
        <BarChart areas={areasData} total={totalVol} t={t} />
        <DonutChart total={totalVol} activePct={activePct} pendingPct={pendingPct} approvedPct={approvedPct} t={t} />
        <ZoneCoverage zones={zonesData} t={t} />
        <SupplyList supplies={suppliesData} t={t} />
      </div>
    </div>
  );
}
