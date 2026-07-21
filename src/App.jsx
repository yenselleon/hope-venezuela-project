// src/App.jsx
// Componente raíz de la aplicación.
// Configura TanStack Query Client y React Router.
// Rutas públicas: Landing, Registro, Donar.
// Rutas admin: Login (standalone), AdminLayout shell con nested panels.

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Landing } from '@/pages/Landing';
import { Registro } from '@/pages/Registro';
import { Donar } from '@/pages/Donar';
import { Toast } from '@/components/ui/Toast';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { SuperAdminRoute } from '@/components/admin/SuperAdminRoute';
import { useAuth } from '@/hooks/useAuth';

// Lazy load admin views — no las carga hasta que se navega a /admin
const Login = lazy(() => import('@/pages/admin/Login'));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const DashboardPanel = lazy(() => import('@/pages/admin/DashboardPanel'));
const VoluntariosPanel = lazy(() => import('@/pages/admin/VoluntariosPanel'));
const AprobacionPanel = lazy(() => import('@/pages/admin/AprobacionPanel'));
const MapeoPanel = lazy(() => import('@/pages/admin/MapeoPanel'));
const InventarioPanel = lazy(() => import('@/pages/admin/InventarioPanel'));
const AnaliticaPanel = lazy(() => import('@/pages/admin/AnaliticaPanel'));
// Fase 4 — Gobernanza
const PersonalPanel = lazy(() => import('@/pages/admin/PersonalPanel'));
const PermisosPanel = lazy(() => import('@/pages/admin/PermisosPanel'));
const PerfilPanel = lazy(() => import('@/pages/admin/PerfilPanel'));

// Inicializar el cliente de TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Layout público: Header + contenido + Footer.
 */
function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <div className="flex-grow">{children}</div>
      <Footer />
    </>
  );
}

/**
 * Fallback de carga para las vistas admin (lazy loaded).
 */
function AdminLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef1f4' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #003366', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

function AppRoutes() {
  // Inicializa la suscripción a auth state (suscripción con cleanup — uso válido de useEffect)
  useAuth();

  return (
    <Routes>
      {/* ── Rutas públicas ── */}
      <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
      <Route path="/registro" element={<PublicLayout><Registro /></PublicLayout>} />
      <Route path="/donar" element={<PublicLayout><Donar /></PublicLayout>} />

      {/* ── Login admin (standalone, sin AdminLayout) ── */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<AdminLoader />}>
            <Login />
          </Suspense>
        }
      />

      {/* ── Admin shell con nested routes ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminLoader />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<AdminLoader />}><DashboardPanel /></Suspense>} />
        <Route path="voluntarios" element={<Suspense fallback={<AdminLoader />}><VoluntariosPanel /></Suspense>} />
        <Route path="aprobacion" element={<Suspense fallback={<AdminLoader />}><AprobacionPanel /></Suspense>} />
        <Route path="mapeo" element={<Suspense fallback={<AdminLoader />}><MapeoPanel /></Suspense>} />
        <Route path="inventario" element={<Suspense fallback={<AdminLoader />}><InventarioPanel /></Suspense>} />
        <Route path="analitica" element={<Suspense fallback={<AdminLoader />}><AnaliticaPanel /></Suspense>} />
        {/* Fase 4 — Gobernanza */}
        <Route
          path="personal"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<AdminLoader />}><PersonalPanel /></Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="permisos"
          element={
            <SuperAdminRoute>
              <Suspense fallback={<AdminLoader />}><PermisosPanel /></Suspense>
            </SuperAdminRoute>
          }
        />
        <Route path="perfil" element={<Suspense fallback={<AdminLoader />}><PerfilPanel /></Suspense>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <AppRoutes />
          <Toast />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
