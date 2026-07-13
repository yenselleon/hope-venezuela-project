// src/pages/admin/InventarioPanel.jsx
// Módulo de Inventario de Insumos y Suministros (Fase 3).
// Conexión real con Supabase + inline editing + diseño exacto de Claude Design.

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { inventarioService } from '@/services/inventarioService';
import './Admin.css';

const CATEGORIAS = [
  { value: 'agua', labelKey: 'admin.supply.water', color: '#003366' },
  { value: 'alimentos', labelKey: 'admin.supply.food', color: '#e6a93a' },
  { value: 'medicinas', labelKey: 'admin.supply.medicine', color: '#b06fb0' },
  { value: 'higiene', labelKey: 'admin.supply.hygiene', color: '#2f7d4f' },
  { value: 'refugio', labelKey: 'admin.supply.mattresses', color: '#7a86c8' }, // Map mattresses to shelter
];

export default function InventarioPanel() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const showToast = useUIStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movs'
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [alertFilter, setAlertFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Cajón Lateral / Modal Overlay
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState('item'); // 'item' | 'movement'

  // Inline Editing Quantity state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingQty, setEditingQty] = useState('');

  // Formulario nuevo ítem
  const [newItem, setNewItem] = useState({
    nombre: '',
    categoria: 'agua',
    unidad: 'u',
    cantidad: 0,
    stock_minimo: 10,
    lote: '',
    fecha_vencimiento: '',
  });

  // Formulario nuevo movimiento
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newMovement, setNewMovement] = useState({
    tipo: 'entrada',
    cantidad: '',
    concepto: '',
  });

  // 1. Obtener catálogo
  const { data: stockItems = [], isLoading: loadingStock } = useQuery({
    queryKey: ['inventario', { categoria: categoryFilter, alert: alertFilter, search: searchQuery }],
    queryFn: () => inventarioService.getAll({
      categoria: categoryFilter === 'Todas' ? null : categoryFilter,
      alert: alertFilter === 'Todas' ? null : alertFilter,
      search: searchQuery || null,
    }),
    staleTime: 15_000,
  });

  // 2. Obtener bitácora de auditoría
  const { data: movements = [], isLoading: loadingMovs } = useQuery({
    queryKey: ['inventario-movimientos'],
    queryFn: inventarioService.getMovements,
    enabled: activeTab === 'movs',
    staleTime: 20_000,
  });

  // Mutaciones
  const createItemMutation = useMutation({
    mutationFn: (item) => inventarioService.create(item),
    onSuccess: () => {
      showToast(t('admin.supply.success'));
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      setIsDrawerOpen(false);
      resetNewItemForm();
    },
    onError: (err) => showToast(err.message),
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
    onError: (err) => showToast(err.message),
  });

  const resetNewItemForm = () => {
    setNewItem({
      nombre: '',
      categoria: 'agua',
      unidad: 'u',
      cantidad: 0,
      stock_minimo: 10,
      lote: '',
      fecha_vencimiento: '',
    });
  };

  const resetMovementForm = () => {
    setSelectedItemId('');
    setNewMovement({ tipo: 'entrada', cantidad: '', concepto: '' });
  };

  // Submit catalog creation
  const handleCreateItemSubmit = (e) => {
    e.preventDefault();
    if (!newItem.nombre.trim()) return;
    createItemMutation.mutate({
      ...newItem,
      lote: newItem.lote.trim() || undefined,
    });
  };

  // Submit manual log movement
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

  // Inline adjustment click-save logic
  const handleInlineQtyBlur = (item, eventValue) => {
    setEditingItemId(null);
    const newQty = parseInt(eventValue, 10);
    if (isNaN(newQty) || newQty < 0 || newQty === item.cantidad) return;

    const delta = newQty - item.cantidad;
    const tipo = delta > 0 ? 'entrada' : 'salida';
    const absQty = Math.abs(delta);

    movementMutation.mutate({
      inventario_id: item.id,
      tipo,
      cantidad: absQty,
      concepto: 'Ajuste manual rápido inline',
      usuario_email: user?.email || 'coordinador@ready.set.go',
    });
  };

  // Indicadores KPI superiores (Fase 3 wireframe 1b)
  const kpis = useMemo(() => {
    let lowStock = 0;
    let soonExpired = 0;
    let totalUnits = 0;
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    stockItems.forEach(i => {
      totalUnits += i.cantidad || 0;
      if (i.cantidad <= i.stock_minimo) lowStock++;
      if (i.fecha_vencimiento) {
        const d = new Date(i.fecha_vencimiento);
        if (d >= today && d <= in30Days) soonExpired++;
      }
    });

    return { lowStock, soonExpired, totalUnits, totalItems: stockItems.length };
  }, [stockItems]);

  return (
    <div className="admin-panel admin-fade" style={{ minHeight: 'calc(100vh - 84px)' }}>
      {/* Header Panel */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-[#eef1f4] pb-4.5">
        <div>
          <h1 className="text-xl font-extrabold text-navy margin-0 flex items-center gap-2">
            {t('admin.nav.inventario')}
            {(kpis.lowStock + kpis.soonExpired) > 0 && (
              <span className="admin-pill admin-pill-crit font-extrabold text-[10px] px-2.5 py-0.5 animate-pulse">
                {kpis.lowStock + kpis.soonExpired} {lang === 'es' ? 'alertas' : 'alerts'}
              </span>
            )}
          </h1>
          <p className="admin-apr-desc margin-0 mt-1">
            {t('admin.supply.desc')}
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => {
              setFormMode('item');
              setIsDrawerOpen(true);
            }}
            className="admin-btn admin-btn-ghost sm font-bold cursor-pointer"
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
      </div>

      {/* ── TAB 1: STOCK INVENTARIO ── */}
      {activeTab === 'stock' && (
        <div className="flex flex-col gap-5.5">
          {/* KPI upper row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#efe7d8] rounded-2xl p-4 flex flex-col">
              <span className="text-[22px] font-extrabold text-navy leading-none">
                {kpis.totalUnits.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')}
              </span>
              <span className="text-[10px] font-bold text-text-tertiary uppercase mt-2">
                Unidades totales
              </span>
            </div>
            <div className="bg-white border border-[#efe7d8] rounded-2xl p-4 flex flex-col">
              <span className={`text-[22px] font-extrabold leading-none ${kpis.lowStock > 0 ? 'text-[#c0413b]' : 'text-navy'}`}>
                {kpis.lowStock}
              </span>
              <span className="text-[10px] font-bold text-text-tertiary uppercase mt-2">
                Stock bajo
              </span>
            </div>
            <div className="bg-white border border-[#efe7d8] rounded-2xl p-4 flex flex-col">
              <span className={`text-[22px] font-extrabold leading-none ${kpis.soonExpired > 0 ? 'text-[#c0413b]' : 'text-navy'}`}>
                {kpis.soonExpired}
              </span>
              <span className="text-[10px] font-bold text-text-tertiary uppercase mt-2">
                Vence pronto
              </span>
            </div>
            <div className="bg-white border border-[#efe7d8] rounded-2xl p-4 flex flex-col">
              <span className="text-[22px] font-extrabold text-navy leading-none">
                {CATEGORIAS.length}
              </span>
              <span className="text-[10px] font-bold text-text-tertiary uppercase mt-2">
                Categorías
              </span>
            </div>
          </div>

          {/* Category Chip filters (Wireframe 1b styling) */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setCategoryFilter('Todas')}
              className={`admin-chip cursor-pointer${categoryFilter === 'Todas' ? ' on' : ''}`}
            >
              Todas
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`admin-chip cursor-pointer${categoryFilter === cat.value ? ' on' : ''}`}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>

          {/* Search bar & Alert Selector */}
          <div className="bg-white border border-[#efe7d8] rounded-2xl p-4 flex flex-wrap gap-4 items-center shadow-sm">
            <div className="admin-top-search relative flex-grow max-w-[320px] w-full" style={{ border: '1px solid #e7eaef', borderRadius: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3a9b3" strokeWidth="2" className="absolute left-3.5 top-[12px]">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder={lang === 'es' ? 'Buscar insumo…' : 'Search supplies…'}
                className="fld outline-none border-0 w-full"
                style={{ paddingLeft: 38, height: 34, fontSize: 12 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              className="fld sm cursor-pointer bg-white"
              style={{ width: 'auto', minWidth: 150, height: 34, fontSize: 11.5 }}
            >
              <option value="Todas">{lang === 'es' ? 'Todos los niveles' : 'All Levels'}</option>
              <option value="bajo">{t('admin.supply.alert.understocked')}</option>
              <option value="vence">{t('admin.supply.alert.expiring')}</option>
            </select>
          </div>

          {/* Inventory Table (Wireframe 1b grid layout) */}
          <div className="admin-card" style={{ overflow: 'hidden', padding: 0 }}>
            {/* Grid Header */}
            <div className="admin-inv-grid" style={{ padding: '12px 18px', borderBottom: '1px solid #eef1f4', background: '#fafbfc' }}>
              <span className="th">{lang === 'es' ? 'Ítem' : 'Item'}</span>
              <span className="th col-hide">{t('admin.supply.category')}</span>
              <span className="th">{lang === 'es' ? 'Cantidad' : 'Quantity'}</span>
              <span className="th col-hide">{lang === 'es' ? 'Lote / vence' : 'Lot / expiry'}</span>
              <span className="th text-right">{t('admin.table.estado')}</span>
            </div>

            {/* Grid Rows */}
            {loadingStock ? (
              <div className="p-12 text-center">
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 rounded-full border-2 border-navy border-t-transparent animate-spin" />
                </div>
              </div>
            ) : stockItems.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-tertiary">
                {t('admin.supply.table.empty')}
              </div>
            ) : (
              stockItems.map((item) => {
                const isLow = item.cantidad <= item.stock_minimo;
                const hasExpiry = !!item.fecha_vencimiento;
                
                // Expiration calculation (< 30 days)
                let isExpiring = false;
                if (hasExpiry) {
                  const today = new Date();
                  const in30 = new Date();
                  in30.setDate(today.getDate() + 30);
                  isExpiring = new Date(item.fecha_vencimiento) <= in30;
                }

                // Highlight colors matching wireframe 1b rows
                let rowBg = 'bg-white';
                let statusPill = <span className="admin-pill admin-pill-ok">OK</span>;
                if (isLow) {
                  rowBg = 'bg-[#fffaf0]'; // Warm orange alert background
                  statusPill = <span className="admin-pill admin-pill-warn">Stock bajo</span>;
                } else if (isExpiring) {
                  rowBg = 'bg-[#fff5f4]'; // Warm red alert background
                  statusPill = <span className="admin-pill admin-pill-crit">Vence</span>;
                }

                const isEditing = editingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`admin-inv-grid admin-row ${rowBg} text-xs font-semibold`}
                    style={{ padding: '12px 18px', borderBottom: '1px solid #eef1f4' }}
                  >
                    <div className="td font-bold text-text-primary">{item.nombre}</div>
                    <div className="td text-text-secondary col-hide">
                      {t(CATEGORIAS.find(c => c.value === item.categoria)?.labelKey || 'admin.nav.inventario')}
                    </div>
                    <div className="td text-text-primary">
                      {isEditing ? (
                        <input
                          type="number"
                          className="fld sm bg-white border border-navy rounded p-1 w-20 outline-none"
                          style={{ height: 26, padding: '2px 6px' }}
                          value={editingQty}
                          onChange={(e) => setEditingQty(e.target.value)}
                          onBlur={() => handleInlineQtyBlur(item, editingQty)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleInlineQtyBlur(item, editingQty);
                            if (e.key === 'Escape') setEditingItemId(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:underline border-b border-dashed border-gray-400 pb-0.5"
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditingQty(item.cantidad);
                          }}
                          title="Toca para editar cantidad"
                        >
                          <span className="font-extrabold">{item.cantidad}</span>{' '}
                          <span className="text-[10px] text-text-tertiary">{item.unidad}</span>
                        </span>
                      )}
                    </div>
                    <div className="td text-text-secondary col-hide">
                      <span className={isExpiring ? 'text-[#c0413b] font-bold' : ''}>
                        {item.lote || 'L-1001'} ·{' '}
                        {item.fecha_vencimiento 
                          ? new Date(item.fecha_vencimiento).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US') 
                          : '—'
                        }
                      </span>
                    </div>
                    <div className="text-right">{statusPill}</div>
                  </div>
                );
              })
            )}
          </div>
          <p className="text-[11.5px] text-text-tertiary margin-0 font-medium italic">
            ✎ Tip: Puedes editar las cantidades de stock directamente haciendo clic sobre el número de cantidad de cualquier fila.
          </p>
        </div>
      )}

      {/* ── TAB 2: AUDIT LOGS ── */}
      {activeTab === 'movs' && (
        <div className="admin-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="p-4.5 border-b border-[#eef1f4] bg-[#fafbfc]">
            <h3 className="margin-0 font-bold text-xs text-navy uppercase tracking-wider">
              {t('admin.supply.recentLogs')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ display: 'table' }}>
              <thead>
                <tr className="border-b border-[#eef1f4] bg-[#fafbfc]">
                  <th className="p-4 text-[10px] font-bold text-navy uppercase tracking-wider">{t('admin.supply.itemName')}</th>
                  <th className="p-4 text-[10px] font-bold text-navy uppercase tracking-wider">{t('admin.supply.movement.type')}</th>
                  <th className="p-4 text-[10px] font-bold text-navy uppercase tracking-wider">{t('admin.supply.movement.qty')}</th>
                  <th className="p-4 text-[10px] font-bold text-navy uppercase tracking-wider">{t('admin.supply.movement.concepto')}</th>
                  <th className="p-4 text-[10px] font-bold text-navy uppercase tracking-wider">Coordinador</th>
                  <th className="p-4 text-[10px] font-bold text-navy uppercase tracking-wider text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loadingMovs ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">
                      <div className="flex justify-center py-6">
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
                          {mov.inventario?.nombre || 'Insumo sin nombre'}
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

      {/* ── QUICK INPUT DRAWER OVERLAY ── */}
      {isDrawerOpen && (
        <div className="admin-mobile-menu-overlay" onClick={() => setIsDrawerOpen(false)} style={{ zIndex: 60 }}>
          <div
            className="admin-mobile-menu-sheet max-w-[400px] mx-auto rounded-t-2xl lg:rounded-2xl lg:mb-auto lg:mt-24 lg:border lg:border-[#efe7d8] lg:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-mobile-menu-header">
              <b>{formMode === 'item' ? t('admin.supply.add') : t('admin.supply.registerMovement')}</b>
              <button className="admin-mobile-menu-close" onClick={() => setIsDrawerOpen(false)}>✕</button>
            </div>

            <div className="admin-mobile-menu-body p-6">
              {/* Form 1: Add new item to catalog */}
              {formMode === 'item' ? (
                <form onSubmit={handleCreateItemSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      {t('admin.supply.itemName')} <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Agua potable 5L"
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
                        Unidad
                      </label>
                      <input
                        type="text"
                        required
                        className="fld bg-[#faf9f6]"
                        value={newItem.unidad}
                        onChange={(e) => setNewItem({ ...newItem, unidad: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                        Cantidad Inicial
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
                        Lote
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. L-2291"
                        className="fld bg-[#faf9f6]"
                        value={newItem.lote}
                        onChange={(e) => setNewItem({ ...newItem, lote: e.target.value })}
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

                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Centro de acopio
                    </label>
                    <select
                      className="fld bg-[#faf9f6] cursor-pointer"
                    >
                      <option>Vargas · Casa Misionera</option>
                    </select>
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
                          {item.nombre} ({item.cantidad} {item.unidad})
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
                      Concepto / Detalle
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Distribución a albergue / Donación"
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
