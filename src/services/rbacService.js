// src/services/rbacService.js
// Servicio de gestión de permisos RBAC — Fase 4 Gobernanza.
// Solo retorna datos o lanza errores. No modifica estado ni UI.

import { supabase } from '@/lib/supabase';

export const rbacService = {
  /**
   * Obtiene la matriz completa de permisos.
   * @returns {Promise<Array>} Array de { role, action, allowed, locked }
   */
  getPermissions: async () => {
    const { data, error } = await supabase
      .from('rbac_permissions')
      .select('*')
      .order('action');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /**
   * Guarda cambios en la matriz de permisos y registra en auditoría.
   * Solo puede modificar permisos no bloqueados (locked = false).
   * @param {Array<{role: string, action: string, allowed: boolean}>} changes Cambios a aplicar
   * @param {string} userId UUID del super_admin que realiza el cambio
   */
  savePermissions: async (changes, userId) => {
    // 1. Aplicar cada cambio via upsert
    for (const change of changes) {
      const { error } = await supabase
        .from('rbac_permissions')
        .update({ allowed: change.allowed })
        .eq('role', change.role)
        .eq('action', change.action)
        .eq('locked', false); // RLS también protege, esto es doble seguro
      if (error) throw new Error(error.message);
    }

    // 2. Registrar en auditoría
    const { error: auditError } = await supabase
      .from('rbac_audit_log')
      .insert({
        changed_by: userId,
        changes: changes.map((c) => ({
          action: c.action,
          role: c.role,
          old_value: c.old_value,
          new_value: c.allowed,
        })),
      });
    if (auditError) throw new Error(auditError.message);
  },

  /**
   * Obtiene el historial de cambios en auditoría con paginación.
   * @param {{ page?: number, pageSize?: number }} options
   * @returns {Promise<{ data: Array, total: number }>}
   */
  getAuditLog: async ({ page = 1, pageSize = 20 } = {}) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('rbac_audit_log')
      .select('*, admin_users!changed_by(nombre, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    return { data: data ?? [], total: count ?? 0 };
  },
};
