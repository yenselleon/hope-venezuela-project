// src/components/admin/SuperAdminRoute.jsx
// Guard de acceso exclusivo para super_admin.
// Si el usuario tiene rol 'coordinador', muestra el estado 403 en lugar del contenido.
// Evita acceso directo por URL a paneles restringidos (/admin/personal, /admin/permisos).

import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ForbiddenPanel } from '@/pages/admin/ForbiddenPanel';

/**
 * Wrapper que protege rutas exclusivas de super_admin.
 * El sidebar ya oculta visualmente los items, este componente
 * actúa como segunda línea de defensa para acceso por URL directa.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function SuperAdminRoute({ children }) {
  const role = useAuthStore((s) => s.role);

  if (role !== 'super_admin') {
    return <ForbiddenPanel />;
  }

  return children;
}
