// src/components/admin/ProtectedRoute.jsx
// Wrapper que protege rutas del panel admin.
// Redirige a /admin/login si no hay sesión autenticada.
// Muestra skeleton mientras se verifica la sesión inicial.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Mientras se verifica la sesión inicial, mostrar skeleton
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef1f4' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #003366', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Si no hay sesión, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
