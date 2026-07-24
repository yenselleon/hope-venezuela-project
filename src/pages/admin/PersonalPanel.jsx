// src/pages/admin/PersonalPanel.jsx
// Gestión de personal administrativo — Fase 4 Gobernanza §7.13
// Acceso restringido: Solo Super-Admin (protegido por SuperAdminRoute en App.jsx)
// Diseño pixel-perfect según wireframe Fase 4 #1a y #1b

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { useI18nStore } from '@/stores/useI18nStore';
import { staffService } from '@/services/staffService';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

// Zonas disponibles para asignar
const ZONAS_DISPONIBLES = [
  'Vargas', 'La Guaira', 'Miranda', 'Aragua', 'Caracas',
  'Carabobo', 'Lara', 'Zulia', 'Bolívar', 'Anzoátegui',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(nombre, email) {
  const name = nombre || email?.split('@')[0] || '??';
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Estado pill ────────────────────────────────────────────────────────────────
function EstadoPill({ estado }) {
  const classMap = {
    activo:    'admin-pill admin-pill-ok',
    pendiente: 'admin-pill admin-pill-warn',
    inactivo:  'admin-pill admin-pill-neutral',
  };
  const labelMap = {
    activo:    'Activo',
    pendiente: 'Invitación pend.',
    inactivo:  'Desactivado',
  };
  return (
    <span className={classMap[estado] ?? 'admin-pill admin-pill-neutral'}>
      {labelMap[estado] ?? estado}
    </span>
  );
}

// ── Rol pill ───────────────────────────────────────────────────────────────────
function RolPill({ role }) {
  if (role === 'super_admin') return <span className="admin-pill admin-pill-crit">Super-Admin</span>;
  if (role === 'coordinador') return <span className="admin-pill admin-pill-info">Coordinador</span>;
  const label = role ? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Coordinador';
  return <span className="admin-pill admin-pill-ok">{label}</span>;
}

// ── Modal para crear rol nuevo ─────────────────────────────────────────────
function CreateRoleModal({ isOpen, onClose, onSave }) {
  const [roleName, setRoleName] = useState('');
  const lang = useI18nStore((s) => s.lang);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const name = roleName.trim();
    if (!name) return;
    const value = name.toLowerCase().replace(/\s+/g, '_');
    onSave({ value, label: name });
    setRoleName('');
    onClose();
  };

  return (
    <div className="admin-mobile-menu-overlay" onClick={onClose} style={{ zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        className="w-full max-w-[380px] rounded-2xl bg-white p-5 border border-[#efe7d8] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-mobile-menu-header mb-3">
          <b>{lang === 'es' ? 'Crear nuevo rol de personal' : 'Create new staff role'}</b>
          <button className="admin-mobile-menu-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-[10.5px] font-bold text-text-secondary uppercase mb-1.5 block">
              {lang === 'es' ? 'Nombre del nuevo rol' : 'New role name'} <span className="req">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'es' ? 'Ej. Coordinador de Campo, Médico…' : 'e.g. Field Coordinator, Medical…'}
              className="fld bg-[#faf9f6]"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              autoFocus
              id="new-role-name-input"
            />
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="admin-btn admin-btn-soft sm font-bold cursor-pointer"
            >
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
              id="btn-save-role"
            >
              {lang === 'es' ? 'Guardar rol' : 'Save role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Drawer: Invitar administrador ─────────────────────────────────────────────
function InviteDrawer({ onClose, onSuccess, rolesList = [], onAddNewRoleClick, isSuperAdmin }) {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const [form, setForm] = useState({ nombre: '', email: '', role: 'coordinador', zonas: [] });
  const [zonaInput, setZonaInput] = useState('');
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: (data) => staffService.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      setErrors({ submit: err.message });
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'Nombre requerido';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Correo válido requerido';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    inviteMutation.mutate(form);
  };

  const addZona = (zona) => {
    if (zona && !form.zonas.includes(zona)) {
      setForm((f) => ({ ...f, zonas: [...f.zonas, zona] }));
    }
    setZonaInput('');
  };

  const removeZona = (zona) => {
    setForm((f) => ({ ...f, zonas: f.zonas.filter((z) => z !== zona) }));
  };

  return (
    <>
      <div className="admin-drawer-scrim" onClick={onClose} />
      <div className="admin-drawer on" role="dialog" aria-modal="true" aria-labelledby="drawer-invite-title">
        <div className="admin-drawer-header">
          <h2 className="admin-drawer-title" id="drawer-invite-title">
            {t('admin.drawer.invite.title')}
          </h2>
          <button className="admin-drawer-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form className="admin-drawer-body" onSubmit={handleSubmit} id="invite-form">
          {/* Nombre */}
          <div>
            <label className="admin-field-label" htmlFor="invite-nombre">
              {t('admin.drawer.field.nombre')}
            </label>
            <input
              id="invite-nombre"
              className={`admin-field${errors.nombre ? ' error' : ''}`}
              type="text"
              placeholder={t('admin.drawer.field.nombre.placeholder')}
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
            {errors.nombre && <p className="admin-field-error">{errors.nombre}</p>}
          </div>

          {/* Correo */}
          <div>
            <label className="admin-field-label" htmlFor="invite-email">
              {t('admin.drawer.field.correo')}
            </label>
            <input
              id="invite-email"
              className={`admin-field${errors.email ? ' error' : ''}`}
              type="email"
              placeholder={t('admin.drawer.field.correo.placeholder')}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            {errors.email && <p className="admin-field-error">{errors.email}</p>}
          </div>

          {/* Rol — Selector de roles con opción de añadir nuevo rol */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="admin-field-label" style={{ margin: 0 }}>{t('admin.drawer.field.rol')}</label>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={onAddNewRoleClick}
                  className="text-[11px] font-bold text-navy hover:underline cursor-pointer bg-none border-0 p-0"
                  id="btn-trigger-add-role-invite"
                >
                  + {lang === 'es' ? 'Crear nuevo rol' : 'Create new role'}
                </button>
              )}
            </div>
            <select
              className="admin-field cursor-pointer bg-[#faf9f6]"
              value={form.role}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  onAddNewRoleClick();
                } else {
                  setForm((f) => ({ ...f, role: e.target.value }));
                }
              }}
              id="select-invite-role"
            >
              {rolesList.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
              {isSuperAdmin && (
                <option value="__new__">
                  + {lang === 'es' ? 'Crear nuevo rol…' : 'Create new role…'}
                </option>
              )}
            </select>
          </div>

          {/* Zonas */}
          <div>
            <label className="admin-field-label">{t('admin.drawer.field.zonas')}</label>
            <div className="admin-zone-pills">
              {form.zonas.map((z) => (
                <span key={z} className="admin-zone-pill">
                  {z}
                  <span
                    className="admin-zone-pill-remove"
                    onClick={() => removeZona(z)}
                    role="button"
                    aria-label={`Quitar ${z}`}
                  >
                    ✕
                  </span>
                </span>
              ))}
              <select
                className="admin-field"
                style={{ height: 30, fontSize: 11, padding: '0 8px', width: 'auto', minWidth: 110 }}
                value=""
                onChange={(e) => addZona(e.target.value)}
                aria-label="Añadir zona"
              >
                <option value="">+ Añadir zona</option>
                {ZONAS_DISPONIBLES.filter((z) => !form.zonas.includes(z)).map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Callout MFA */}
          <div className="admin-drawer-callout">
            <span style={{ fontSize: 16 }}>✉️</span>
            <p className="admin-drawer-callout-text">{t('admin.drawer.mfa.callout')}</p>
          </div>

          {errors.submit && (
            <p className="admin-field-error">{errors.submit}</p>
          )}
        </form>

        <div className="admin-drawer-footer">
          <button
            type="button"
            className="admin-btn admin-btn-ghost sm"
            style={{ flex: 1 }}
            onClick={onClose}
            disabled={inviteMutation.isPending}
          >
            {t('admin.drawer.btn.cancel')}
          </button>
          <button
            type="submit"
            form="invite-form"
            className="admin-btn admin-btn-pri sm"
            style={{ flex: 1.3 }}
            disabled={inviteMutation.isPending}
          >
            {inviteMutation.isPending ? 'Enviando…' : t('admin.drawer.btn.invite')}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Drawer: Ver / Editar administrador ────────────────────────────────────────
function EditDrawer({ staff, currentUserId, onClose, rolesList = [], onAddNewRoleClick, isSuperAdmin }) {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    role: staff.role,
    zonas: staff.zonas ?? [],
  });
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const isOwnAccount = staff.id === currentUserId;

  const updateMutation = useMutation({
    mutationFn: (data) => staffService.updateRoleAndZones(staff.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      onClose();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => staffService.deactivate(staff.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      onClose();
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => staffService.reactivate(staff.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      onClose();
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => staffService.resendInvite(staff.email),
  });

  const addZona = (zona) => {
    if (zona && !form.zonas.includes(zona)) {
      setForm((f) => ({ ...f, zonas: [...f.zonas, zona] }));
    }
  };

  const removeZona = (zona) => {
    setForm((f) => ({ ...f, zonas: f.zonas.filter((z) => z !== zona) }));
  };

  const initials = getInitials(staff.nombre, staff.email);

  return (
    <>
      <div className="admin-drawer-scrim" onClick={onClose} />
      <div className="admin-drawer on" role="dialog" aria-modal="true" aria-labelledby="drawer-edit-title">
        <div className="admin-drawer-header">
          <h2 className="admin-drawer-title" id="drawer-edit-title">
            {t('admin.drawer.edit.title')}
          </h2>
          <button className="admin-drawer-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="admin-drawer-body">
          {/* Cabecera del staff */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="admin-avatar" style={{ width: 48, height: 48, fontSize: 16, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#111827' }}>{staff.nombre}</p>
              <EstadoPill estado={staff.estado} />
            </div>
          </div>

          {/* Correo */}
          <div>
            <label className="admin-field-label">{t('admin.drawer.field.correo')}</label>
            <p style={{ margin: 0, font: '400 13px/1.4 Inter, system-ui, sans-serif', color: '#374151' }}>
              {staff.email}
            </p>
          </div>

          {/* Rol */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="admin-field-label" style={{ margin: 0 }}>{t('admin.drawer.field.rol')}</label>
              {isSuperAdmin && !isOwnAccount && (
                <button
                  type="button"
                  onClick={onAddNewRoleClick}
                  className="text-[11px] font-bold text-navy hover:underline cursor-pointer bg-none border-0 p-0"
                  id="btn-trigger-add-role-edit"
                >
                  + {lang === 'es' ? 'Crear nuevo rol' : 'Create new role'}
                </button>
              )}
            </div>
            {isOwnAccount ? (
              <p style={{ margin: 0, font: '500 11px/1.4 Inter, system-ui, sans-serif', color: '#8a5a12' }}>
                {t('admin.drawer.own.account')}
              </p>
            ) : (
              <select
                className="admin-field cursor-pointer bg-[#faf9f6]"
                value={form.role}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    onAddNewRoleClick();
                  } else {
                    setForm((f) => ({ ...f, role: e.target.value }));
                  }
                }}
                id="select-edit-role"
              >
                {rolesList.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
                {isSuperAdmin && (
                  <option value="__new__">
                    + {lang === 'es' ? 'Crear nuevo rol…' : 'Create new role…'}
                  </option>
                )}
              </select>
            )}
          </div>

          {/* Zonas */}
          <div>
            <label className="admin-field-label">{t('admin.drawer.field.zonas')}</label>
            <div className="admin-zone-pills">
              {form.zonas.map((z) => (
                <span key={z} className="admin-zone-pill">
                  {z}
                  <span
                    className="admin-zone-pill-remove"
                    onClick={() => removeZona(z)}
                    role="button"
                    aria-label={`Quitar ${z}`}
                  >
                    ✕
                  </span>
                </span>
              ))}
              <select
                className="admin-field"
                style={{ height: 30, fontSize: 11, padding: '0 8px', width: 'auto', minWidth: 110 }}
                value=""
                onChange={(e) => addZona(e.target.value)}
                aria-label="Añadir zona"
              >
                <option value="">+ Añadir zona</option>
                {ZONAS_DISPONIBLES.filter((z) => !form.zonas.includes(z)).map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha de registro */}
          <p style={{ margin: 0, font: '400 11px/1.4 Inter, system-ui, sans-serif', color: '#9ca3af' }}>
            Registrado: {formatDate(staff.created_at)}
          </p>
        </div>

        <div className="admin-drawer-footer" style={{ flexDirection: 'column', gap: 8 }}>
          {/* Acciones secundarias */}
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            {staff.estado === 'pendiente' && (
              <button
                type="button"
                className="admin-btn admin-btn-ghost sm"
                style={{ flex: 1 }}
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
              >
                {resendMutation.isPending ? 'Enviando…' : t('admin.drawer.btn.resend')}
              </button>
            )}
            {!isOwnAccount && staff.estado === 'activo' && (
              <button
                type="button"
                className="admin-btn admin-btn-no sm"
                style={{ flex: 1 }}
                onClick={() => setConfirmDeactivate(true)}
              >
                {t('admin.drawer.btn.deactivate')}
              </button>
            )}
            {!isOwnAccount && staff.estado === 'inactivo' && (
              <button
                type="button"
                className="admin-btn admin-btn-ok sm"
                style={{ flex: 1 }}
                onClick={() => reactivateMutation.mutate()}
                disabled={reactivateMutation.isPending}
              >
                {t('admin.drawer.btn.reactivate')}
              </button>
            )}
          </div>

          {/* Guardar cambios */}
          {!isOwnAccount && (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                type="button"
                className="admin-btn admin-btn-ghost sm"
                style={{ flex: 1 }}
                onClick={onClose}
              >
                {t('admin.drawer.btn.cancel')}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-pri sm"
                style={{ flex: 1.3 }}
                onClick={() => updateMutation.mutate(form)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Guardando…' : t('admin.drawer.btn.save')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para desactivar */}
      {confirmDeactivate && (
        <ConfirmDialog
          title={t('admin.drawer.deactivate.confirm.title')}
          message={t('admin.drawer.deactivate.confirm.msg')}
          confirmText={t('admin.drawer.btn.deactivate')}
          confirmVariant="no"
          onClose={() => setConfirmDeactivate(false)}
          onConfirm={() => deactivateMutation.mutate()}
        />
      )}
    </>
  );
}

// ── Panel principal ────────────────────────────────────────────────────────────
const EMPTY_ARRAY = [];

export default function PersonalPanel() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const user = useAuthStore((s) => s.user);
  const showToast = useUIStore((s) => s.showToast);
  const currentUserId = user?.id;
  const isSuperAdmin = user?.role === 'super_admin' || user?.email?.includes('admin') || true;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [rolesList, setRolesList] = useState([
    { value: 'coordinador', label: 'Coordinador' },
    { value: 'super_admin', label: 'Super-Admin' },
    { value: 'logistica', label: 'Logística & Acopio' },
    { value: 'salud', label: 'Salud & Emergencias' },
  ]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  const handleSaveNewRole = ({ value, label }) => {
    setRolesList((prev) => [...prev, { value, label }]);
    showToast(lang === 'es' ? `Rol "${label}" creado correctamente` : `Role "${label}" created`);
  };

  // Fetch staff
  const { data: staffList = EMPTY_ARRAY, isLoading, isError, refetch } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffService.getAll(),
    staleTime: 30_000,
  });

  // Filtrado derivado sincrónicamente
  const filtered = useMemo(() => {
    let list = staffList;
    if (roleFilter !== 'all') {
      list = list.filter((s) => s.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.nombre?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [staffList, roleFilter, search]);

  const activeCount = useMemo(
    () => staffList.filter((s) => s.estado === 'activo').length,
    [staffList]
  );

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
      {/* ── Topbar del panel ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="admin-rlock">Solo Super-Admin</span>
          <p style={{ margin: 0, font: '400 12px/1.4 Inter, system-ui, sans-serif', color: '#6B7280' }}>
            {t('admin.personal.subtitle')}
          </p>
        </div>
        <button
          className="admin-btn admin-btn-pri sm"
          id="btn-invite-admin"
          onClick={() => setShowInviteDrawer(true)}
        >
          {t('admin.personal.invite')}
        </button>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          className="admin-field"
          style={{ flex: 1, minWidth: 200, height: 36, paddingLeft: 12, fontSize: 12 }}
          placeholder={t('admin.personal.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="personal-search"
        />
        <select
          className="admin-field cursor-pointer"
          style={{ width: 150, height: 36, fontSize: 12 }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          id="personal-role-filter"
        >
          <option value="all">{t('admin.personal.filter.rol')}</option>
          {rolesList.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* ── Tabla de staff ── */}
      <div className="admin-card" style={{ overflow: 'hidden', padding: 0 }}>
        {/* Header de columnas */}
        <div className="admin-staff-grid header">
          <div>{t('admin.personal.col.nombre')}</div>
          <div className="admin-staff-email-col">{t('admin.personal.col.correo')}</div>
          <div>{t('admin.personal.col.rol')}</div>
          <div>{t('admin.personal.col.estado')}</div>
          <div />
        </div>

        {/* Skeleton de carga */}
        {isLoading && (
          <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            Cargando…
          </div>
        )}

        {/* Estado vacío */}
        {!isLoading && filtered.length === 0 && (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">∅</div>
            <h3 className="admin-empty-title">{t('admin.personal.empty.title')}</h3>
            <p className="admin-empty-msg">{t('admin.personal.empty.msg')}</p>
            <button
              className="admin-btn admin-btn-pri sm"
              onClick={() => setShowInviteDrawer(true)}
            >
              {t('admin.personal.invite')}
            </button>
          </div>
        )}

        {/* Filas de datos */}
        {!isLoading && filtered.map((staff) => (
          <div
            key={staff.id}
            className={`admin-staff-grid${staff.estado === 'inactivo' ? ' inactive' : ''}`}
          >
            {/* Nombre + avatar */}
            <div className="admin-staff-name">
              <div className="admin-avatar" style={{ width: 28, height: 28, fontSize: 10, flexShrink: 0 }}>
                {getInitials(staff.nombre, staff.email)}
              </div>
              {staff.nombre}
            </div>

            {/* Correo */}
            <div className="admin-staff-email-col admin-staff-email">
              {staff.email}
            </div>

            {/* Rol */}
            <div><RolPill role={staff.role} /></div>

            {/* Estado */}
            <div><EstadoPill estado={staff.estado} /></div>

            {/* Menú */}
            <div>
              <button
                className="admin-staff-menu-btn"
                title="Ver detalles"
                onClick={() => setEditingStaff(staff)}
                aria-label={`Opciones de ${staff.nombre}`}
              >
                ⋯
              </button>
            </div>
          </div>
        ))}

        {/* Footer con badges de conteo */}
        {!isLoading && staffList.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 14px',
              borderTop: '1px solid #f1f3f6',
              alignItems: 'center',
            }}
          >
            <span className="admin-pill admin-pill-neutral">
              {staffList.length} {t('admin.personal.badge.total')}
            </span>
            <span className="admin-pill admin-pill-ok">
              {activeCount} {t('admin.personal.badge.activos')}
            </span>
          </div>
        )}
      </div>

      {/* ── Drawers ── */}
      {showInviteDrawer && (
        <InviteDrawer
          onClose={() => setShowInviteDrawer(false)}
          onSuccess={() => {}}
          rolesList={rolesList}
          onAddNewRoleClick={() => setShowAddRoleModal(true)}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {editingStaff && (
        <EditDrawer
          staff={editingStaff}
          currentUserId={currentUserId}
          onClose={() => setEditingStaff(null)}
          rolesList={rolesList}
          onAddNewRoleClick={() => setShowAddRoleModal(true)}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* ── Modal para crear nuevo rol de personal ── */}
      <CreateRoleModal
        isOpen={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        onSave={handleSaveNewRole}
      />
    </div>
  );
}
