// src/pages/admin/PerfilPanel.jsx
// Perfil y cuenta de usuario — Fase 4 Gobernanza §7.16
// Disponible para cualquier administrador (coordinador o super_admin)
// Diseño pixel-perfect según wireframe Fase 4 #1d

import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { authService } from '@/services/authService';

function getInitials(user) {
  if (!user) return '??';
  const name = user.user_metadata?.nombre || user.email?.split('@')[0] || '';
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getDisplayName(user) {
  if (!user) return '';
  return user.user_metadata?.nombre || user.email?.split('@')[0] || '';
}

// ── Sección: Datos de la cuenta ───────────────────────────────────────────────
function AccountSection({ user }) {
  const t = useI18nStore((s) => s.t);
  const addToast = useUIStore((s) => s.addToast);

  const [nombre, setNombre] = useState(getDisplayName(user));
  const [saved, setSaved] = useState(false);

  const saveMutation = useMutation({
    mutationFn: () => authService.updateProfile({ nombre }),
    onSuccess: () => {
      setSaved(true);
      addToast({ message: t('admin.perfil.saved'), type: 'success' });
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (err) => {
      addToast({ message: err.message, type: 'error' });
    },
  });

  return (
    <div className="admin-card" style={{ padding: '16px 18px' }}>
      <p className="admin-profile-section-title">{t('admin.perfil.section.account')}</p>
      <div className="admin-profile-fields">
        <div>
          <label className="admin-field-label" htmlFor="perfil-nombre">
            {t('admin.perfil.field.nombre')}
          </label>
          <input
            id="perfil-nombre"
            className="admin-field"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-field-label" htmlFor="perfil-correo">
            {t('admin.perfil.field.correo')}
          </label>
          <input
            id="perfil-correo"
            className="admin-field"
            type="email"
            value={user?.email ?? ''}
            disabled
            style={{ opacity: .65, cursor: 'not-allowed' }}
          />
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="admin-btn admin-btn-pri sm"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || nombre === getDisplayName(user)}
        >
          {saved ? t('admin.perfil.saved') : (saveMutation.isPending ? 'Guardando…' : t('admin.perfil.save'))}
        </button>
      </div>
    </div>
  );
}

// ── Sección: Contraseña ───────────────────────────────────────────────────────
function PasswordSection() {
  const t = useI18nStore((s) => s.t);
  const addToast = useUIStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ new: '', confirm: '' });
  const [error, setError] = useState('');

  const changeMutation = useMutation({
    mutationFn: () => authService.changePassword(form.new),
    onSuccess: () => {
      setOpen(false);
      setForm({ new: '', confirm: '' });
      setError('');
      addToast({ message: 'Contraseña actualizada correctamente', type: 'success' });
    },
    onError: (err) => {
      addToast({ message: err.message, type: 'error' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.new.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (form.new !== form.confirm) { setError(t('admin.perfil.password.mismatch')); return; }
    setError('');
    changeMutation.mutate();
  };

  return (
    <div className="admin-card" style={{ padding: '16px 18px' }}>
      <div className="admin-profile-row">
        <div>
          <p className="admin-profile-row-label">{t('admin.perfil.section.password')}</p>
          <p className="admin-profile-row-sub">
            {t('admin.perfil.password.last')} ●●●
          </p>
        </div>
        <button
          className="admin-btn admin-btn-ghost sm"
          onClick={() => setOpen((o) => !o)}
          id="btn-change-password"
        >
          {t('admin.perfil.password.change')}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label className="admin-field-label" htmlFor="perfil-pwd-new">
              {t('admin.perfil.password.new')}
            </label>
            <input
              id="perfil-pwd-new"
              className="admin-field"
              type="password"
              placeholder="••••••••"
              value={form.new}
              onChange={(e) => setForm((f) => ({ ...f, new: e.target.value }))}
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="admin-field-label" htmlFor="perfil-pwd-confirm">
              {t('admin.perfil.password.confirm')}
            </label>
            <input
              id="perfil-pwd-confirm"
              className="admin-field"
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              required
            />
          </div>
          {error && <p className="admin-field-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="admin-btn admin-btn-ghost sm"
              onClick={() => { setOpen(false); setForm({ new: '', confirm: '' }); setError(''); }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-pri sm"
              disabled={changeMutation.isPending}
            >
              {changeMutation.isPending ? 'Guardando…' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Sección: MFA ──────────────────────────────────────────────────────────────
function MFASection() {
  const t = useI18nStore((s) => s.t);

  return (
    <div className="admin-card" style={{ padding: '16px 18px' }}>
      <div className="admin-profile-row">
        <div>
          <p className="admin-profile-row-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t('admin.perfil.section.mfa')}
            <span className="admin-pill admin-pill-warn" style={{ fontSize: 10 }}>
              Próximamente
            </span>
          </p>
          <p className="admin-profile-row-sub">
            {t('admin.perfil.mfa.future')}
          </p>
        </div>
        <button
          className="admin-btn admin-btn-ghost sm"
          disabled
          style={{ opacity: .5, cursor: 'not-allowed' }}
        >
          {t('admin.perfil.mfa.manage')}
        </button>
      </div>
    </div>
  );
}

// ── Sección: Idioma ───────────────────────────────────────────────────────────
function LangSection() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);

  return (
    <div className="admin-card" style={{ padding: '16px 18px' }}>
      <div className="admin-profile-row">
        <p className="admin-profile-row-label">{t('admin.perfil.section.lang')}</p>
        <div className="admin-segbtn" role="group" aria-label="Seleccionar idioma">
          <button
            className={`admin-segbtn-opt${lang === 'es' ? ' active' : ''}`}
            onClick={() => setLang('es')}
            id="btn-lang-es"
          >
            ES
          </button>
          <button
            className={`admin-segbtn-opt${lang === 'en' ? ' active' : ''}`}
            onClick={() => setLang('en')}
            id="btn-lang-en"
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Panel principal ────────────────────────────────────────────────────────────
export default function PerfilPanel() {
  const t = useI18nStore((s) => s.t);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const initials = useMemo(() => getInitials(user), [user]);
  const displayName = useMemo(() => getDisplayName(user), [user]);

  const roleLabel = role === 'super_admin' ? 'Super-Admin' : 'Coordinador';
  const rolePillClass = role === 'super_admin' ? 'admin-pill admin-pill-crit' : 'admin-pill admin-pill-info';

  return (
    <div className="admin-panel admin-fade">
      <div style={{ maxWidth: 640 }}>
      {/* ── Cabecera de perfil ── */}
      <div className="admin-card" style={{ padding: '20px 20px 16px' }}>
        <div className="admin-profile-header">
          {/* Avatar grande */}
          <div className="admin-avatar-lg">{initials}</div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <p className="admin-profile-name">{displayName}</p>
            <span className={rolePillClass}>{roleLabel}</span>
          </div>

          {/* Cambiar foto — solo iniciales por ahora */}
          <button
            className="admin-btn admin-btn-ghost"
            style={{ fontSize: 11, padding: '0 10px', height: 28, opacity: .6, cursor: 'default' }}
            title="Función disponible próximamente"
            disabled
          >
            {t('admin.perfil.change.photo')}
          </button>
        </div>
      </div>

      {/* ── Secciones de configuración ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        <AccountSection user={user} />
        <PasswordSection />
        <MFASection />
        <LangSection />
      </div>
    </div>
  </div>
);
}
