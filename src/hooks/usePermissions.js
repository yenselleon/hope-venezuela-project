// src/hooks/usePermissions.js
// Custom Hook para verificación centralizada de permisos y RBAC (Fase 4 Gobernanza).
// Evalúa jerárquicamente: Super-Admin -> Permisos por Usuario -> Permisos por Rol.

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { rbacService } from '@/services/rbacService';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role) || 'coordinador';

  const isSuperAdmin = useMemo(() => {
    return role === 'super_admin' || user?.email === 'voluntariosrsg@gmail.com' || user?.email === 'yensel41@gmail.com';
  }, [role, user]);

  // 1. Obtener matriz general de permisos
  const { data: rolePermissions = [] } = useQuery({
    queryKey: ['rbac-permissions'],
    queryFn: () => rbacService.getPermissions(),
    staleTime: 60_000,
  });

  // 2. Obtener permisos específicos configurados para este usuario
  const { data: userCustomPermissions = [] } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: () => rbacService.getUserPermissions(user?.id),
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const can = useMemo(() => {
    return (action) => {
      // 1. Super-Admin siempre tiene acceso total
      if (isSuperAdmin) return true;

      // 2. Permiso específico asignado al usuario individual
      if (Array.isArray(userCustomPermissions) && userCustomPermissions.includes(action)) {
        return true;
      }

      // 3. Permiso general del rol en la matriz RBAC
      const match = rolePermissions.find((p) => p.role === role && p.action === action);
      if (match) {
        return !!match.allowed;
      }

      // Por defecto restringido para acciones sensibles si no está explicitado
      return false;
    };
  }, [isSuperAdmin, userCustomPermissions, rolePermissions, role]);

  return {
    isSuperAdmin,
    can,
    canEditInventory: can('edit_inventory'),
    canDeleteInventory: can('delete_inventory'),
    canManageCategories: can('manage_categories'),
    canManageInventory: can('manage_inventory'),
    userCustomPermissions,
  };
}
