// src/pages/admin/PermisosPanel.jsx
// Gestión de permisos / RBAC — Fase 4 Gobernanza §7.14
// Acceso restringido: Solo Super-Admin (protegido por SuperAdminRoute en App.jsx)
// Diseño pixel-perfect según wireframe Fase 4 #1c

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { useI18nStore } from '@/stores/useI18nStore';
import { rbacService } from '@/services/rbacService';

// Orden canónico de las acciones en la matriz
const ACTION_ORDER = [
  'register_donate',
  'view_volunteers',
  'approve_volunteers',
  'reveal_sensitive_data',
  'export_data',
  'manage_inventory',
  'manage_admins_rbac',
];

// Acciones críticas (fila resaltada en rojo tenue)
const CRITICAL_ACTIONS = new Set(['manage_admins_rbac']);

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, locked, onChange, id }) {
  const handleClick = useCallback(() => {
    if (locked) return;
    onChange(!on);
  }, [locked, on, onChange]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div
      id={id}
      className={`admin-tog${on ? ' on' : ''}${locked ? ' locked' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKey}
      role="switch"
      aria-checked={on}
      aria-disabled={locked}
      tabIndex={locked ? -1 : 0}
      title={locked ? 'Este permiso no se puede modificar' : (on ? 'Desactivar' : 'Activar')}
    />
  );
}

// ── Historial de cambios (vista completa paginada) ─────────────────────────────
function AuditHistoryView({ onBack }) {
  const t = useI18nStore((s) => s.t);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rbac-audit', page],
    queryFn: () => rbacService.getAuditLog({ page, pageSize: PAGE_SIZE }),
    staleTime: 30_000,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-VE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button
          className="admin-btn admin-btn-ghost sm"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
        >
          ← Volver
        </button>
        <h3 style={{ margin: 0, font: '700 15px/1.2 Inter, system-ui, sans-serif', color: '#111827' }}>
          {t('admin.permisos.audit.title')}
        </h3>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header tabla */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1.2fr 2fr',
            padding: '8px 14px',
            background: '#fafbfc',
            borderBottom: '1px solid #eef1f4',
            font: '700 10px/1 Inter, system-ui, sans-serif',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#8a91a0',
          }}
        >
          <div>{t('admin.permisos.audit.col.who')}</div>
          <div>{t('admin.permisos.audit.col.when')}</div>
          <div>{t('admin.permisos.audit.col.changes')}</div>
        </div>

        {isLoading && (
          <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            Cargando…
          </div>
        )}

        {isError && (
          <div style={{ padding: 32, textAlign: 'center', color: '#b02a24', fontSize: 13 }}>
            Error al cargar el historial.
          </div>
        )}

        {!isLoading && data?.data?.length === 0 && (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📋</div>
            <h3 className="admin-empty-title">{t('admin.permisos.audit.empty')}</h3>
          </div>
        )}

        {!isLoading && data?.data?.map((entry) => (
          <div key={entry.id} className="admin-audit-row">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1.2fr 2fr',
                alignItems: 'start',
                gap: 8,
              }}
            >
              {/* Quién */}
              <div style={{ font: '500 12px/1.4 Inter, system-ui, sans-serif', color: '#374151' }}>
                {entry.admin_users?.nombre ?? entry.admin_users?.email ?? '—'}
              </div>

              {/* Cuándo */}
              <div className="admin-audit-meta">
                {formatDate(entry.created_at)}
              </div>

              {/* Cambios */}
              <div className="admin-audit-changes">
                {Array.isArray(entry.changes) && entry.changes.map((c, i) => (
                  <span key={i} className="admin-audit-change-pill">
                    {c.role} · {c.action}: {c.old_value ? '✓' : '✗'} → {c.new_value ? '✓' : '✗'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Paginación */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 14px',
              borderTop: '1px solid #f1f3f6',
            }}
          >
            <button
              className="admin-btn admin-btn-ghost sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Anterior
            </button>
            <span style={{ font: '500 12px/1 Inter, system-ui, sans-serif', color: '#6B7280' }}>
              {page} / {totalPages}
            </span>
            <button
              className="admin-btn admin-btn-ghost sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel principal ────────────────────────────────────────────────────────────
export default function PermisosPanel() {
  const t = useI18nStore((s) => s.t);
  const user = useAuthStore((s) => s.user);
  const addToast = useUIStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const [showAudit, setShowAudit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // localPermissions: { [role_action]: boolean } — estado local con cambios sin guardar
  const [localPermissions, setLocalPermissions] = useState(null);

  // Fetch permisos desde Supabase
  const { data: permissionsRaw = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['rbac-permissions'],
    queryFn: () => rbacService.getPermissions(),
    staleTime: 60_000,
  });

  // Construir mapa de permisos: { [role_action]: { allowed, locked } }
  const permissionsMap = useMemo(() => {
    const map = {};
    permissionsRaw.forEach((p) => {
      map[`${p.role}__${p.action}`] = { allowed: p.allowed, locked: p.locked };
    });
    return map;
  }, [permissionsRaw]);

  // Estado de display: usar localPermissions si existen, sino permissionsMap
  const displayMap = localPermissions ?? permissionsMap;

  // ¿Hay cambios sin guardar?
  const isDirty = localPermissions !== null;

  // Calcular lista de cambios respecto al original
  const pendingChanges = useMemo(() => {
    if (!localPermissions) return [];
    return Object.entries(localPermissions)
      .filter(([key, value]) => {
        const original = permissionsMap[key];
        return original && original.allowed !== value;
      })
      .map(([key, newAllowed]) => {
        const [role, action] = key.split('__');
        const original = permissionsMap[key];
        return { role, action, allowed: newAllowed, old_value: original.allowed, new_value: newAllowed };
      });
  }, [localPermissions, permissionsMap]);

  const handleToggle = useCallback((role, action, currentValue, isLocked) => {
    if (isLocked) {
      addToast({ message: t('admin.permisos.locked.toast'), type: 'warn' });
      return;
    }
    setLocalPermissions((prev) => ({
      ...(prev ?? Object.fromEntries(
        Object.entries(permissionsMap).map(([k, v]) => [k, v.allowed])
      )),
      [`${role}__${action}`]: !currentValue,
    }));
  }, [permissionsMap, addToast, t]);

  const handleDiscard = () => {
    setLocalPermissions(null);
  };

  // Mutación para guardar
  const saveMutation = useMutation({
    mutationFn: () => rbacService.savePermissions(pendingChanges, user?.id),
    onSuccess: () => {
      setLocalPermissions(null);
      queryClient.invalidateQueries({ queryKey: ['rbac-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['rbac-audit'] });
      addToast({ message: 'Permisos guardados correctamente', type: 'success' });
    },
    onError: (err) => {
      addToast({ message: err.message, type: 'error' });
    },
  });

  if (showAudit) {
    return <AuditHistoryView onBack={() => setShowAudit(false)} />;
  }

  if (isError) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-icon">⚠️</div>
        <h3 className="admin-empty-title">{t('admin.error.title')}</h3>
        <p className="admin-empty-msg">{t('admin.error.msg')}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin-btn admin-btn-ghost sm" onClick={() => window.history.back()}>
            {t('admin.error.back')}
          </button>
          <button className="admin-btn admin-btn-pri sm" onClick={refetch}>
            {t('admin.error.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel admin-fade">
      <div className="admin-rbac-wrap">
      {/* ── Topbar del panel ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="admin-rlock">Solo Super-Admin</span>
          <p style={{ margin: 0, font: '400 12px/1.4 Inter, system-ui, sans-serif', color: '#6B7280' }}>
            {t('admin.permisos.subtitle')}
          </p>
        </div>
        <button
          className="admin-btn admin-btn-ghost sm"
          id="btn-rbac-history"
          onClick={() => setShowAudit(true)}
        >
          {t('admin.permisos.history')}
        </button>
      </div>

      {/* ── Matriz de permisos ── */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header de columnas */}
        <div className="admin-mat-header">
          <div>{t('admin.permisos.col.action')}</div>
          <div style={{ textAlign: 'center' }}>{t('admin.permisos.col.public')}</div>
          <div style={{ textAlign: 'center' }}>{t('admin.permisos.col.coord')}</div>
          <div style={{ textAlign: 'center' }} className="admin-mat-header-sa">
            {t('admin.permisos.col.sa')}
          </div>
        </div>

        {isLoading && (
          <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            Cargando matriz de permisos…
          </div>
        )}

        {!isLoading && ACTION_ORDER.map((action) => {
          const isCrit = CRITICAL_ACTIONS.has(action);

          const publicPerm = displayMap[`public__${action}`];
          const coordPerm  = displayMap[`coordinador__${action}`];
          const saPerm     = displayMap[`super_admin__${action}`];

          const publicOn  = publicPerm?.allowed  ?? false;
          const coordOn   = coordPerm?.allowed   ?? false;
          const saOn      = saPerm?.allowed      ?? true;
          const saLocked  = saPerm?.locked       ?? true;

          return (
            <div
              key={action}
              className={`admin-matrow${isCrit ? ' crit' : ''}`}
            >
              <div className="admin-matrow-label">
                {t(`admin.permisos.action.${action}`)}
              </div>

              {/* Público */}
              <div className="admin-matrow-col">
                <Toggle
                  id={`rbac-public-${action}`}
                  on={publicOn}
                  locked={false}
                  onChange={() => handleToggle('public', action, publicOn, false)}
                />
              </div>

              {/* Coordinador */}
              <div className="admin-matrow-col">
                <Toggle
                  id={`rbac-coord-${action}`}
                  on={coordOn}
                  locked={false}
                  onChange={() => handleToggle('coordinador', action, coordOn, false)}
                />
              </div>

              {/* Super-Admin (siempre bloqueado) */}
              <div className="admin-matrow-col">
                <Toggle
                  id={`rbac-sa-${action}`}
                  on={saOn}
                  locked={saLocked}
                  onChange={() => handleToggle('super_admin', action, saOn, saLocked)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Barra de cambios sin guardar ── */}
      {isDirty && (
        <div className="admin-rbac-bar" id="rbac-unsaved-bar">
          <span className="admin-pill admin-pill-warn">{t('admin.permisos.dirty.badge')}</span>
          <p className="admin-rbac-bar-hint">{t('admin.permisos.dirty.hint')}</p>
          <button
            className="admin-btn admin-btn-ghost sm"
            onClick={handleDiscard}
            disabled={saveMutation.isPending}
          >
            {t('admin.permisos.dirty.discard')}
          </button>
          <button
            className="admin-btn admin-btn-pri sm"
            id="btn-rbac-save"
            onClick={() => setShowConfirm(true)}
            disabled={saveMutation.isPending || pendingChanges.length === 0}
          >
            {saveMutation.isPending ? 'Guardando…' : t('admin.permisos.dirty.save')}
          </button>
        </div>
      )}

      {/* ── Modal de confirmación ── */}
      {showConfirm && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15,23,42,.28)',
              zIndex: 100,
            }}
            onClick={() => setShowConfirm(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 400, maxWidth: '90vw',
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e7eaef',
              boxShadow: '0 8px 40px rgba(0,0,0,.14)',
              zIndex: 101,
              padding: 24,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rbac-confirm-title"
          >
            <h3
              id="rbac-confirm-title"
              style={{ margin: '0 0 8px', font: '800 15px/1.3 Inter, system-ui, sans-serif', color: '#111827' }}
            >
              {t('admin.permisos.confirm.title')}
            </h3>
            <p style={{ margin: '0 0 16px', font: '500 12px/1.6 Inter, system-ui, sans-serif', color: '#6B7280' }}>
              {t('admin.permisos.confirm.msg')}
            </p>

            {/* Resumen de cambios */}
            <div
              style={{
                background: '#f6f8fa',
                border: '1px solid #e2e5ea',
                borderRadius: 9,
                padding: '10px 12px',
                marginBottom: 16,
                maxHeight: 120,
                overflowY: 'auto',
              }}
            >
              {pendingChanges.map((c, i) => (
                <div
                  key={i}
                  style={{ font: '500 11px/1.6 Inter, system-ui, sans-serif', color: '#374151' }}
                >
                  <strong>{c.role}</strong> · {t(`admin.permisos.action.${c.action}`)}:
                  {' '}{c.old_value ? '✓' : '✗'} → {c.new_value ? '✓' : '✗'}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                className="admin-btn admin-btn-ghost sm"
                onClick={() => setShowConfirm(false)}
              >
                {t('admin.drawer.btn.cancel')}
              </button>
              <button
                className="admin-btn admin-btn-pri sm"
                id="btn-rbac-confirm"
                onClick={() => {
                  setShowConfirm(false);
                  saveMutation.mutate();
                }}
              >
                {t('admin.permisos.confirm.btn')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);
}
