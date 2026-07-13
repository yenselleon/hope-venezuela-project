// src/pages/admin/Login.jsx
// ──────────────────────────────────────────────────────────
// Split-layout login page matching Admin.dc.html design.
// Left: branding panel (hidden on mobile).
// Right: login form with email + password + eye toggle.
// Uses useMutation + authService.signIn for auth.
// ──────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/useAuthStore';
import { useI18nStore } from '@/stores/useI18nStore';
import logoHeart from '@/assets/logo-heart.png';
import './Admin.css';

export default function Login() {
  const t = useI18nStore((s) => s.t);
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authService.signIn(email, password),
    onSuccess: (data) => {
      if (data?.session) {
        setSession(data.session);
      }
      navigate('/admin', { replace: true });
    },
  });

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      loginMutation.mutate({ email: email.trim(), password: password.trim() });
    },
    [email, password, loginMutation]
  );

  return (
    <div className="admin-login-split">
      {/* ── Left Branding Panel ── */}
      <div className="admin-login-left">
        <div className="admin-login-left-logo">
          <img src={logoHeart} width="34" height="34" alt="" />
          <b>Hope · Admin</b>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="admin-login-flags">
            <i className="admin-login-flag" style={{ background: '#FCD116' }} />
            <i className="admin-login-flag" style={{ background: '#4a90d9' }} />
            <i className="admin-login-flag" style={{ background: '#CF142B' }} />
          </span>
          <h1>{t('admin.login.console.title')}</h1>
          <p>{t('admin.login.console.desc')}</p>
        </div>

        <span className="admin-login-tagline">{t('admin.login.tagline')}</span>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="admin-login-right">
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div>
            <h2>{t('admin.login.heading')}</h2>
            <p className="admin-login-subtitle">{t('admin.login.subtitle')}</p>
          </div>

          {/* Error banner */}
          {loginMutation.isError && (
            <div className="admin-login-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b02a24" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>{t('admin.login.error')}</span>
            </div>
          )}

          {/* Email */}
          <div className="admin-login-field-group">
            <label className="admin-th">{t('admin.login.email.label')}</label>
            <input
              className="admin-field"
              type="email"
              placeholder="tu@correo.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="admin-login-field-group">
            <label className="admin-th">{t('admin.login.password.label')}</label>
            <div className="admin-login-pw-wrap">
              <input
                className="admin-field"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-login-eye"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="admin-login-forgot">
            <a href="#">{t('admin.login.forgot')}</a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="admin-btn admin-btn-pri"
            style={{ width: '100%', marginTop: 2 }}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? t('admin.login.loading') : t('admin.login.submit')}
          </button>

          {/* Lock meta */}
          <div className="admin-login-meta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            {t('admin.login.adminOnly')}
          </div>

          {/* Back to public */}
          <Link to="/" className="admin-login-back">
            ← {t('admin.login.backPublic')}
          </Link>
        </form>
      </div>
    </div>
  );
}
