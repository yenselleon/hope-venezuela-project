// src/pages/admin/InventarioPanel.jsx
// Módulo de Inventario de Insumos (Stock, Bitácora de Auditoría, y Analítica de Gráficos SVG).
// Conexión real con Supabase y reactividad mediante TanStack Query.
// Incluye cajón lateral para alta rápida e ingreso de movimientos.

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { inventarioService } from '@/services/inventarioService';
import './Admin.css';

const CATEGORIAS = [
  { value: 'agua', labelKey: 'admin.supply.water' },
  { value: 'alimentos', labelKey: 'admin.supply.food' },
  { value: 'medicinas', labelKey: 'admin.supply.medicine' },
  { value: 'higiene', labelKey: 'admin.supply.hygiene' },
  { value: 'colchones', labelKey: 'admin.supply.mattresses' },
];

export default function InventarioPanel() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const showToast = useUIStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movs' | 'charts'
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [alertFilter, setAlertFilter] = useState('Todas'); // 'Todas' | 'bajo' | 'vence'
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer / Form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState('item'); // 'item' | 'movement'
  
  // New Item State
  const [newItem, setNewItem] = useState({
    nombre: '',
    categoria: 'agua',
    unidad: 'unidades',
    cantidad: 0,
    stock_minimo: 10,
    fecha_vencimiento: '',
  });

  // New Movement State
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newMovement, setNewMovement] = useState({
    tipo: 'entrada',
    cantidad: '',
    concepto: '',
  });

  // 1. Fetch stock items
  const { data: stockItems = [], isLoading: loadingStock } = useQuery({
    queryKey: ['inventario', { categoria: categoryFilter, alert: alertFilter, search: searchQuery }],
    queryFn: () => inventarioService.getAll({
      categoria: categoryFilter === 'Todas' ? null : categoryFilter,
      alert: alertFilter === 'Todas' ? null : alertFilter,
      search: searchQuery || null,
    }),
    staleTime: 15_000,
  });

  // 2. Fetch movements
  const { data: movements = [], isLoading: loadingMovs } = useQuery({
    queryKey: ['inventario-movimientos'],
    queryFn: inventarioService.getMovements,
    enabled: activeTab === 'movs' || activeTab === 'charts',
    staleTime: 20_000,
  });

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: (item) => inventarioService.create(item),
    onSuccess: () => {
      showToast(t('admin.supply.success'));
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      setIsDrawerOpen(false);
      resetNewItemForm();
    },
    onError: (err) => {
      showToast(err.message);
    },
  });

  const movementMutation = useMutation({
    mutationFn: (move) => inventarioService.registerMovement(move),
    onSuccess: () => {
      showToast(t('admin.supply.toast.moved'));
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      queryClient.invalidateQueries({ queryKey: ['inventario-movimientos'] });
      setIsDrawerOpen(false);
      resetMovementForm();
    },
    onError: (err) => {
      showToast(err.message);
    },
  });

  // Helper selectors
  const resetNewItemForm = () => {
    setNewItem({
      nombre: '',
      categoria: 'agua',
      unidad: 'unidades',
      cantidad: 0,
      stock_minimo: 10,
      fecha_vencimiento: '',
    });
  };

  const resetMovementForm = () => {
    setSelectedItemId('');
    setNewMovement({
      tipo: 'entrada',
      cantidad: '',
      concepto: '',
    });
  };

  const handleCreateItemSubmit = (e) => {
    e.preventDefault();
    if (!newItem.nombre.trim()) return;
    createItemMutation.mutate(newItem);
  };

  const handleMovementSubmit = (e) => {
    e.preventDefault();
    if (!selectedItemId || !newMovement.cantidad || parseInt(newMovement.cantidad, 10) <= 0) return;
    movementMutation.mutate({
      inventario_id: selectedItemId,
      tipo: newMovement.tipo,
      cantidad: newMovement.cantidad,
      concepto: newMovement.concepto,
      usuario_email: user?.email || 'coordinador@ready.set.go',
    });
  };

  // Critical indicators
  const kpis = useMemo(() => {
    let lowStock = 0;
    let soonExpired = 0;
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    stockItems.forEach(i => {
      if (i.cantidad <= i.stock_minimo) lowStock++;
      if (i.fecha_vencimiento) {
        const d = new Date(i.fecha_vencimiento);
        if (d >= today && d <= in30Days) soonExpired++;
      }
    });

    return { lowStock, soonExpired, totalItems: stockItems.length };
  }, [stockItems]);

  // SVG Chart data
  const chartData = useMemo(() => {
    const categoriesCounts = { agua: 0, alimentos: 0, medicinas: 0, higiene: 0, colchones: 0 };
    stockItems.forEach(i => {
      if (categoriesCounts[i.categoria] !== undefined) {
        categoriesCounts[i.categoria] += i.cantidad;
      }
    });
    const total = Object.values(categoriesCounts).reduce((acc, curr) => acc + curr, 0) || 1;
    return Object.keys(categoriesCounts).map(key => ({
      key,
      count: categoriesCounts[key],
      pct: Math.round((categoriesCounts[key] / total) * 100),
    }));
  }, [stockItems]);

  return (
    <div className="admin-panel animate-[fade_0.2s_ease]" style={{ minHeight: 'calc(100vh - 84px)' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <span className="admin-nav-phase uppercase font-bold text-[10.5px] tracking-wider text-wine">
            {t('admin.nav.inventario')}
          </span>
          <p className="admin-apr-desc margin-0 mt-1">
            {t('admin.supply.desc')}
          </p>
        </div>

        {/* Buttons to open Quick Input Drawer */}
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              setFormMode('item');
              setIsDrawerOpen(true);
            }}
            className="admin-btn admin-btn-soft sm font-bold cursor-pointer"
          >
            + {t('admin.supply.add')}
          </button>
          <button
            onClick={() => {
              setFormMode('movement');
              setIsDrawerOpen(true);
            }}
            className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
          >
            ⇄ {t('admin.supply.registerMovement')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#eef1f4] mb-5.5 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 font-bold text-xs cursor-pointer ${
            activeTab === 'stock'
              ? 'text-navy border-b-2 border-navy'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          {t('admin.supply.tab.stock')}
        </button>
        <button
          onClick={() => setActiveTab('movs')}
          className={`pb-3 font-bold text-xs cursor-pointer ${
            activeTab === 'movs'
              ? 'text-navy border-b-2 border-navy'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          {t('admin.supply.tab.movements')}
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`pb-3 font-bold text-xs cursor-pointer ${
            activeTab === 'charts'
              ? 'text-navy border-b-2 border-navy'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          {t('admin.supply.tab.analytics')}
        </button>
      </div>

      {/* ── STOCK TAB ── */}
      {activeTab === 'stock' && (
        <div className="flex flex-col gap-6">
          {/* Alertas KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#efe7d8] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#eef3fb] flex items-center justify-center text-navy font-bold">
                📦
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8fa3b8] uppercase tracking-wider block">
                  {lang === 'es' ? 'Ítems registrados' : 'Total Items'}
                </span>
                <span className="text-xl font-extrabold text-text-primary mt-0.5 block">
                  {kpis.totalItems}
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#efe7d8] rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                kpis.lowStock > 0 ? 'bg-[#fbdedb] text-[#b02a24]' : 'bg-[#eef3fb] text-[#8fa3b8]'
              }`}>
                ⚠️
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8fa3b8] uppercase tracking-wider block">
                  {t('admin.supply.alert.understocked')}
                </span>
                <span className={`text-xl font-extrabold mt-0.5 block ${kpis.lowStock > 0 ? 'text-[#b02a24]' : 'text-text-primary'}`}>
                  {kpis.lowStock}
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#efe7d8] rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                kpis.soonExpired > 0 ? 'bg-[#fdecc8] text-[#8a5a12]' : 'bg-[#eef3fb] text-[#8fa3b8]'
              }`}>
                📅
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8fa3b8] uppercase tracking-wider block">
                  {t('admin.supply.alert.expiring')}
                </span>
                <span className={`text-xl font-extrabold mt-0.5 block ${kpis.soonExpired > 0 ? 'text-[#8a5a12]' : 'text-text-primary'}`}>
                  {kpis.soonExpired}
                </span>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="bg-white border border-[#efe7d8] rounded-2xl p-4.5 flex flex-wrap gap-4 items-center">
            <div className="admin-top-search relative max-w-[280px] w-full" style={{ border: '1px solid #e7eaef', borderRadius: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3a9b3" strokeWidth="2" className="absolute left-3.5 top-[13px]">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder={lang === 'es' ? 'Buscar insumo…' : 'Search supplies…'}
                className="fld outline-none border-0"
                style={{ paddingLeft: 38, height: 38 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="fld sm cursor-pointer bg-white"
              style={{ width: 'auto', minWidth: 150, height: 38 }}
            >
              <option value="Todas">{lang === 'es' ? 'Todas las categorías' : 'All Categories'}</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {t(cat.labelKey)}
                </option>
              ))}
            </select>

            {/* Quick Alerts Toggles */}
            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              className="fld sm cursor-pointer bg-white"
              style={{ width: 'auto', minWidth: 150, height: 38 }}
            >
              <option value="Todas">{lang === 'es' ? 'Todos los niveles' : 'All Levels'}</option>
              <option value="bajo">{t('admin.supply.alert.understocked')}</option>
              <option value="vence">{t('admin.supply.alert.expiring')}</option>
            </select>
          </div>

          {/* Inventory Catalog Table */}
          <div className="bg-white border border-[#efe7d8] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="admin-table-head w-full text-left border-collapse" style={{ display: 'table' }}>
                <thead>
                  <tr className="border-b border-[#eef1f4] bg-[#fafbfc]">
                    <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">{t('admin.supply.itemName')}</th>
                    <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">{t('admin.supply.category')}</th>
                    <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">{t('admin.supply.movement.qty')}</th>
                    <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">{t('admin.supply.minStock')}</th>
                    <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">{t('admin.supply.expDate')}</th>
                    <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider text-right">{t('admin.table.estado')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStock ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center">
                        <div className="flex justify-center gap-1.5 py-8">
                          <div className="w-5 h-5 rounded-full border-2 border-navy border-t-transparent animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : stockItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-xs text-text-tertiary">
                        {t('admin.supply.table.empty')}
                      </td>
                    </tr>
                  ) : (
                    stockItems.map((item) => {
                      const isLow = item.cantidad <= item.stock_minimo;
                      const hasExpiry = !!item.fecha_vencimiento;
                      
                      // Calculate if expires soon (< 30 days)
                      let isExpiring = false;
                      if (hasExpiry) {
                        const today = new Date();
                        const in30 = new Date();
                        in30.setDate(today.getDate() + 30);
                        isExpiring = new Date(item.fecha_vencimiento) <= in30;
                      }

                      return (
                        <tr key={item.id} className="border-b border-[#eef1f4] hover:bg-[#fafbfc] transition-colors text-xs font-semibold">
                          <td className="p-4 text-text-primary font-bold">{item.nombre}</td>
                          <td className="p-4 text-text-secondary">
                            {t(CATEGORIAS.find(c => c.value === item.categoria)?.labelKey || 'admin.nav.inventario')}
                          </td>
                          <td className="p-4 text-text-primary">
                            <span className="font-extrabold">{item.cantidad}</span>{' '}
                            <span className="text-[10px] text-text-tertiary">{item.unidad}</span>
                          </td>
                          <td className="p-4 text-text-secondary">{item.stock_minimo}</td>
                          <td className="p-4 text-text-secondary">
                            {item.fecha_vencimiento 
                              ? new Date(item.fecha_vencimiento).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US') 
                              : '—'
                            }
                          </td>
                          <td className="p-4 text-right">
                            {isLow ? (
                              <span className="admin-pill admin-pill-crit">{t('admin.supply.alert.understocked')}</span>
                            ) : isExpiring ? (
                              <span className="admin-pill admin-pill-warn">{t('admin.supply.alert.expiring')}</span>
                            ) : (
                              <span className="admin-pill admin-pill-ok">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOG TAB ── */}
      {activeTab === 'movs' && (
        <div className="bg-white border border-[#efe7d8] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4.5 border-b border-[#eef1f4] bg-[#fafbfc]">
            <h3 className="margin-0 font-bold text-xs text-navy uppercase tracking-wider">
              {t('admin.supply.recentLogs')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table-head w-full text-left border-collapse" style={{ display: 'table' }}>
              <thead>
                <tr className="border-b border-[#eef1f4] bg-[#fafbfc]">
                  <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">{t('admin.supply.itemName')}</th>
                  <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">{t('admin.supply.movement.type')}</th>
                  <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">{t('admin.supply.movement.qty')}</th>
                  <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">{t('admin.supply.movement.concepto')}</th>
                  <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider">Coordinador</th>
                  <th className="p-4 text-xs font-bold text-navy uppercase tracking-wider text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loadingMovs ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">
                      <div className="flex justify-center py-8">
                        <div className="w-5 h-5 rounded-full border-2 border-navy border-t-transparent animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-xs text-text-tertiary">
                      {t('admin.supply.movs.empty')}
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => {
                    const isEntry = mov.tipo === 'entrada';
                    return (
                      <tr key={mov.id} className="border-b border-[#eef1f4] hover:bg-[#fafbfc] transition-colors text-xs font-semibold">
                        <td className="p-4 text-text-primary font-bold">
                          {mov.inventario?.nombre || 'Insumo eliminado'}
                        </td>
                        <td className="p-4">
                          <span className={`admin-pill font-bold ${isEntry ? 'admin-pill-ok' : 'admin-pill-crit'}`}>
                            {isEntry ? t('admin.supply.movement.entry') : t('admin.supply.movement.exit')}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-text-primary">
                          {isEntry ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                        </td>
                        <td className="p-4 text-text-secondary truncate max-w-[180px]" title={mov.concepto}>
                          {mov.concepto || '—'}
                        </td>
                        <td className="p-4 text-text-secondary truncate max-w-[150px]">{mov.usuario_email}</td>
                        <td className="p-4 text-text-tertiary text-right">
                          {new Date(mov.created_at).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB (SVG Charts) ── */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
          {/* Distribution by category */}
          <div className="bg-white border border-[#efe7d8] rounded-2xl p-5.5 flex flex-col shadow-sm">
            <h3 className="margin-0 font-bold text-xs text-navy uppercase tracking-wider mb-4">
              {t('admin.supply.analytics.byCategory')}
            </h3>

            <div className="flex flex-col gap-4">
              {chartData.map((item) => (
                <div key={item.key} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-primary">
                      {t(CATEGORIAS.find(c => c.value === item.key)?.labelKey || 'admin.nav.inventario')}
                    </span>
                    <span className="text-navy">{item.count} u ({item.pct}%)</span>
                  </div>
                  {/* SVG Bar Chart Meter */}
                  <div className="w-full h-2 rounded-full bg-[#f3f4f6] overflow-hidden relative">
                    <div
                      className="h-full bg-navy rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock alerts visualization */}
          <div className="bg-white border border-[#efe7d8] rounded-2xl p-5.5 flex flex-col shadow-sm">
            <h3 className="margin-0 font-bold text-xs text-navy uppercase tracking-wider mb-4">
              {t('admin.supply.analytics.lowStock')}
            </h3>

            <div className="flex-grow flex flex-col gap-3 max-h-[310px] overflow-y-auto pr-1">
              {stockItems.filter(i => i.cantidad <= i.stock_minimo).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#fdf2f1] border border-[#fbd4d0] rounded-xl flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <b className="block text-xs font-extrabold text-[#b02a24] truncate">{item.nombre}</b>
                    <span className="block text-[10.5px] text-[#cf4a43] mt-0.5">
                      {lang === 'es' ? 'Stock crítico:' : 'Critical stock:'} {item.cantidad} u / Min: {item.stock_minimo} u
                    </span>
                  </div>
                  <span className="bg-[#cf4a43] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {lang === 'es' ? 'Bajo' : 'Low'}
                  </span>
                </div>
              ))}
              {stockItems.filter(i => i.cantidad <= i.stock_minimo).length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#dcf0e3] text-[#22633f] flex items-center justify-center text-sm mb-2.5">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-text-secondary">
                    {lang === 'es' ? '¡Todo al día! No hay stock bajo.' : 'All good! No low stock.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK INPUT / MOVEMENT DRAWER OVERLAY ── */}
      {isDrawerOpen && (
        <div className="admin-mobile-menu-overlay" onClick={() => setIsDrawerOpen(false)} style={{ zIndex: 60 }}>
          <div
            className="admin-mobile-menu-sheet max-w-[420px] mx-auto rounded-t-2xl lg:rounded-2xl lg:mb-auto lg:mt-24 lg:border lg:border-[#efe7d8] lg:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-mobile-menu-header">
              <b>{formMode === 'item' ? t('admin.supply.add') : t('admin.supply.registerMovement')}</b>
              <button className="admin-mobile-menu-close" onClick={() => setIsDrawerOpen(false)}>✕</button>
            </div>

            <div className="admin-mobile-menu-body p-6.5">
              {/* Form 1: Add new Catalog Item */}
              {formMode === 'item' ? (
                <form onSubmit={handleCreateItemSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      {t('admin.supply.itemName')} <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pañales desechables G"
                      className="fld bg-[#faf9f6]"
                      value={newItem.nombre}
                      onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                        {t('admin.supply.category')}
                      </label>
                      <select
                        className="fld bg-[#faf9f6] cursor-pointer"
                        value={newItem.categoria}
                        onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                      >
                        {CATEGORIAS.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {t(cat.labelKey)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                        {t('admin.supply.unit')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. unidades"
                        className="fld bg-[#faf9f6]"
                        value={newItem.unidad}
                        onChange={(e) => setNewItem({ ...newItem, unidad: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                        Stock Inicial
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        className="fld bg-[#faf9f6]"
                        value={newItem.cantidad}
                        onChange={(e) => setNewItem({ ...newItem, cantidad: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                        {t('admin.supply.minStock')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        className="fld bg-[#faf9f6]"
                        value={newItem.stock_minimo}
                        onChange={(e) => setNewItem({ ...newItem, stock_minimo: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      {t('admin.supply.expDate')} <span className="font-semibold text-text-tertiary">(opcional)</span>
                    </label>
                    <input
                      type="date"
                      className="fld bg-[#faf9f6] cursor-pointer"
                      value={newItem.fecha_vencimiento}
                      onChange={(e) => setNewItem({ ...newItem, fecha_vencimiento: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 justify-end mt-3">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="admin-btn admin-btn-soft sm font-bold cursor-pointer"
                    >
                      {t('admin.assign.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={createItemMutation.isPending}
                      className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
                    >
                      {createItemMutation.isPending ? t('admin.supply.saving') : t('admin.assign.save')}
                    </button>
                  </div>
                </form>
              ) : (
                // Form 2: Register Movement
                <form onSubmit={handleMovementSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Seleccionar Insumo <span className="req">*</span>
                    </label>
                    <select
                      required
                      className="fld bg-[#faf9f6] cursor-pointer"
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                    >
                      <option value="">Selecciona un insumo...</option>
                      {stockItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} ({item.cantidad} u)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                        {t('admin.supply.movement.type')}
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewMovement({ ...newMovement, tipo: 'entrada' })}
                          className={`flex-1 h-10 text-xs font-bold border rounded-lg cursor-pointer transition-colors ${
                            newMovement.tipo === 'entrada'
                              ? 'bg-[#dcf0e3] border-[#22633f] text-[#22633f]'
                              : 'bg-white border-[#e7eaef] text-text-secondary'
                          }`}
                        >
                          {t('admin.supply.movement.entry')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMovement({ ...newMovement, tipo: 'salida' })}
                          className={`flex-1 h-10 text-xs font-bold border rounded-lg cursor-pointer transition-colors ${
                            newMovement.tipo === 'salida'
                              ? 'bg-[#fbdedb] border-[#b02a24] text-[#b02a24]'
                              : 'bg-white border-[#e7eaef] text-text-secondary'
                          }`}
                        >
                          {t('admin.supply.movement.exit')}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                        {t('admin.supply.movement.qty')} <span className="req">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Mínimo 1"
                        className="fld bg-[#faf9f6]"
                        value={newMovement.cantidad}
                        onChange={(e) => setNewMovement({ ...newMovement, cantidad: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      {t('admin.supply.movement.concepto')}
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Donación de lote / Distribución Vargas"
                      className="fld bg-[#faf9f6]"
                      value={newMovement.concepto}
                      onChange={(e) => setNewMovement({ ...newMovement, concepto: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 justify-end mt-3">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="admin-btn admin-btn-soft sm font-bold cursor-pointer"
                    >
                      {t('admin.assign.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={movementMutation.isPending}
                      className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
                    >
                      {movementMutation.isPending ? t('admin.supply.saving') : t('admin.assign.save')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
