// src/components/admin/AdminLayout.jsx
// ──────────────────────────────────────────────────────────
// App shell for admin panel: sidebar + topbar + content.
// Sidebar: nav items with SVG icons, user info, logout.
// Topbar: title, search, zone filter, lang toggle, bell.
// Mobile: bottom tab bar replaces sidebar.
// ──────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { useI18nStore } from '@/stores/useI18nStore';
import { authService } from '@/services/authService';
import { volunteerService } from '@/services/volunteerService';
import { inventarioService } from '@/services/inventarioService';
import logoHeart from '@/assets/logo-heart.png';
import '@/pages/admin/Admin.css';

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

/** Derive page title key from pathname */
function usePanelTitle(pathname) {
  const t = useI18nStore((s) => s.t);
  if (pathname.includes('/aprobacion')) return t('admin.nav.aprobacion.title');
  if (pathname.includes('/voluntarios')) return t('admin.nav.voluntarios');
  if (pathname.includes('/mapeo')) return t('admin.nav.mapeo.title');
  if (pathname.includes('/inventario')) return t('admin.nav.inventario');
  if (pathname.includes('/analitica')) return t('admin.nav.analitica.title');
  return 'Dashboard';
}

/** Extract user initials from email or name */
function getInitials(user) {
  if (!user) return '??';
  const email = user.email || '';
  const name = user.user_metadata?.nombre || email.split('@')[0] || '';
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getDisplayName(user) {
  if (!user) return '';
  return user.user_metadata?.nombre || user.email?.split('@')[0] || '';
}

// ── SVG Icon Components ──────────────────────────────────────
function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}

function IconVoluntarios() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

function IconAprobacion() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconInventario() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" />
    </svg>
  );
}

function IconPersonal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a9b3" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();

  const pageTitle = usePanelTitle(location.pathname);
  const initials = useMemo(() => getInitials(user), [user]);
  const displayName = useMemo(() => getDisplayName(user), [user]);

  // Fetch pending count for sidebar badge
  const { data: pendingData } = useQuery({
    queryKey: ['volunteers', 'pending-count'],
    queryFn: () => volunteerService.getAll({ estado_voluntario: 'pendiente', pageSize: 1 }),
    select: (res) => res.total,
    staleTime: 30_000,
  });
  const pendingCount = pendingData ?? 0;

  // Fetch inventory items to calculate alert badges in sidebar/menu
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventario', { sidebarCount: true }],
    queryFn: () => inventarioService.getAll(),
    staleTime: 30_000,
  });

  const inventoryAlertCount = useMemo(() => {
    let count = 0;
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    inventoryItems.forEach((i) => {
      if (i.cantidad <= i.stock_minimo) {
        count++;
      } else if (i.fecha_vencimiento) {
        const expDate = new Date(i.fecha_vencimiento);
        if (expDate >= today && expDate <= in30Days) {
          count++;
        }
      }
    });
    return count;
  }, [inventoryItems]);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      navigate('/admin/login', { replace: true });
    },
    onError: () => {
      clearSession();
      navigate('/admin/login', { replace: true });
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Active detection
  const currentView = useMemo(() => {
    if (location.pathname.includes('/aprobacion')) return 'aprobacion';
    if (location.pathname.includes('/voluntarios')) return 'voluntarios';
    if (location.pathname.includes('/mapeo')) return 'mapeo';
    if (location.pathname.includes('/inventario')) return 'inventario';
    if (location.pathname.includes('/analitica')) return 'analitica';
    return 'dashboard';
  }, [location.pathname]);

  const handleNav = useCallback(
    (view) => {
      const routes = {
        dashboard: '/admin',
        voluntarios: '/admin/voluntarios',
        aprobacion: '/admin/aprobacion',
        mapeo: '/admin/mapeo',
        inventario: '/admin/inventario',
        analitica: '/admin/analitica'
      };
      navigate(routes[view] || '/admin');
    },
    [navigate]
  );

  const toggleLang = useCallback(() => {
    setLang(lang === 'es' ? 'en' : 'es');
  }, [lang, setLang]);

  return (
    <div className="admin-shell">
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src={logoHeart} width="30" height="30" alt="" />
          <b>Hope · Admin</b>
        </div>

        {/* Nav items */}
        <button
          className={`admin-nav${currentView === 'dashboard' ? ' on' : ''}`}
          onClick={() => handleNav('dashboard')}
        >
          <IconDashboard />
          Dashboard
        </button>

        <button
          className={`admin-nav${currentView === 'voluntarios' ? ' on' : ''}`}
          onClick={() => handleNav('voluntarios')}
        >
          <IconVoluntarios />
          {t('admin.nav.voluntarios')}
        </button>

        <button
          className={`admin-nav${currentView === 'aprobacion' ? ' on' : ''}`}
          onClick={() => handleNav('aprobacion')}
        >
          <IconAprobacion />
          {t('admin.nav.aprobacion')}
          {pendingCount > 0 && (
            <span className="admin-pill admin-pill-crit admin-nav-badge">{pendingCount}</span>
          )}
        </button>

        <button
          className={`admin-nav${currentView === 'mapeo' ? ' on' : ''}`}
          onClick={() => handleNav('mapeo')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
          {t('admin.nav.mapeo')}
        </button>

        <button
          className={`admin-nav${currentView === 'inventario' ? ' on' : ''}`}
          onClick={() => handleNav('inventario')}
        >
          <IconInventario />
          {t('admin.nav.inventario')}
          {inventoryAlertCount > 0 && (
            <span className="admin-pill admin-pill-crit admin-nav-badge">{inventoryAlertCount}</span>
          )}
        </button>

        <button
          className={`admin-nav${currentView === 'analitica' ? ' on' : ''}`}
          onClick={() => handleNav('analitica')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          {t('admin.nav.analitica')}
        </button>

        <div className="admin-nav dis">
          <IconPersonal />
          {t('admin.nav.personal')}
          <span className="admin-nav-phase">Fase 4</span>
        </div>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
              <span className="admin-sidebar-user-name">{displayName}</span>
              <span className="admin-sidebar-user-role">{role === 'super_admin' ? 'Super Admin' : t('admin.role.coordinador')}</span>
            </div>
          </div>

          <button className="admin-nav admin-sidebar-logout" onClick={handleLogout}>
            <IconLogout />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <h1>{pageTitle}</h1>

          <div className="admin-top-search">
            <IconSearch />
            <input
              className="admin-field"
              placeholder={t('admin.search')}
              style={{ height: 38, paddingLeft: 34, fontSize: 13 }}
              id="admin-global-search"
            />
          </div>

          <div className="admin-top-extra">
            <div className="admin-btn admin-btn-ghost sm">
              {t('admin.filter.zona')} ▾
            </div>
            <div className="admin-btn admin-btn-ghost sm">
              {t('admin.topbar.last7days')} ▾
            </div>

            {/* Language toggle */}
            <div className="admin-lngtog" onClick={toggleLang} role="button" tabIndex={0}>
              <span className={lang === 'es' ? 'admin-lngtog-active' : 'admin-lngtog-inactive'}>ES</span>
              <span className={lang === 'en' ? 'admin-lngtog-active' : 'admin-lngtog-inactive'}>EN</span>
            </div>

            {/* Bell */}
            <div className="admin-bell">
              <IconBell />
              {pendingCount > 0 && <span className="admin-bell-badge">{pendingCount}</span>}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* ── MOBILE BOTTOM TABS ── */}
      <nav className="admin-mtabs">
        <button
          className={`admin-mtab${currentView === 'dashboard' && !isMobileMenuOpen ? ' on' : ''}`}
          onClick={() => {
            setIsMobileMenuOpen(false);
            handleNav('dashboard');
          }}
        >
          <IconDashboard />
          Panel
        </button>
        <button
          className={`admin-mtab${currentView === 'voluntarios' && !isMobileMenuOpen ? ' on' : ''}`}
          onClick={() => {
            setIsMobileMenuOpen(false);
            handleNav('voluntarios');
          }}
        >
          <IconVoluntarios />
          {t('admin.nav.voluntarios')}
        </button>
        <button
          className={`admin-mtab${currentView === 'aprobacion' && !isMobileMenuOpen ? ' on' : ''}`}
          onClick={() => {
            setIsMobileMenuOpen(false);
            handleNav('aprobacion');
          }}
        >
          <IconAprobacion />
          {t('admin.nav.aprobar')}
          {pendingCount > 0 && <span className="admin-mtab-badge">{pendingCount}</span>}
        </button>
        <button
          className={`admin-mtab${isMobileMenuOpen ? ' on' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <IconMenu />
          {t('admin.nav.mas')}
        </button>
      </nav>

      {/* ── MOBILE MENU OVERLAY & SHEET ── */}
      {isMobileMenuOpen && (
        <div className="admin-mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="admin-mobile-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="admin-mobile-menu-header">
              <b>{t('admin.nav.mas')}</b>
              <button className="admin-mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>
            <div className="admin-mobile-menu-body">
              {/* Profile Card */}
              <div className="admin-mobile-menu-user">
                <div className="admin-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>
                  {initials}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                  <span className="admin-mobile-menu-user-name">{displayName}</span>
                  <span className="admin-sidebar-user-role">{role === 'super_admin' ? 'Super Admin' : t('admin.role.coordinador')}</span>
                </div>
              </div>

              {/* Extra nav items (Fase 3 & 4) */}
              <div className="admin-mobile-menu-navs">
                <div
                  className="admin-mobile-menu-nav-item"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNav('mapeo');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17, color: '#6b7280' }}>
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  </svg>
                  <span>{t('admin.nav.mapeo')}</span>
                </div>
                <div
                  className="admin-mobile-menu-nav-item"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNav('inventario');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <IconInventario />
                  <span>{t('admin.nav.inventario')}</span>
                </div>
                <div
                  className="admin-mobile-menu-nav-item"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNav('analitica');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17, color: '#6b7280' }}>
                    <path d="M3 3v18h18" />
                    <path d="M18 17V9" />
                    <path d="M13 17V5" />
                    <path d="M8 17v-3" />
                  </svg>
                  <span>{t('admin.nav.analitica')}</span>
                </div>
                <div className="admin-mobile-menu-nav-item dis">
                  <IconPersonal />
                  <span>{t('admin.nav.personal')}</span>
                  <span className="admin-nav-phase">Fase 4</span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="admin-mobile-menu-lang">
                <span className="admin-mobile-menu-lang-label">Idioma / Language</span>
                <div className="admin-lngtog" onClick={toggleLang} role="button" tabIndex={0}>
                  <span className={lang === 'es' ? 'admin-lngtog-active' : 'admin-lngtog-inactive'}>ES</span>
                  <span className={lang === 'en' ? 'admin-lngtog-active' : 'admin-lngtog-inactive'}>EN</span>
                </div>
              </div>

              {/* Logout */}
              <button className="admin-mobile-menu-logout" onClick={handleLogout}>
                <IconLogout />
                {t('admin.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
