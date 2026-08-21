// src/pages/admin/PermisosPanel.jsx
// Gestión de permisos / RBAC — Fase 4 Gobernanza §7.14
// Acceso restringido: Solo Super-Admin (protegido por SuperAdminRoute en App.jsx)
// Matriz de roles + Asignación de permisos específicos por usuario.

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { useI18nStore } from '@/stores/useI18nStore';
import { rbacService } from '@/services/rbacService';
import { staffService } from '@/services/staffService';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

// Orden canónico de las acciones en la matriz general
const ACTION_ORDER = [
  'register_donate',
  'view_volunteers',
  'approve_volunteers',
  'reveal_sensitive_data',
  'export_data',
  'manage_inventory',
  'edit_inventory',
  'delete_inventory',
  'manage_categories',
  'manage_admins_rbac',
];

// Acciones configurables individualmente por usuario
const USER_CONFIGURABLE_ACTIONS = [
  { action: 'edit_inventory', titleKey: 'admin.permisos.action.edit_inventory', desc: 'Permite modificar detalles, cantidades y fechas de insumos.' },
  { action: 'delete_inventory', titleKey: 'admin.permisos.action.delete_inventory', desc: 'Permite eliminar insumos permanentemente del catálogo.' },
  { action: 'manage_categories', titleKey: 'admin.permisos.action.manage_categories', desc: 'Permite crear, editar o remover categorías de insumos.' },
  { action: 'manage_inventory', titleKey: 'admin.permisos.action.manage_inventory', desc: 'Permite registrar movimientos de entrada y salida de stock.' },
  { action: 'export_data', titleKey: 'admin.permisos.action.export_data', desc: 'Permite descargar reportes consolidados en Excel y PDF.' },
  { action: 'reveal_sensitive_data', titleKey: 'admin.permisos.action.reveal_sensitive_data', desc: 'Permite desenmascarar cédulas y teléfonos de voluntarios.' },
  { action: 'approve_volunteers', titleKey: 'admin.permisos.action.approve_volunteers', desc: 'Permite aprobar o rechazar solicitudes de voluntarios.' },
];

// Acciones críticas (resaltadas en rojo tenue)
const CRITICAL_ACTIONS = new Set(['manage_admins_rbac', 'delete_inventory']);

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, locked, onChange, id, title }) {
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
      title={title || (locked ? 'Este permiso no se puede modificar' : (on ? 'Desactivar' : 'Activar'))}
    />
  );
}

// ── Historial de cambios ──────────────────────────────────────────────────────
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
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
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
            Cargando historial…
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
              <div style={{ font: '500 12px/1.4 Inter, system-ui, sans-serif', color: '#374151' }}>
                {entry.admin_users?.nombre ?? entry.admin_users?.email ?? (entry.changed_by ? 'Administrador' : 'Sistema')}
              </div>

              <div className="admin-audit-meta">
                {formatDate(entry.created_at)}
              </div>

              <div className="admin-audit-changes">
                {Array.isArray(entry.changes) && entry.changes.map((c, i) => (
                  <span key={i} className="admin-audit-change-pill">
                    {c.target_user ? `Usuario (${c.target_user.slice(0, 6)}…): ${c.permissions?.join(', ') || 'Sin permisos'}` : `${c.role} · ${c.action}: ${c.old_value ? '✓' : '✗'} → ${c.new_value ? '✓' : '✗'}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

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
  const lang = useI18nStore((s) => s.lang);
  const user = useAuthStore((s) => s.user);
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'users'
  const [showAudit, setShowAudit] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [showUserConfirm, setShowUserConfirm] = useState(false);

  // ── ESTADO PESTAÑA ROLES ──
  const [localPermissions, setLocalPermissions] = useState(null);

  const { data: permissionsRaw = [], isLoading: loadingRolePerms, isError, refetch } = useQuery({
    queryKey: ['rbac-permissions'],
    queryFn: () => rbacService.getPermissions(),
    staleTime: 60_000,
  });

  const permissionsMap = useMemo(() => {
    const map = {};
    permissionsRaw.forEach((p) => {
      map[`${p.role}__${p.action}`] = { allowed: p.allowed, locked: p.locked };
    });
    return map;
  }, [permissionsRaw]);

  const displayRoleMap = localPermissions ?? permissionsMap;
  const isRoleDirty = localPermissions !== null;

  const pendingRoleChanges = useMemo(() => {
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

  const handleRoleToggle = useCallback((role, action, currentValue, isLocked) => {
    if (isLocked) {
      showToast(t('admin.permisos.locked.toast'));
      return;
    }
    setLocalPermissions((prev) => ({
      ...(prev ?? Object.fromEntries(
        Object.entries(permissionsMap).map(([k, v]) => [k, v.allowed])
      )),
      [`${role}__${action}`]: !currentValue,
    }));
  }, [permissionsMap, showToast, t]);

  const saveRolesMutation = useMutation({
    mutationFn: () => rbacService.savePermissions(pendingRoleChanges, user?.id),
    onSuccess: () => {
      setLocalPermissions(null);
      queryClient.invalidateQueries({ queryKey: ['rbac-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['rbac-audit'] });
      showToast(lang === 'es' ? 'Permisos de roles actualizados con éxito' : 'Role permissions updated successfully');
    },
    onError: (err) => showToast(err.message),
  });

  // ── ESTADO PESTAÑA USUARIOS ──
  const { data: staffList = [], isLoading: loadingStaff } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffService.getAll(),
    staleTime: 30_000,
  });

  const [selectedUserId, setSelectedUserId] = useState(null);

  // Auto-seleccionar primer usuario si no hay ninguno seleccionado
  useEffect(() => {
    if (!selectedUserId && staffList.length > 0) {
      setSelectedUserId(staffList[0].id);
    }
  }, [staffList, selectedUserId]);

  const selectedStaffUser = useMemo(() => {
    return staffList.find((s) => s.id === selectedUserId) || staffList[0] || null;
  }, [staffList, selectedUserId]);

  const { data: userSavedPerms = [], isLoading: loadingUserPerms } = useQuery({
    queryKey: ['user-permissions', selectedStaffUser?.id],
    queryFn: () => rbacService.getUserPermissions(selectedStaffUser?.id),
    enabled: !!selectedStaffUser?.id,
    staleTime: 30_000,
  });

  const [localUserPerms, setLocalUserPerms] = useState(null);

  // Reset local state when selected user changes or queries reload
  useEffect(() => {
    setLocalUserPerms(null);
  }, [selectedUserId]);

  const activeUserPerms = localUserPerms !== null ? localUserPerms : (userSavedPerms || []);
  const isUserDirty = localUserPerms !== null;

  const handleUserToggle = (actionKey) => {
    const isSuper = selectedStaffUser?.role === 'super_admin';
    if (isSuper) {
      showToast(t('admin.permisos.locked.toast'));
      return;
    }

    const currentArray = activeUserPerms;
    const exists = currentArray.includes(actionKey);
    const updated = exists
      ? currentArray.filter((a) => a !== actionKey)
      : [...currentArray, actionKey];

    setLocalUserPerms(updated);
  };

  const saveUserPermsMutation = useMutation({
    mutationFn: () => rbacService.saveUserPermissions(selectedStaffUser?.id, activeUserPerms, user?.id),
    onSuccess: () => {
      setLocalUserPerms(null);
      queryClient.invalidateQueries({ queryKey: ['user-permissions', selectedStaffUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['rbac-audit'] });
      showToast(lang === 'es' ? `Permisos actualizados para "${selectedStaffUser?.nombre}"` : `Permissions updated for "${selectedStaffUser?.nombre}"`);
    },
    onError: (err) => showToast(err.message),
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
        <button className="admin-btn admin-btn-pri sm" onClick={refetch}>
          {t('admin.error.retry')}
        </button>
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
            📋 {t('admin.permisos.history')}
          </button>
        </div>

        {/* ── Selector de Pestañas: Roles vs Permisos por Usuario ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={`admin-btn sm cursor-pointer ${activeTab === 'roles' ? 'admin-btn-pri' : 'admin-btn-ghost'}`}
            onClick={() => setActiveTab('roles')}
            id="tab-roles-matrix"
          >
            👥 {t('admin.permisos.tabs.roles')}
          </button>
          <button
            className={`admin-btn sm cursor-pointer ${activeTab === 'users' ? 'admin-btn-pri' : 'admin-btn-ghost'}`}
            onClick={() => setActiveTab('users')}
            id="tab-users-permissions"
          >
            👤 {t('admin.permisos.tabs.users')}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ── PESTAÑA 1: MATRIZ GENERAL POR ROLES ── */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'roles' && (
          <div>
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

              {loadingRolePerms && (
                <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  Cargando matriz de permisos…
                </div>
              )}

              {!loadingRolePerms && ACTION_ORDER.map((action) => {
                const isCrit = CRITICAL_ACTIONS.has(action);

                const publicPerm = displayRoleMap[`public__${action}`];
                const coordPerm  = displayRoleMap[`coordinador__${action}`];
                const saPerm     = displayRoleMap[`super_admin__${action}`];

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
                      {t(`admin.permisos.action.${action}`) || action}
                    </div>

                    {/* Público */}
                    <div className="admin-matrow-col">
                      <Toggle
                        id={`rbac-public-${action}`}
                        on={publicOn}
                        locked={false}
                        onChange={() => handleRoleToggle('public', action, publicOn, false)}
                      />
                    </div>

                    {/* Coordinador */}
                    <div className="admin-matrow-col">
                      <Toggle
                        id={`rbac-coord-${action}`}
                        on={coordOn}
                        locked={false}
                        onChange={() => handleRoleToggle('coordinador', action, coordOn, false)}
                      />
                    </div>

                    {/* Super-Admin (bloqueado) */}
                    <div className="admin-matrow-col">
                      <Toggle
                        id={`rbac-sa-${action}`}
                        on={saOn}
                        locked={saLocked}
                        onChange={() => handleRoleToggle('super_admin', action, saOn, saLocked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Barra de cambios sin guardar en roles */}
            {isRoleDirty && (
              <div className="admin-rbac-bar" id="rbac-unsaved-bar">
                <span className="admin-pill admin-pill-warn">{t('admin.permisos.dirty.badge')}</span>
                <p className="admin-rbac-bar-hint">{t('admin.permisos.dirty.hint')}</p>
                <button
                  className="admin-btn admin-btn-ghost sm"
                  onClick={() => setLocalPermissions(null)}
                  disabled={saveRolesMutation.isPending}
                >
                  {t('admin.permisos.dirty.discard')}
                </button>
                <button
                  className="admin-btn admin-btn-pri sm"
                  id="btn-rbac-save"
                  onClick={() => setShowRoleConfirm(true)}
                  disabled={saveRolesMutation.isPending || pendingRoleChanges.length === 0}
                >
                  {saveRolesMutation.isPending ? 'Guardando…' : t('admin.permisos.dirty.save')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ── PESTAÑA 2: PERMISOS ESPECIALES POR USUARIO ── */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-4">
            <div className="admin-card p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#eef1f4]">
                <div>
                  <h3 className="font-bold text-sm text-text-primary m-0">
                    {t('admin.permisos.user.select')}
                  </h3>
                  <p className="text-xs text-text-tertiary mt-1 mb-0">
                    {t('admin.permisos.user.hint')}
                  </p>
                </div>

                <div className="w-full sm:w-auto min-w-[240px]">
                  <select
                    className="fld bg-[#faf9f6] cursor-pointer"
                    value={selectedUserId || ''}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    id="select-user-permissions"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} ({s.email}) — [{s.role}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tarjeta de usuario seleccionado */}
              {selectedStaffUser && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="admin-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                      {selectedStaffUser.nombre?.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div>
                      <b className="text-xs text-text-primary block">{selectedStaffUser.nombre}</b>
                      <span className="text-[11px] text-gray-500">{selectedStaffUser.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={selectedStaffUser.role === 'super_admin' ? 'admin-pill admin-pill-crit' : 'admin-pill admin-pill-info'}>
                      {selectedStaffUser.role === 'super_admin' ? 'Super-Admin' : 'Coordinador'}
                    </span>
                    {selectedStaffUser.role === 'super_admin' && (
                      <span className="text-[11px] text-gray-500 font-medium italic">
                        (Acceso total por rol de Super-Admin)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Matriz de permisos individuales del usuario */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  padding: '10px 18px',
                  background: '#fafbfc',
                  borderBottom: '1px solid #eef1f4',
                  font: '700 10px/1 Inter, system-ui, sans-serif',
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  color: '#8a91a0',
                }}
              >
                <div>Permiso / Capacidad</div>
                <div style={{ textAlign: 'center' }}>Permitir para este usuario</div>
              </div>

              {loadingUserPerms || loadingStaff ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  Cargando permisos del usuario…
                </div>
              ) : (
                USER_CONFIGURABLE_ACTIONS.map(({ action, titleKey, desc }) => {
                  const isSuper = selectedStaffUser?.role === 'super_admin';
                  const isEnabled = isSuper || activeUserPerms.includes(action);

                  return (
                    <div
                      key={action}
                      className="admin-matrow"
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', alignItems: 'center' }}
                    >
                      <div className="admin-matrow-label">
                        <b>{t(titleKey) || action}</b>
                        <p className="text-[11px] text-gray-500 m-0 font-normal mt-0.5">
                          {desc}
                        </p>
                      </div>

                      <div className="admin-matrow-col">
                        <Toggle
                          id={`user-perm-${action}`}
                          on={isEnabled}
                          locked={isSuper}
                          onChange={() => handleUserToggle(action)}
                          title={isSuper ? 'Super-Admin tiene este permiso habilitado por defecto' : ''}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Barra de cambios sin guardar en permisos de usuario */}
            {isUserDirty && (
              <div className="admin-rbac-bar" id="user-rbac-unsaved-bar">
                <span className="admin-pill admin-pill-warn">{t('admin.permisos.dirty.badge')}</span>
                <p className="admin-rbac-bar-hint">
                  {lang === 'es'
                    ? `Guardar permisos personalizados para ${selectedStaffUser?.nombre}.`
                    : `Save custom permissions for ${selectedStaffUser?.nombre}.`}
                </p>
                <button
                  className="admin-btn admin-btn-ghost sm"
                  onClick={() => setLocalUserPerms(null)}
                  disabled={saveUserPermsMutation.isPending}
                >
                  {t('admin.permisos.dirty.discard')}
                </button>
                <button
                  className="admin-btn admin-btn-pri sm"
                  id="btn-user-rbac-save"
                  onClick={() => setShowUserConfirm(true)}
                  disabled={saveUserPermsMutation.isPending}
                >
                  {saveUserPermsMutation.isPending ? 'Guardando…' : t('admin.permisos.dirty.save')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MODAL CONFIRMACIÓN ROLES ── */}
        {showRoleConfirm && (
          <ConfirmDialog
            title={t('admin.permisos.confirm.title')}
            message={t('admin.permisos.confirm.msg')}
            confirmText={t('admin.permisos.confirm.btn')}
            confirmVariant="ok"
            onClose={() => setShowRoleConfirm(false)}
            onConfirm={() => saveRolesMutation.mutate()}
          />
        )}

        {/* ── MODAL CONFIRMACIÓN PERMISOS DE USUARIO ── */}
        {showUserConfirm && (
          <ConfirmDialog
            title={lang === 'es' ? '¿Actualizar permisos del usuario?' : 'Update user permissions?'}
            message={
              lang === 'es'
                ? `Estás por aplicar permisos específicos para "${selectedStaffUser?.nombre}". Estos ajustes sobreescribirán las reglas base de su rol.`
                : `You are about to apply specific permissions for "${selectedStaffUser?.nombre}". These settings will override their role defaults.`
            }
            confirmText={t('admin.permisos.confirm.btn')}
            confirmVariant="ok"
            onClose={() => setShowUserConfirm(false)}
            onConfirm={() => saveUserPermsMutation.mutate()}
          />
        )}
      </div>
    </div>
  );
}
