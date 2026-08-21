// src/pages/admin/MovementsHistoryTab.jsx
// Vista de auditoría de movimientos de inventario (entradas y salidas).

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventarioService } from '@/services/inventarioService';

function formatMovementDate(dateStr, lang) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MovementsHistoryTab({ lang, t, categories }) {
  const [typeFilter, setTypeFilter] = useState('Todos'); // 'Todos' | 'entrada' | 'salida'
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['inventario_movimientos', { tipo: typeFilter }],
    queryFn: () => inventarioService.getMovements({ tipo: typeFilter === 'Todos' ? null : typeFilter }),
    staleTime: 15_000,
  });

  const filteredMovements = useMemo(() => {
    if (categoryFilter === 'Todas') return movements;
    return movements.filter((m) => m.inventario?.categoria === categoryFilter);
  }, [movements, categoryFilter]);

  return (
    <div>
      {/* ── FILTROS ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1 block">
            {t('admin.supply.movs.filter.type')}
          </label>
          <select
            className="fld sm bg-[#faf9f6] cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="Todos">{t('admin.supply.movs.filter.all')}</option>
            <option value="entrada">{t('admin.supply.movement.entry')}</option>
            <option value="salida">{t('admin.supply.movement.exit')}</option>
          </select>
        </div>
        <div>
          <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1 block">
            {lang === 'es' ? 'Categoría' : 'Category'}
          </label>
          <select
            className="fld sm bg-[#faf9f6] cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="Todas">{lang === 'es' ? 'Todas' : 'All'}</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.labelKey ? t(cat.labelKey) : (cat.nombre || cat.label)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TABLA DE MOVIMIENTOS ── */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div className="admin-mov-grid" style={{ padding: '12px 18px', borderBottom: '1px solid #eef1f4', background: '#fafbfc' }}>
          <span className="admin-th">{t('admin.supply.movs.col.date')}</span>
          <span className="admin-th">{t('admin.supply.movs.col.item')}</span>
          <span className="admin-th">{t('admin.supply.movs.col.type')}</span>
          <span className="admin-th">{t('admin.supply.movs.col.qty')}</span>
          <span className="admin-th admin-col-hide">{t('admin.supply.movs.col.concept')}</span>
          <span className="admin-th admin-col-hide">{t('admin.supply.movs.col.destination')}</span>
          <span className="admin-th admin-col-hide-mobile">{t('admin.supply.movs.col.user')}</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 rounded-full border-2 border-navy border-t-transparent animate-spin" />
            </div>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-tertiary">
            {t('admin.supply.movs.empty')}
          </div>
        ) : (
          filteredMovements.map((m) => (
            <div
              key={m.id}
              className="admin-mov-grid admin-row"
              style={{ padding: '12px 18px', borderBottom: '1px solid #eef1f4' }}
            >
              <div className="admin-td" style={{ color: '#4b5563', fontSize: 12.5 }}>
                {formatMovementDate(m.created_at, lang)}
              </div>
              <div className="admin-td" style={{ fontWeight: 600, color: '#111827' }}>
                {m.inventario?.nombre || '—'}
              </div>
              <div className="admin-td">
                {m.tipo === 'entrada' ? (
                  <span className="admin-pill admin-pill-ok">{t('admin.supply.movement.entry')}</span>
                ) : (
                  <span className="admin-pill admin-pill-warn">{t('admin.supply.movement.exit')}</span>
                )}
              </div>
              <div className="admin-td" style={{ fontWeight: 600 }}>
                {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}
              </div>
              <div className="admin-td admin-col-hide" style={{ color: '#4b5563' }}>
                {m.concepto || '—'}
              </div>
              <div className="admin-td admin-col-hide" style={{ color: '#4b5563' }}>
                {m.destino || '—'}
              </div>
              <div className="admin-td admin-col-hide-mobile" style={{ color: '#4b5563', fontSize: 12 }}>
                {m.usuario_email || '—'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
