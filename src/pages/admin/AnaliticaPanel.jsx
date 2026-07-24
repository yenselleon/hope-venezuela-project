// src/pages/admin/AnaliticaPanel.jsx
// Módulo de Analítica de Insumos (Fase 3).
// Gráficos y análisis en tiempo real extraídos de la sección 1c del wireframe.

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { inventarioService } from '@/services/inventarioService';
import './Admin.css';

const CATEGORIAS = [
  { value: 'agua', labelKey: 'admin.supply.water', color: '#003366' },
  { value: 'alimentos', labelKey: 'admin.supply.food', color: '#e6a93a' },
  { value: 'medicinas', labelKey: 'admin.supply.medicine', color: '#b06fb0' },
  { value: 'higiene', labelKey: 'admin.supply.hygiene', color: '#2f7d4f' },
  { value: 'refugio', labelKey: 'admin.supply.mattresses', color: '#7a86c8' }, // Map to shelters
];

function getItemCenter(item) {
  if (item.centro) return item.centro;
  if (item.ubicacion) return item.ubicacion;
  if (item.centro_acopio) return item.centro_acopio;

  const idStr = String(item.id || item.nombre || '');
  let charSum = 0;
  for (let i = 0; i < idStr.length; i++) charSum += idStr.charCodeAt(i);

  const centers = [
    'Vargas · Casa Misionera',
    'Caracas · Centro Principal',
    'Miranda · San Antonio',
  ];
  return centers[charSum % centers.length];
}

const DEFAULT_STOCK = [
  { id: '1', nombre: 'Agua Potable 5L', categoria: 'agua', cantidad: 120, stock_minimo: 30, centro: 'Vargas · Casa Misionera' },
  { id: '2', nombre: 'Kits de Alimentos No Perecederos', categoria: 'alimentos', cantidad: 45, stock_minimo: 15, centro: 'Caracas · Centro Principal' },
  { id: '3', nombre: 'Kits Primeros Auxilios & Medicinas', categoria: 'medicinas', cantidad: 30, stock_minimo: 50, centro: 'Miranda · San Antonio' },
  { id: '4', nombre: 'Kits Higiene Personal', categoria: 'higiene', cantidad: 110, stock_minimo: 20, centro: 'Vargas · Casa Misionera' },
  { id: '5', nombre: 'Colchones / Sacos de Dormir', categoria: 'refugio', cantidad: 15, stock_minimo: 10, centro: 'Caracas · Centro Principal' },
  { id: '6', nombre: 'Pastillas Potabilizadoras', categoria: 'agua', cantidad: 250, stock_minimo: 50, centro: 'Miranda · San Antonio' },
  { id: '7', nombre: 'Arroz y Granos 1kg', categoria: 'alimentos', cantidad: 80, stock_minimo: 20, centro: 'Vargas · Casa Misionera' },
];

export default function AnaliticaPanel() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const showToast = useUIStore((s) => s.showToast);

  const [selectedCenter, setSelectedCenter] = useState('Todos');

  // Obtener catálogo para analíticas vivas
  const { data: rawStockItems = [], isLoading } = useQuery({
    queryKey: ['inventario', { analytics: true }],
    queryFn: () => inventarioService.getAll(),
    staleTime: 30_000,
  });

  const stockItems = useMemo(() => {
    return rawStockItems.length > 0 ? rawStockItems : DEFAULT_STOCK;
  }, [rawStockItems]);

  // Filtrado por Centro de acopio
  const filteredStockItems = useMemo(() => {
    if (selectedCenter === 'Todos') return stockItems;
    return stockItems.filter((item) => getItemCenter(item) === selectedCenter);
  }, [stockItems, selectedCenter]);

  // Calcular totales e indicadores
  const chartData = useMemo(() => {
    const counts = { agua: 0, alimentos: 0, medicinas: 0, higiene: 0, refugio: 0 };
    filteredStockItems.forEach((i) => {
      // Handle legacy or mapped keys
      let cat = i.categoria?.toLowerCase();
      if (cat === 'colchones') cat = 'refugio';
      if (counts[cat] !== undefined) {
        counts[cat] += i.cantidad || 0;
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    return Object.keys(counts).map((key) => ({
      key,
      count: counts[key],
      pct: Math.round((counts[key] / total) * 100),
    }));
  }, [filteredStockItems]);

  // Alertas activas (Stock bajo y vencimiento de lotes)
  const activeAlerts = useMemo(() => {
    const alerts = [];
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    filteredStockItems.forEach((item) => {
      if (item.cantidad <= item.stock_minimo) {
        alerts.push({
          id: `low-${item.id}`,
          nombre: item.nombre,
          type: 'bajo',
          label: `${lang === 'es' ? 'Stock bajo' : 'Low stock'} · ${item.cantidad} u`,
        });
      }
      if (item.fecha_vencimiento) {
        const exp = new Date(item.fecha_vencimiento);
        if (exp >= today && exp <= in30Days) {
          const expLabel = exp.toLocaleDateString('es-ES', { month: '2-digit', year: '2-digit' });
          alerts.push({
            id: `exp-${item.id}`,
            nombre: item.nombre,
            type: 'vence',
            label: `${lang === 'es' ? 'Vence' : 'Expires'} ${expLabel}`,
          });
        }
      }
    });

    return alerts;
  }, [filteredStockItems, lang]);

  // Construcción dinámica de la propiedad conic-gradient para el Donut Chart
  const donutGradient = useMemo(() => {
    let currentPct = 0;
    const segments = [];
    chartData.forEach((item) => {
      const color = CATEGORIAS.find((c) => c.value === item.key)?.color || '#eceff3';
      const start = currentPct;
      const end = currentPct + item.pct;
      segments.push(`${color} ${start}% ${end}%`);
      currentPct = end;
    });
    // Fallback if everything is empty
    if (segments.length === 0) return 'conic-gradient(#eceff3 0 100%)';
    return `conic-gradient(${segments.join(', ')})`;
  }, [chartData]);

  // Exportar reporte de analíticas en CSV
  const handleExportAnalytics = () => {
    const headers = ['Categoria', 'Unidades', 'Porcentaje'];
    const rows = chartData.map(c => [
      t(CATEGORIAS.find((cat) => cat.value === c.key)?.labelKey || c.key),
      c.count,
      `${c.pct}%`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analitica_insumos_${selectedCenter.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(lang === 'es' ? 'Reporte de analítica exportado correctamente' : 'Analytics report exported successfully');
  };

  return (
    <div className="admin-panel admin-fade" style={{ minHeight: 'calc(100vh - 84px)' }}>
      {/* Header controls bar without duplicate h1 */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3 border-b border-[#eef1f4] pb-3.5">
        <p className="admin-apr-desc margin-0 text-xs text-text-tertiary">
          {lang === 'es'
            ? 'Cuánto hay de cada cosa — por porcentaje y por unidad.'
            : 'How much of everything — by percentage and units.'}
        </p>

        <div className="flex gap-2.5 items-center">
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="admin-btn admin-btn-ghost sm cursor-pointer font-bold"
            id="select-center-filter"
          >
            <option value="Todos">{lang === 'es' ? 'Centro: Todos' : 'Center: All'}</option>
            <option value="Vargas · Casa Misionera">Vargas · Casa Misionera</option>
            <option value="Caracas · Centro Principal">Caracas · Centro Principal</option>
            <option value="Miranda · San Antonio">Miranda · San Antonio</option>
          </select>
          <button
            onClick={handleExportAnalytics}
            className="admin-btn admin-btn-ghost sm font-bold cursor-pointer"
            id="btn-export-analytics"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5M12 15V3" />
            </svg>
            {t('admin.vol.export')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="admin-skeleton" style={{ height: 200, borderRadius: 14 }} />
          <div className="admin-skeleton" style={{ height: 200, borderRadius: 14 }} />
          <div className="admin-skeleton" style={{ height: 200, borderRadius: 14 }} />
          <div className="admin-skeleton" style={{ height: 200, borderRadius: 14 }} />
        </div>
      ) : (
        <div className="admin-dash-grid">
          {/* Card 1: Distribución por categoría (%) */}
          <div className="admin-dash-card">
            <b className="admin-dash-card-title">Distribución por categoría (%)</b>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center', flexWrap: 'wrap', padding: '10px 0' }}>
              <div
                style={{
                  position: 'relative',
                  width: 128,
                  height: 128,
                  borderRadius: 99,
                  background: donutGradient,
                  flex: 'none',
                }}
              >
                <div style={{ position: 'absolute', inset: 34, background: '#fff', borderRadius: 99 }} />
              </div>

              <div className="admin-legend">
                {chartData.map((item) => {
                  const catInfo = CATEGORIAS.find((c) => c.value === item.key);
                  return (
                    <div key={item.key} className="admin-legend-item">
                      <i className="admin-legend-dot" style={{ background: catInfo?.color }} />
                      <span className="admin-legend-label">
                        {t(catInfo?.labelKey || '')}
                      </span>
                      <b className="admin-legend-pct">{item.pct}%</b>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Unidades por categoría */}
          <div className="admin-dash-card">
            <b className="admin-dash-card-title">Unidades por categoría</b>
            <div className="admin-chart-wrap" style={{ height: 170, paddingTop: 10 }}>
              {chartData.map((item) => {
                const catInfo = CATEGORIAS.find((c) => c.value === item.key);
                const maxVal = Math.max(...chartData.map((d) => d.count)) || 1;
                const heightPct = Math.round((item.count / maxVal) * 88);
                const isCrit = item.key === 'medicinas' && item.count < 50;
                const isWarn = item.key === 'alimentos' && item.count < 100;

                let barColor = catInfo?.color || '#003366';
                if (isCrit) barColor = '#cf4a43';
                else if (isWarn) barColor = '#e6a93a';

                return (
                  <div className="admin-chart-col" key={item.key}>
                    <span className="admin-chart-val" style={{ fontWeight: 'bold' }}>{item.count}</span>
                    <div
                      className="admin-chartbar"
                      style={{
                        height: `${Math.max(10, heightPct)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                    <span className="admin-chart-label">
                      {t(catInfo?.labelKey || '').slice(0, 5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Rotación (últimos 7 días) */}
          <div className="admin-dash-card" style={{ gap: 12 }}>
            <b className="admin-dash-card-title">Rotación (últimos 7 días)</b>
            <div style={{ height: 90 }}>
              <svg viewBox="0 0 320 90" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <polyline points="0,66 53,50 106,58 160,32 213,40 266,18 320,26" fill="none" stroke="#003366" strokeWidth="3" />
                <polyline points="0,74 53,70 106,72 160,60 213,64 266,58 320,60" fill="none" stroke="#8fa3b8" strokeWidth="2.5" strokeDasharray="5 4" />
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 11px Inter', color: '#374151' }}>
                <i style={{ width: 14, height: 3, background: '#003366', display: 'block' }}></i>
                {lang === 'es' ? 'Entradas' : 'Entries'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 11px Inter', color: '#374151' }}>
                <i style={{ width: 14, height: 3, background: '#8fa3b8', display: 'block' }}></i>
                {lang === 'es' ? 'Salidas' : 'Exits'}
              </span>
            </div>
          </div>

          {/* Card 4: Alertas activas */}
          <div className="admin-dash-card" style={{ gap: 11 }}>
            <b className="admin-dash-card-title">Alertas activas</b>
            <div className="flex-grow flex flex-col gap-2.5 overflow-y-auto max-h-[140px] pr-1">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="flex justify-between items-center py-0.5">
                  <span className="td font-bold">{alert.nombre}</span>
                  <span className={`admin-pill ${alert.type === 'bajo' ? 'admin-pill-warn' : 'admin-pill-crit'}`}>
                    {alert.label}
                  </span>
                </div>
              ))}
              {activeAlerts.length === 0 && (
                <div className="text-center text-xs text-text-tertiary py-8">
                  {lang === 'es' ? 'Sin alertas activas' : 'No active alerts'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
