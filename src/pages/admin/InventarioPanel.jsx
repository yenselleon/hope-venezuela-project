// src/pages/admin/InventarioPanel.jsx
// Módulo de Inventario de Insumos y Suministros (Fase 3 & 4 Gobernanza).
// Conexión real con Supabase + Búsqueda Global + Control de Permisos Granulares.

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePermissions } from '@/hooks/usePermissions';
import { inventarioService } from '@/services/inventarioService';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { MovementsHistoryTab } from './MovementsHistoryTab';
import './Admin.css';

const DEFAULT_CATEGORIAS = [
  { value: 'agua', labelKey: 'admin.supply.water', label: 'Agua potable', color: '#003366' },
  { value: 'higiene', labelKey: 'admin.supply.hygiene', label: 'Higiene', color: '#2f7d4f' },
  { value: 'alimentos', labelKey: 'admin.supply.food', label: 'Alimentos', color: '#e6a93a' },
  { value: 'refugio', labelKey: 'admin.supply.mattresses', label: 'Colchones / Refugio', color: '#7a86c8' },
  { value: 'medicinas', labelKey: 'admin.supply.medicine', label: 'Medicinas', color: '#b06fb0' },
];

const PRESET_COLORS = [
  '#003366', '#2f7d4f', '#e6a93a', '#7a86c8', '#b06fb0', '#2a6fdb', '#cf4a43', '#8a5a12',
];

function formatExpiryDate(dateStr) {
  if (!dateStr) return '—';
  const parts = String(dateStr).split('-');
  if (parts.length < 2) return dateStr;
  const year = parts[0];
  const month = parts[1];
  return `${month}/${year.slice(-2)}`;
}

export default function InventarioPanel() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const showToast = useUIStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Permisos granulares
  const { canEditInventory, canDeleteInventory, canManageCategories, canManageInventory } = usePermissions();

  // Búsqueda global reactiva y filtro de zona desde el topbar
  const searchQuery = useUIStore((s) => s.searchQuery);
  const selectedZoneFilter = useUIStore((s) => s.selectedZoneFilter);

  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [alertFilter, setAlertFilter] = useState('Todas'); // 'Todas' | 'bajo' | 'vence'

  // Drawers y Modales de ítems
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Tabs: catálogo de stock vs. auditoría de movimientos
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movements'

  // Drawer: registrar salida de insumo
  const [isExitDrawerOpen, setIsExitDrawerOpen] = useState(false);
  const [exitingItem, setExitingItem] = useState(null);
  const [exitForm, setExitForm] = useState({ cantidad: '', motivo: 'Distribución', motivoOtro: '', destino: '' });
  const [exitError, setExitError] = useState('');

  // Gestor de Categorías
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#003366');
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Inline Editing Quantity state
  const [editingInlineId, setEditingInlineId] = useState(null);
  const [editingInlineQty, setEditingInlineQty] = useState('');

  // Formulario nuevo ítem
  const [newItem, setNewItem] = useState({
    nombre: '',
    categoria: 'agua',
    unidad: 'u',
    cantidad: '',
    stock_minimo: 10,
    lote: '',
    fecha_vencimiento: '',
    centro: 'Vargas · Casa Misionera',
  });

  // 1. Obtener catálogo de insumos reactivo a filtros
  const { data: stockItems = [], isLoading: loadingStock } = useQuery({
    queryKey: ['inventario', { categoria: categoryFilter, alert: alertFilter, search: searchQuery, zona: selectedZoneFilter }],
    queryFn: () => inventarioService.getAll({
      categoria: categoryFilter === 'Todas' ? null : categoryFilter,
      alert: alertFilter === 'Todas' ? null : alertFilter,
      search: searchQuery || null,
      zona: selectedZoneFilter,
    }),
    staleTime: 15_000,
  });

  // 2. Obtener categorías persistidas
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['inventario_categorias'],
    queryFn: () => inventarioService.getCategories(),
    staleTime: 60_000,
  });

  // Normalizar categorías para UI
  const categories = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map((c) => {
        const defaultMatch = DEFAULT_CATEGORIAS.find((d) => d.value === c.slug);
        return {
          value: c.slug,
          slug: c.slug,
          labelKey: defaultMatch?.labelKey || null,
          label: c.nombre,
          nombre: c.nombre,
          color: c.color || defaultMatch?.color || '#003366',
        };
      });
    }
    return DEFAULT_CATEGORIAS.map((d) => ({ ...d, slug: d.value, nombre: d.label }));
  }, [dbCategories]);

  // Conteo de insumos por categoría para validación de integridad al eliminar
  const categoryItemCounts = useMemo(() => {
    const counts = {};
    stockItems.forEach((item) => {
      counts[item.categoria] = (counts[item.categoria] || 0) + 1;
    });
    return counts;
  }, [stockItems]);

  // ── Mutaciones de Ítems ──
  const createItemMutation = useMutation({
    mutationFn: (item) => inventarioService.create(item),
    onSuccess: () => {
      showToast(t('admin.supply.success'));
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      setIsAddDrawerOpen(false);
      resetNewItemForm();
    },
    onError: (err) => showToast(err.message),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, ...itemData }) => inventarioService.update(id, itemData),
    onSuccess: () => {
      showToast(t('admin.supply.toast.updated'));
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      setIsEditDrawerOpen(false);
      setEditingItem(null);
    },
    onError: (err) => showToast(err.message),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => inventarioService.delete(id),
    onSuccess: () => {
      showToast(t('admin.supply.toast.deleted'));
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      setDeletingItem(null);
    },
    onError: (err) => showToast(err.message),
  });

  const movementMutation = useMutation({
    mutationFn: (move) => inventarioService.registerMovement(move),
    onSuccess: () => {
      showToast(t('admin.supply.toast.moved'));
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
    onError: (err) => showToast(err.message),
  });

  const registerExitMutation = useMutation({
    mutationFn: (exitData) => inventarioService.registerExit(exitData),
    onSuccess: () => {
      showToast(t('admin.supply.toast.moved'));
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      queryClient.invalidateQueries({ queryKey: ['inventario_movimientos'] });
      setIsExitDrawerOpen(false);
      setExitingItem(null);
    },
    onError: (err) => setExitError(err.message),
  });

  // ── Mutaciones de Categorías ──
  const createCategoryMutation = useMutation({
    mutationFn: ({ nombre, color }) => inventarioService.createCategory({ nombre, color }),
    onSuccess: (newCat) => {
      showToast(lang === 'es' ? `Categoría "${newCat.nombre}" creada` : `Category "${newCat.nombre}" created`);
      queryClient.invalidateQueries({ queryKey: ['inventario_categorias'] });
      setCategoryFilter(newCat.slug);
      setNewCatName('');
      setNewCatColor('#003366');
    },
    onError: (err) => showToast(err.message),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ slug, nombre, color }) => inventarioService.updateCategory(slug, { nombre, color }),
    onSuccess: () => {
      showToast(t('admin.supply.category.toast.updated'));
      queryClient.invalidateQueries({ queryKey: ['inventario_categorias'] });
      setEditingCategory(null);
    },
    onError: (err) => showToast(err.message),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (slug) => inventarioService.deleteCategory(slug),
    onSuccess: () => {
      showToast(t('admin.supply.category.toast.deleted'));
      queryClient.invalidateQueries({ queryKey: ['inventario_categorias'] });
      if (categoryFilter === deletingCategory?.slug || categoryFilter === deletingCategory?.value) {
        setCategoryFilter('Todas');
      }
      setDeletingCategory(null);
    },
    onError: (err) => showToast(err.message),
  });

  const resetNewItemForm = () => {
    setNewItem({
      nombre: '',
      categoria: categories[0]?.value || 'agua',
      unidad: 'u',
      cantidad: '',
      stock_minimo: 10,
      lote: '',
      fecha_vencimiento: '',
      centro: 'Vargas · Casa Misionera',
    });
  };

  const handleCreateItemSubmit = (e) => {
    e.preventDefault();
    if (!newItem.nombre.trim()) return;
    createItemMutation.mutate({
      ...newItem,
      cantidad: parseInt(newItem.cantidad, 10) || 0,
      lote: newItem.lote.trim() || undefined,
      usuario_email: user?.email || undefined,
    });
  };

  const handleEditItemSubmit = (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem.nombre.trim()) return;
    updateItemMutation.mutate({
      id: editingItem.id,
      nombre: editingItem.nombre,
      categoria: editingItem.categoria,
      unidad: editingItem.unidad,
      cantidad: parseInt(editingItem.cantidad, 10) || 0,
      stock_minimo: parseInt(editingItem.stock_minimo, 10) || 10,
      lote: editingItem.lote?.trim() || 'L-1001',
      fecha_vencimiento: editingItem.fecha_vencimiento || null,
      centro: editingItem.centro || 'Vargas · Casa Misionera',
    });
  };

  const handleStartEditItem = (item) => {
    if (!canEditInventory) {
      showToast(t('admin.permisos.no_permission'));
      return;
    }
    setEditingItem({ ...item });
    setIsEditDrawerOpen(true);
  };

  const handleStartDeleteItem = (item) => {
    if (!canDeleteInventory) {
      showToast(t('admin.permisos.no_permission'));
      return;
    }
    setDeletingItem(item);
  };

  const handleStartExitItem = (item) => {
    if (!canManageInventory) {
      showToast(t('admin.permisos.no_permission'));
      return;
    }
    setExitingItem(item);
    setExitForm({ cantidad: '', motivo: 'Distribución', motivoOtro: '', destino: '' });
    setExitError('');
    setIsExitDrawerOpen(true);
  };

  const handleExitSubmit = (e) => {
    e.preventDefault();
    setExitError('');
    const qty = parseInt(exitForm.cantidad, 10);

    if (isNaN(qty) || qty <= 0) {
      setExitError(t('admin.supply.exit.error.qty_invalid'));
      return;
    }
    if (qty > exitingItem.cantidad) {
      setExitError(t('admin.supply.exit.error.insufficient_stock'));
      return;
    }
    const motivoFinal = exitForm.motivo === 'Otro' ? exitForm.motivoOtro.trim() : exitForm.motivo;
    if (!motivoFinal) {
      setExitError(t('admin.supply.exit.error.reason_required'));
      return;
    }

    registerExitMutation.mutate({
      inventario_id: exitingItem.id,
      cantidad: qty,
      concepto: motivoFinal,
      destino: exitForm.destino.trim() || null,
      usuario_email: user?.email || undefined,
    });
  };

  const handleCreateCategorySubmit = (e) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    createCategoryMutation.mutate({ nombre: name, color: newCatColor });
  };

  const handleUpdateCategorySubmit = (e) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.nombre.trim()) return;
    updateCategoryMutation.mutate({
      slug: editingCategory.slug || editingCategory.value,
      nombre: editingCategory.nombre,
      color: editingCategory.color,
    });
  };

  const handleStartDeleteCategory = (cat) => {
    if (!canManageCategories) {
      showToast(t('admin.permisos.no_permission'));
      return;
    }
    const slug = cat.slug || cat.value;
    const count = categoryItemCounts[slug] || 0;
    if (count > 0) {
      showToast(t('admin.supply.category.delete.has_items'));
      return;
    }
    setDeletingCategory(cat);
  };

  // Inline adjustment click-save logic
  const handleInlineQtyBlur = (item, eventValue) => {
    setEditingInlineId(null);
    if (!canEditInventory) return;
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

  // Indicadores KPI superiores
  const kpis = useMemo(() => {
    let lowStock = 0;
    let soonExpired = 0;
    let totalUnits = 0;
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    stockItems.forEach((i) => {
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
      {/* ── HEADER ROW ── */}
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
            onClick={() => setIsCategoryManagerOpen(true)}
            className="admin-btn admin-btn-ghost sm font-bold cursor-pointer"
            id="btn-open-categories"
            title={canManageCategories ? '' : t('admin.permisos.no_permission')}
          >
            🏷️ {lang === 'es' ? 'Categorías' : 'Categories'}
          </button>
          <button
            onClick={() => {
              if (!canEditInventory && !canManageInventory) {
                showToast(t('admin.permisos.no_permission'));
                return;
              }
              setIsAddDrawerOpen(true);
            }}
            className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
            id="btn-add-supply"
          >
            + {lang === 'es' ? 'Añadir insumo' : 'Add supply'}
          </button>
        </div>
      </div>

      {/* ── TABS: STOCK vs AUDITORÍA DE MOVIMIENTOS ── */}
      {(canEditInventory || canManageInventory) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={`admin-btn sm cursor-pointer ${activeTab === 'stock' ? 'admin-btn-pri' : 'admin-btn-ghost'}`}
            onClick={() => setActiveTab('stock')}
            id="tab-inventario-stock"
          >
            📦 {t('admin.supply.tab.stock')}
          </button>
          <button
            className={`admin-btn sm cursor-pointer ${activeTab === 'movements' ? 'admin-btn-pri' : 'admin-btn-ghost'}`}
            onClick={() => setActiveTab('movements')}
            id="tab-inventario-movements"
          >
            📋 {t('admin.supply.tab.movements')}
          </button>
        </div>
      )}

      {activeTab === 'movements' ? (
        <MovementsHistoryTab lang={lang} t={t} categories={categories} />
      ) : (
      <>
      {/* ── KPI CARDS ROW ── */}
      <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="admin-kpi">
          <span className="admin-kpi-number">
            {kpis.totalUnits.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')}
          </span>
          <span className="admin-kpi-label">
            {lang === 'es' ? 'Unidades totales' : 'Total units'}
          </span>
        </div>

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
            <span className="admin-color-dot" style={{ backgroundColor: cat.color, width: 8, height: 8 }} />
            {cat.labelKey ? t(cat.labelKey) : cat.label}
          </button>
        ))}
        {canManageCategories && (
          <button
            className="admin-chip cursor-pointer"
            style={{ borderStyle: 'dashed', color: '#2a6fdb' }}
            onClick={() => setIsCategoryManagerOpen(true)}
            id="btn-new-category"
          >
            + {lang === 'es' ? 'Gestionar categorías' : 'Manage categories'}
          </button>
        )}
      </div>

      {/* ── INVENTORY GRID TABLE ── */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {/* Grid Header */}
        <div className="admin-inv-grid" style={{ padding: '12px 18px', borderBottom: '1px solid #eef1f4', background: '#fafbfc' }}>
          <span className="admin-th">{lang === 'es' ? 'Ítem' : 'Item'}</span>
          <span className="admin-th admin-col-hide">{lang === 'es' ? 'Categoría' : 'Category'}</span>
          <span className="admin-th admin-col-hide-mobile">{lang === 'es' ? 'Centro de acopio' : 'Storage center'}</span>
          <span className="admin-th">{lang === 'es' ? 'Cantidad' : 'Quantity'}</span>
          <span className="admin-th admin-col-hide">{lang === 'es' ? 'Lote / vence' : 'Lot / expiry'}</span>
          <span className="admin-th text-right">{lang === 'es' ? 'Estado' : 'Status'}</span>
          <span className="admin-th text-center">{lang === 'es' ? 'Acciones' : 'Actions'}</span>
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
            {lang === 'es'
              ? (selectedZoneFilter && selectedZoneFilter !== 'Todas'
                  ? `Sin insumos registrados para la zona "${selectedZoneFilter}".`
                  : 'Sin insumos en esta categoría.')
              : (selectedZoneFilter && selectedZoneFilter !== 'Todas'
                  ? `No supplies registered for zone "${selectedZoneFilter}".`
                  : 'No supplies in this category.')}
          </div>
        ) : (
          stockItems.map((item) => {
            const isLow = item.cantidad <= item.stock_minimo;
            const hasExpiry = !!item.fecha_vencimiento;
            
            let isExpiring = false;
            if (hasExpiry) {
              const today = new Date();
              const in30 = new Date();
              in30.setDate(today.getDate() + 30);
              isExpiring = new Date(item.fecha_vencimiento) <= in30;
            }

            let rowBgStyle = {};
            let statusPill = <span className="admin-pill admin-pill-ok">OK</span>;
            let qtyStyle = { fontWeight: '700', cursor: canEditInventory ? 'pointer' : 'default' };

            if (isLow) {
              rowBgStyle = { background: '#fffaf0' };
              statusPill = <span className="admin-pill admin-pill-warn">{lang === 'es' ? 'Stock bajo' : 'Low stock'}</span>;
            } else if (isExpiring) {
              rowBgStyle = { background: '#fff5f4' };
              statusPill = <span className="admin-pill admin-pill-crit">{lang === 'es' ? 'Vence pronto' : 'Soon expired'}</span>;
            }

            const isEditingInline = editingInlineId === item.id;

            return (
              <div
                key={item.id}
                className="admin-inv-grid admin-row"
                style={{ padding: '12px 18px', borderBottom: '1px solid #eef1f4', ...rowBgStyle }}
              >
                {/* Ítem */}
                <div className="admin-td">
                  <div style={{ fontWeight: '600', color: '#111827' }}>
                    {item.nombre}
                  </div>
                  <div className="admin-only-mobile text-[11px] text-gray-500 flex items-center gap-1 mt-0.5" style={{ display: 'none' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">{item.centro || 'Vargas · Casa Misionera'}</span>
                  </div>
                </div>
                
                {/* Categoría */}
                <div className="admin-td admin-col-hide" style={{ color: '#4b5563' }}>
                  {(() => {
                    const found = categories.find((c) => c.value === item.categoria || c.slug === item.categoria);
                    if (!found) return item.categoria;
                    return (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="admin-color-dot" style={{ backgroundColor: found.color || '#003366', width: 7, height: 7 }} />
                        {found.labelKey ? t(found.labelKey) : (found.nombre || found.label)}
                      </span>
                    );
                  })()}
                </div>

                {/* Centro de acopio */}
                <div className="admin-td admin-col-hide-mobile" style={{ color: '#374151', fontSize: 13 }}>
                  <span className="font-medium inline-flex items-center gap-1.5" title={item.centro || 'Vargas · Casa Misionera'}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate max-w-[170px] lg:max-w-[220px]">
                      {item.centro || 'Vargas · Casa Misionera'}
                    </span>
                  </span>
                </div>

                {/* Cantidad con Inline Edit */}
                <div className="admin-td">
                  {isEditingInline ? (
                    <input
                      type="number"
                      className="fld sm bg-white border border-navy rounded p-1 w-20 outline-none"
                      style={{ height: 26, padding: '2px 6px' }}
                      value={editingInlineQty}
                      onChange={(e) => setEditingInlineQty(e.target.value)}
                      onBlur={() => handleInlineQtyBlur(item, editingInlineQty)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInlineQtyBlur(item, editingInlineQty);
                        if (e.key === 'Escape') setEditingInlineId(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      style={qtyStyle}
                      onClick={() => {
                        if (canEditInventory) {
                          setEditingInlineId(item.id);
                          setEditingInlineQty(item.cantidad);
                        }
                      }}
                      title={canEditInventory ? "Ajuste rápido de stock" : ""}
                    >
                      {item.cantidad} {item.unidad}{' '}
                      {canEditInventory && <span style={{ color: '#b3b8c0', fontSize: 10 }}>✎</span>}
                    </span>
                  )}
                </div>

                {/* Lote / Vencimiento */}
                <div className="admin-td admin-col-hide" style={isExpiring ? { color: '#b02a24', fontWeight: '600' } : { color: '#4b5563' }}>
                  {item.lote || 'L-1001'} · {formatExpiryDate(item.fecha_vencimiento)}
                </div>

                {/* Estado */}
                <div className="text-right">
                  {statusPill}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEditItem(item)}
                    className={`admin-action-btn${!canEditInventory ? ' admin-action-btn--disabled' : ''}`}
                    title={canEditInventory ? (lang === 'es' ? 'Editar insumo' : 'Edit supply') : t('admin.permisos.no_permission')}
                    aria-label={`Editar ${item.nombre}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartExitItem(item)}
                    className={`admin-action-btn${!canManageInventory ? ' admin-action-btn--disabled' : ''}`}
                    title={canManageInventory ? t('admin.supply.exit.action') : t('admin.permisos.no_permission')}
                    aria-label={`${t('admin.supply.exit.action')} ${item.nombre}`}
                    style={canManageInventory ? { color: '#8a5a12' } : undefined}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v13" />
                      <path d="m6 11 6 6 6-6" />
                      <path d="M4 20h16" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartDeleteItem(item)}
                    className={`admin-action-btn admin-action-btn--delete${!canDeleteInventory ? ' admin-action-btn--disabled' : ''}`}
                    title={canDeleteInventory ? (lang === 'es' ? 'Eliminar insumo' : 'Delete supply') : t('admin.permisos.no_permission')}
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-[11px] text-text-tertiary margin-0 font-medium italic mt-3">
        ✎ Tip: Puedes editar las cantidades de stock directamente haciendo clic sobre el número de cantidad o pulsar el botón de edición (icono lápiz) para modificar todos los datos.
      </p>
      </>
      )}

      {/* ── MODAL DE CONFIRMACIÓN DE ELIMINAR ÍTEM ── */}
      {deletingItem && (
        <ConfirmDialog
          title={t('admin.supply.delete.confirm.title')}
          message={
            lang === 'es'
              ? `¿Estás seguro de eliminar el insumo "${deletingItem.nombre}" (${deletingItem.cantidad} ${deletingItem.unidad})? Esta acción es irreversible y eliminará su registro del catálogo.`
              : `Are you sure you want to permanently delete "${deletingItem.nombre}" (${deletingItem.cantidad} ${deletingItem.unidad})? This action cannot be undone.`
          }
          confirmText={deleteItemMutation.isPending ? t('admin.supply.saving') : t('admin.supply.delete.btn')}
          confirmVariant="no"
          onClose={() => setDeletingItem(null)}
          onConfirm={() => deleteItemMutation.mutate(deletingItem.id)}
        />
      )}

      {/* ── MODAL DE CONFIRMACIÓN DE ELIMINAR CATEGORÍA ── */}
      {deletingCategory && (
        <ConfirmDialog
          title={t('admin.supply.category.delete.confirm.title')}
          message={
            lang === 'es'
              ? `¿Estás seguro de eliminar la categoría "${deletingCategory.nombre || deletingCategory.label}"? No tiene insumos asignados.`
              : `Are you sure you want to delete category "${deletingCategory.nombre || deletingCategory.label}"? It has no assigned items.`
          }
          confirmText={deleteCategoryMutation.isPending ? t('admin.supply.saving') : t('admin.supply.category.delete')}
          confirmVariant="no"
          onClose={() => setDeletingCategory(null)}
          onConfirm={() => deleteCategoryMutation.mutate(deletingCategory.slug || deletingCategory.value)}
        />
      )}

      {/* ── DRAWER: AÑADIR NUEVO ÍTEM ── */}
      {isAddDrawerOpen && (
        <div className="admin-mobile-menu-overlay" onClick={() => setIsAddDrawerOpen(false)} style={{ zIndex: 60 }}>
          <div
            className="admin-mobile-menu-sheet max-w-[420px] mx-auto rounded-t-2xl lg:rounded-2xl lg:mb-auto lg:mt-20 lg:border lg:border-[#efe7d8] lg:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-mobile-menu-header">
              <b>{lang === 'es' ? 'Añadir nuevo insumo' : 'Add new supply'}</b>
              <button className="admin-mobile-menu-close" onClick={() => setIsAddDrawerOpen(false)}>✕</button>
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
                    autoFocus
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
                          {cat.labelKey ? t(cat.labelKey) : (cat.nombre || cat.label)}
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
                      placeholder="u, cajas, litros…"
                      className="fld bg-[#faf9f6]"
                      value={newItem.unidad}
                      onChange={(e) => setNewItem({ ...newItem, unidad: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Cantidad inicial
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="fld bg-[#faf9f6]"
                      value={newItem.cantidad}
                      onChange={(e) => setNewItem({ ...newItem, cantidad: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Stock mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="10"
                      className="fld bg-[#faf9f6]"
                      value={newItem.stock_minimo}
                      onChange={(e) => setNewItem({ ...newItem, stock_minimo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Lote
                    </label>
                    <input
                      type="text"
                      placeholder="L-1001"
                      className="fld bg-[#faf9f6]"
                      value={newItem.lote}
                      onChange={(e) => setNewItem({ ...newItem, lote: e.target.value })}
                    />
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
                    onClick={() => setIsAddDrawerOpen(false)}
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

      {/* ── DRAWER: EDITAR ÍTEM ── */}
      {isEditDrawerOpen && editingItem && (
        <div className="admin-mobile-menu-overlay" onClick={() => setIsEditDrawerOpen(false)} style={{ zIndex: 60 }}>
          <div
            className="admin-mobile-menu-sheet max-w-[420px] mx-auto rounded-t-2xl lg:rounded-2xl lg:mb-auto lg:mt-20 lg:border lg:border-[#efe7d8] lg:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-mobile-menu-header">
              <b>{t('admin.supply.edit.title')}</b>
              <button className="admin-mobile-menu-close" onClick={() => setIsEditDrawerOpen(false)}>✕</button>
            </div>

            <div className="admin-mobile-menu-body p-6">
              <form onSubmit={handleEditItemSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                    Nombre del ítem <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="fld bg-[#faf9f6]"
                    value={editingItem.nombre}
                    onChange={(e) => setEditingItem({ ...editingItem, nombre: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Categoría
                    </label>
                    <select
                      className="fld bg-[#faf9f6] cursor-pointer"
                      value={editingItem.categoria}
                      onChange={(e) => setEditingItem({ ...editingItem, categoria: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.labelKey ? t(cat.labelKey) : (cat.nombre || cat.label)}
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
                      value={editingItem.unidad}
                      onChange={(e) => setEditingItem({ ...editingItem, unidad: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Cantidad en stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="fld bg-[#faf9f6]"
                      value={editingItem.cantidad}
                      onChange={(e) => setEditingItem({ ...editingItem, cantidad: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Stock mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="fld bg-[#faf9f6]"
                      value={editingItem.stock_minimo}
                      onChange={(e) => setEditingItem({ ...editingItem, stock_minimo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Lote
                    </label>
                    <input
                      type="text"
                      className="fld bg-[#faf9f6]"
                      value={editingItem.lote || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, lote: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                      Vencimiento (opcional)
                    </label>
                    <input
                      type="date"
                      className="fld bg-[#faf9f6] cursor-pointer"
                      value={editingItem.fecha_vencimiento || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, fecha_vencimiento: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                    {lang === 'es' ? 'Centro de acopio' : 'Storage center'}
                  </label>
                  <select
                    className="fld bg-[#faf9f6] cursor-pointer"
                    value={editingItem.centro || 'Vargas · Casa Misionera'}
                    onChange={(e) => setEditingItem({ ...editingItem, centro: e.target.value })}
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
                    onClick={() => setIsEditDrawerOpen(false)}
                    className="admin-btn admin-btn-soft sm font-bold cursor-pointer"
                  >
                    {t('admin.assign.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={updateItemMutation.isPending}
                    className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
                  >
                    {updateItemMutation.isPending ? t('admin.supply.saving') : t('admin.assign.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWER: REGISTRAR SALIDA ── */}
      {isExitDrawerOpen && exitingItem && (
        <div className="admin-mobile-menu-overlay" onClick={() => setIsExitDrawerOpen(false)} style={{ zIndex: 60 }}>
          <div
            className="admin-mobile-menu-sheet max-w-[420px] mx-auto rounded-t-2xl lg:rounded-2xl lg:mb-auto lg:mt-20 lg:border lg:border-[#efe7d8] lg:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-mobile-menu-header">
              <b>{t('admin.supply.exit.title')}</b>
              <button className="admin-mobile-menu-close" onClick={() => setIsExitDrawerOpen(false)}>✕</button>
            </div>

            <div className="admin-mobile-menu-body p-6">
              <form onSubmit={handleExitSubmit} className="flex flex-col gap-4">
                <div className="admin-card" style={{ padding: '10px 14px', background: '#fafbfc' }}>
                  <b>{exitingItem.nombre}</b>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {t('admin.supply.exit.available')}: {exitingItem.cantidad} {exitingItem.unidad}
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                    {t('admin.supply.movement.qty')} <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={exitingItem.cantidad}
                    required
                    className="fld bg-[#faf9f6]"
                    value={exitForm.cantidad}
                    onChange={(e) => setExitForm({ ...exitForm, cantidad: e.target.value })}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                    {t('admin.supply.exit.reason')} <span className="req">*</span>
                  </label>
                  <select
                    className="fld bg-[#faf9f6] cursor-pointer"
                    value={exitForm.motivo}
                    onChange={(e) => setExitForm({ ...exitForm, motivo: e.target.value })}
                  >
                    <option value="Distribución">{t('admin.supply.exit.reason.distribution')}</option>
                    <option value="Vencido/Merma">{t('admin.supply.exit.reason.loss')}</option>
                    <option value="Traslado a otro centro">{t('admin.supply.exit.reason.transfer')}</option>
                    <option value="Otro">{t('admin.supply.exit.reason.other')}</option>
                  </select>
                </div>

                {exitForm.motivo === 'Otro' && (
                  <input
                    type="text"
                    required
                    placeholder={t('admin.supply.exit.reason.other.placeholder')}
                    className="fld bg-[#faf9f6]"
                    value={exitForm.motivoOtro}
                    onChange={(e) => setExitForm({ ...exitForm, motivoOtro: e.target.value })}
                  />
                )}

                <div>
                  <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
                    {t('admin.supply.exit.destination')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('admin.supply.exit.destination.placeholder')}
                    className="fld bg-[#faf9f6]"
                    value={exitForm.destino}
                    onChange={(e) => setExitForm({ ...exitForm, destino: e.target.value })}
                  />
                </div>

                {exitError && (
                  <div className="admin-pill admin-pill-crit" style={{ width: '100%', textAlign: 'left', padding: '8px 12px' }}>
                    {exitError}
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-3">
                  <button
                    type="button"
                    onClick={() => setIsExitDrawerOpen(false)}
                    className="admin-btn admin-btn-soft sm font-bold cursor-pointer"
                  >
                    {t('admin.assign.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={registerExitMutation.isPending}
                    className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
                  >
                    {registerExitMutation.isPending ? t('admin.supply.saving') : t('admin.supply.exit.action')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: GESTOR DE CATEGORÍAS ── */}
      {isCategoryManagerOpen && (
        <div className="admin-mobile-menu-overlay" onClick={() => setIsCategoryManagerOpen(false)} style={{ zIndex: 70 }}>
          <div
            className="admin-mobile-menu-sheet max-w-[460px] mx-auto rounded-t-2xl lg:rounded-2xl lg:mb-auto lg:mt-16 lg:border lg:border-[#efe7d8] lg:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-mobile-menu-header">
              <b>🏷️ {t('admin.supply.categories.title')}</b>
              <button className="admin-mobile-menu-close" onClick={() => setIsCategoryManagerOpen(false)}>✕</button>
            </div>

            <div className="admin-mobile-menu-body p-5">
              {/* Lista de categorías existentes */}
              <div className="mb-4">
                <span className="text-[10.5px] font-bold text-text-secondary uppercase mb-2 block">
                  {lang === 'es' ? 'Categorías registradas' : 'Registered categories'} ({categories.length})
                </span>
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const slug = cat.slug || cat.value;
                    const count = categoryItemCounts[slug] || 0;
                    const isSelectedEditing = editingCategory?.slug === slug || editingCategory?.value === slug;

                    return (
                      <div
                        key={slug}
                        className={`admin-cat-item${isSelectedEditing ? ' border-navy bg-blue-50/40' : ''}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="admin-color-dot" style={{ backgroundColor: cat.color }} />
                          <span className="font-semibold text-xs text-text-primary truncate">
                            {cat.nombre || cat.label}
                          </span>
                          <span className="admin-pill admin-pill-neutral text-[10px]">
                            {count} {lang === 'es' ? 'insumos' : 'items'}
                          </span>
                        </div>

                        {canManageCategories && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              className="admin-action-btn"
                              style={{ width: 28, height: 28 }}
                              title={lang === 'es' ? 'Editar nombre o color' : 'Edit name or color'}
                              onClick={() => {
                                setEditingCategory({
                                  slug,
                                  value: slug,
                                  nombre: cat.nombre || cat.label,
                                  color: cat.color || '#003366',
                                });
                              }}
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              className={`admin-action-btn admin-action-btn--delete${count > 0 ? ' opacity-40 cursor-not-allowed' : ''}`}
                              style={{ width: 28, height: 28 }}
                              title={
                                count > 0
                                  ? t('admin.supply.category.delete.has_items')
                                  : (lang === 'es' ? 'Eliminar categoría' : 'Delete category')
                              }
                              onClick={() => handleStartDeleteCategory(cat)}
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[#eef1f4] pt-4">
                {/* Formulario Editar Categoría */}
                {editingCategory ? (
                  <form onSubmit={handleUpdateCategorySubmit} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <b className="text-xs text-text-primary">
                        {lang === 'es' ? `Editar: "${editingCategory.nombre}"` : `Edit: "${editingCategory.nombre}"`}
                      </b>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="text-[11px] text-navy font-bold hover:underline cursor-pointer"
                      >
                        {lang === 'es' ? 'Cancelar edición' : 'Cancel editing'}
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">
                        {lang === 'es' ? 'Nombre' : 'Name'} <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="fld bg-[#faf9f6]"
                        value={editingCategory.nombre}
                        onChange={(e) => setEditingCategory({ ...editingCategory, nombre: e.target.value })}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">
                        {lang === 'es' ? 'Color identificador' : 'Identifier color'}
                      </label>
                      <div className="flex gap-2 items-center flex-wrap">
                        {PRESET_COLORS.map((c) => (
                          <div
                            key={c}
                            className={`admin-color-swatch${editingCategory.color === c ? ' active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setEditingCategory({ ...editingCategory, color: c })}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="admin-btn admin-btn-soft sm font-bold cursor-pointer"
                      >
                        {t('admin.assign.cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={updateCategoryMutation.isPending}
                        className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
                      >
                        {updateCategoryMutation.isPending ? t('admin.supply.saving') : (lang === 'es' ? 'Actualizar' : 'Update')}
                      </button>
                    </div>
                  </form>
                ) : canManageCategories ? (
                  /* Formulario Crear Nueva Categoría */
                  <form onSubmit={handleCreateCategorySubmit} className="flex flex-col gap-3">
                    <b className="text-xs text-text-primary">
                      + {lang === 'es' ? 'Nueva categoría' : 'New category'}
                    </b>

                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">
                        {lang === 'es' ? 'Nombre de la categoría' : 'Category name'} <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'es' ? 'Ej. Herramientas, Equipos…' : 'e.g. Tools, Equipment…'}
                        className="fld bg-[#faf9f6]"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        id="new-category-name-input"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">
                        {lang === 'es' ? 'Color identificador' : 'Identifier color'}
                      </label>
                      <div className="flex gap-2 items-center flex-wrap">
                        {PRESET_COLORS.map((c) => (
                          <div
                            key={c}
                            className={`admin-color-swatch${newCatColor === c ? ' active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setNewCatColor(c)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsCategoryManagerOpen(false)}
                        className="admin-btn admin-btn-soft sm font-bold cursor-pointer"
                      >
                        {lang === 'es' ? 'Cerrar' : 'Close'}
                      </button>
                      <button
                        type="submit"
                        disabled={createCategoryMutation.isPending}
                        className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
                        id="btn-save-category"
                      >
                        {createCategoryMutation.isPending ? t('admin.supply.saving') : (lang === 'es' ? 'Crear categoría' : 'Create category')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 text-center text-xs text-text-tertiary">
                    {t('admin.permisos.no_permission')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
