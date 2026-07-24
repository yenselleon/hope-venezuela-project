// src/pages/admin/InventarioPanel.jsx
// Módulo de Inventario de Insumos y Suministros (Fase 3).
// Conexión real con Supabase + Búsqueda Global + CSS original de Claude Design.

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { inventarioService } from '@/services/inventarioService';
import './Admin.css';

const DEFAULT_CATEGORIAS = [
  { value: 'agua', labelKey: 'admin.supply.water', label: 'Agua potable', color: '#003366' },
  { value: 'higiene', labelKey: 'admin.supply.hygiene', label: 'Higiene', color: '#2f7d4f' },
  { value: 'alimentos', labelKey: 'admin.supply.food', label: 'Alimentos', color: '#e6a93a' },
  { value: 'refugio', labelKey: 'admin.supply.mattresses', label: 'Colchones / Refugio', color: '#7a86c8' },
  { value: 'medicinas', labelKey: 'admin.supply.medicine', label: 'Medicinas', color: '#b06fb0' },
];

export default function InventarioPanel() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const showToast = useUIStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Categorías dinámicas
  const [categories, setCategories] = useState(DEFAULT_CATEGORIAS);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Búsqueda global reactiva desde el topbar
  const searchQuery = useUIStore((s) => s.searchQuery);

  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [alertFilter, setAlertFilter] = useState('Todas'); // 'Todas' | 'bajo' | 'vence'

  // Cajón Lateral / Modal Overlay
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    centro: 'Vargas · Casa Misionera',
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
      setIsDrawerOpen(false);
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
      centro: 'Vargas · Casa Misionera',
    });
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

  const handleCreateCategorySubmit = (e) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    const val = name.toLowerCase().replace(/\s+/g, '_');
    const newCat = {
      value: val,
      labelKey: null,
      label: name,
      color: '#003366',
    };
    setCategories((prev) => [...prev, newCat]);
    setCategoryFilter(val);
    showToast(lang === 'es' ? `Categoría "${name}" creada` : `Category "${name}" created`);
    setNewCatName('');
    setIsCategoryModalOpen(false);
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
      {/* ── HEADER ROW (Matching Claude Design exactly) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, flexWrap: 'wrap' }}>
        {(kpis.lowStock + kpis.soonExpired) > 0 && (
          <span className="admin-pill admin-pill-crit font-extrabold animate-pulse">
            {kpis.lowStock + kpis.soonExpired} {lang === 'es' ? 'alertas' : 'alerts'}
          </span>
        )}
        <span style={{ font: '600 13px Inter, system-ui, sans-serif', color: '#6B7280' }}>
          {lang === 'es' ? 'Existencias en tiempo real por centro de acopio.' : 'Real-time stock by storage center.'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="admin-btn admin-btn-ghost sm font-bold cursor-pointer"
          >
            {lang === 'es' ? 'Categorías' : 'Categories'}
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
          >
            + {lang === 'es' ? 'Añadir insumo' : 'Add supply'}
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ROW (Exact Claude Design styles) ── */}
      <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap', marginBottom: 16 }}>
        {/* KPI 1 */}
        <div className="admin-kpi">
          <span className="admin-kpi-number">
            {kpis.totalUnits.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')}
          </span>
          <span className="admin-kpi-label">
            {lang === 'es' ? 'Unidades totales' : 'Total units'}
          </span>
        </div>

        {/* KPI 2 (Warning alert trigger) */}
        <div
          className={`admin-kpi admin-kpi--warn cursor-pointer${alertFilter === 'bajo' ? ' on' : ''}`}
          onClick={() => setAlertFilter(alertFilter === 'bajo' ? 'Todas' : 'bajo')}
          style={alertFilter === 'bajo' ? { outline: '2px solid #8a5a12' } : {}}
        >
          <span className="admin-kpi-number" style={{ color: '#8a5a12' }}>
            {kpis.lowStock}
          </span>
          <span className="admin-kpi-label" style={{ color: '#8a5a12' }}>
            {lang === 'es' ? 'Stock bajo' : 'Low stock'}
          </span>
        </div>

        {/* KPI 3 (Critical alert trigger) */}
        <div
          className={`admin-kpi admin-kpi--crit cursor-pointer${alertFilter === 'vence' ? ' on' : ''}`}
          onClick={() => setAlertFilter(alertFilter === 'vence' ? 'Todas' : 'vence')}
          style={alertFilter === 'vence' ? { outline: '2px solid #b02a24' } : {}}
        >
          <span className="admin-kpi-number" style={{ color: '#b02a24' }}>
            {kpis.soonExpired}
          </span>
          <span className="admin-kpi-label" style={{ color: '#b02a24' }}>
            {lang === 'es' ? 'Vence pronto' : 'Soon expired'}
          </span>
        </div>

        {/* KPI 4 */}
        <div className="admin-kpi">
          <span className="admin-kpi-number">
            {categories.length}
          </span>
          <span className="admin-kpi-label">
            {lang === 'es' ? 'Categorías' : 'Categories'}
          </span>
        </div>
      </div>

      {/* ── CATEGORY CHIPS ROW ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button
          onClick={() => setCategoryFilter('Todas')}
          className={`admin-chip cursor-pointer${categoryFilter === 'Todas' ? ' on' : ''}`}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`admin-chip cursor-pointer${categoryFilter === cat.value ? ' on' : ''}`}
          >
            {cat.labelKey ? t(cat.labelKey) : cat.label}
          </button>
        ))}
        <button
          className="admin-chip cursor-pointer"
          style={{ borderStyle: 'dashed', color: '#2a6fdb' }}
          onClick={() => setIsCategoryModalOpen(true)}
          id="btn-new-category"
        >
          + {lang === 'es' ? 'Nueva categoría' : 'New category'}
        </button>
      </div>

      {/* ── INVENTORY GRID TABLE (Exact Layout & Light Gray Border Card) ── */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {/* Grid Header */}
        <div className="admin-inv-grid" style={{ padding: '12px 18px', borderBottom: '1px solid #eef1f4', background: '#fafbfc' }}>
          <span className="admin-th">{lang === 'es' ? 'Ítem' : 'Item'}</span>
          <span className="admin-th col-hide">{lang === 'es' ? 'Categoría' : 'Category'}</span>
          <span className="admin-th">{lang === 'es' ? 'Cantidad' : 'Quantity'}</span>
          <span className="admin-th col-hide">{lang === 'es' ? 'Lote / vence' : 'Lot / expiry'}</span>
          <span className="admin-th text-right">{lang === 'es' ? 'Estado' : 'Status'}</span>
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
            {lang === 'es' ? 'Sin insumos en esta categoría.' : 'No supplies in this category.'}
          </div>
        ) : (
          stockItems.map((item) => {
            const isLow = item.cantidad <= item.stock_minimo;
            const hasExpiry = !!item.fecha_vencimiento;
            
            // Expiración crítica (< 30 días)
            let isExpiring = false;
            if (hasExpiry) {
              const today = new Date();
              const in30 = new Date();
              in30.setDate(today.getDate() + 30);
              isExpiring = new Date(item.fecha_vencimiento) <= in30;
            }

            // Colores de fila según mockup
            let rowBgStyle = {};
            let statusPill = <span className="admin-pill admin-pill-ok">OK</span>;
            let qtyStyle = { fontWeight: '700', cursor: 'pointer' };

            if (isLow) {
              rowBgStyle = { background: '#fffaf0' }; // Alerta stock bajo
              statusPill = <span className="admin-pill admin-pill-warn">{lang === 'es' ? 'Stock bajo' : 'Low stock'}</span>;
            } else if (isExpiring) {
              rowBgStyle = { background: '#fff5f4' }; // Alerta vencimiento crítico
              statusPill = <span className="admin-pill admin-pill-crit">{lang === 'es' ? 'Vence pronto' : 'Soon expired'}</span>;
            }

            const isEditing = editingItemId === item.id;

            return (
              <div
                key={item.id}
                className="admin-inv-grid admin-row"
                style={{ padding: '12px 18px', borderBottom: '1px solid #eef1f4', ...rowBgStyle }}
              >
                <div className="admin-td" style={{ fontWeight: '600', color: '#111827' }}>
                  {item.nombre}
                </div>
                
                <div className="admin-td col-hide" style={{ color: '#4b5563' }}>
                  {(() => {
                    const found = categories.find((c) => c.value === item.categoria);
                    if (!found) return item.categoria;
                    return found.labelKey ? t(found.labelKey) : found.label;
                  })()}
                </div>

                <div className="admin-td">
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
                      style={qtyStyle}
                      onClick={() => {
                        setEditingItemId(item.id);
                        setEditingQty(item.cantidad);
                      }}
                      title="Editar stock"
                    >
                      {item.cantidad} {item.unidad}{' '}
                      <span style={{ color: '#b3b8c0', fontSize: 10 }}>✎</span>
                    </span>
                  )}
                </div>

                <div className="admin-td col-hide" style={isExpiring ? { color: '#b02a24', fontWeight: '600' } : { color: '#4b5563' }}>
                  {item.lote || 'L-1001'} ·{' '}
                  {item.fecha_vencimiento 
                    ? new Date(item.fecha_vencimiento).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: '2-digit', year: '2-digit' })
                    : '—'
                  }
                </div>

                <div className="text-right">
                  {statusPill}
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-[11px] text-text-tertiary margin-0 font-medium italic mt-3">
        ✎ Tip: Puedes editar las cantidades de stock directamente haciendo clic sobre el número de cantidad (icono ✎).
      </p>

      {/* ── QUICK INPUT DRAWER OVERLAY ── */}
      {isDrawerOpen && (
        <div className="admin-mobile-menu-overlay" onClick={() => setIsDrawerOpen(false)} style={{ zIndex: 60 }}>
          <div
            className="admin-mobile-menu-sheet max-w-[400px] mx-auto rounded-t-2xl lg:rounded-2xl lg:mb-auto lg:mt-24 lg:border lg:border-[#efe7d8] lg:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-mobile-menu-header">
              <b>{lang === 'es' ? 'Añadir insumo' : 'Add supply'}</b>
              <button className="admin-mobile-menu-close" onClick={() => setIsDrawerOpen(false)}>✕</button>
            </div>

            <div className="admin-mobile-menu-body p-6">
              <form onSubmit={handleCreateItemSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                    Nombre del ítem <span className="req">*</span>
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
                      Categoría
                    </label>
                    <select
                      className="fld bg-[#faf9f6] cursor-pointer"
                      value={newItem.categoria}
                      onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.labelKey ? t(cat.labelKey) : cat.label}
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
                      Cantidad
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
                      placeholder="L-____"
                      className="fld bg-[#faf9f6]"
                      value={newItem.lote}
                      onChange={(e) => setNewItem({ ...newItem, lote: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                    Vencimiento (opcional)
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
                    {lang === 'es' ? 'Centro de acopio' : 'Storage center'}
                  </label>
                  <select
                    className="fld bg-[#faf9f6] cursor-pointer"
                    value={newItem.centro}
                    onChange={(e) => setNewItem({ ...newItem, centro: e.target.value })}
                    id="select-add-item-center"
                  >
                    <option value="Vargas · Casa Misionera">Vargas · Casa Misionera</option>
                    <option value="Caracas · Centro Principal">Caracas · Centro Principal</option>
                    <option value="Miranda · San Antonio">Miranda · San Antonio</option>
                    <option value="Miranda · Los Teques">Miranda · Los Teques</option>
                    <option value="Aragua · Maracay">Aragua · Maracay</option>
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
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE CATEGORY MODAL OVERLAY ── */}
      {isCategoryModalOpen && (
        <div className="admin-mobile-menu-overlay" onClick={() => setIsCategoryModalOpen(false)} style={{ zIndex: 60 }}>
          <div
            className="admin-mobile-menu-sheet max-w-[380px] mx-auto rounded-t-2xl lg:rounded-2xl lg:mb-auto lg:mt-32 lg:border lg:border-[#efe7d8] lg:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-mobile-menu-header">
              <b>{lang === 'es' ? 'Nueva categoría de insumo' : 'New supply category'}</b>
              <button className="admin-mobile-menu-close" onClick={() => setIsCategoryModalOpen(false)}>✕</button>
            </div>

            <div className="admin-mobile-menu-body p-5">
              <form onSubmit={handleCreateCategorySubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                    {lang === 'es' ? 'Nombre de la categoría' : 'Category name'} <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'es' ? 'Ej. Herramientas, Equipos…' : 'e.g. Tools, Equipment…'}
                    className="fld bg-[#faf9f6]"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    autoFocus
                    id="new-category-name-input"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="admin-btn admin-btn-soft sm font-bold cursor-pointer"
                  >
                    {t('admin.assign.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
                    id="btn-save-category"
                  >
                    {lang === 'es' ? 'Guardar categoría' : 'Save category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
