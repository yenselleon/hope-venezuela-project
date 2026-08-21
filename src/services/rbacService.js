// src/services/rbacService.js
// Servicio de gestión de permisos RBAC — Fase 4 Gobernanza.
// Solo retorna datos o lanza errores. No modifica estado ni UI.

import { supabase } from '@/lib/supabase';

const DEFAULT_RBAC_PERMISSIONS = [
  { role: 'public', action: 'register_donate', allowed: true, locked: false },
  { role: 'coordinador', action: 'register_donate', allowed: true, locked: false },
  { role: 'super_admin', action: 'register_donate', allowed: true, locked: true },

  { role: 'public', action: 'view_volunteers', allowed: false, locked: false },
  { role: 'coordinador', action: 'view_volunteers', allowed: true, locked: false },
  { role: 'super_admin', action: 'view_volunteers', allowed: true, locked: true },

  { role: 'public', action: 'approve_volunteers', allowed: false, locked: false },
  { role: 'coordinador', action: 'approve_volunteers', allowed: true, locked: false },
  { role: 'super_admin', action: 'approve_volunteers', allowed: true, locked: true },

  { role: 'public', action: 'reveal_sensitive_data', allowed: false, locked: false },
  { role: 'coordinador', action: 'reveal_sensitive_data', allowed: true, locked: false },
  { role: 'super_admin', action: 'reveal_sensitive_data', allowed: true, locked: true },

  { role: 'public', action: 'export_data', allowed: false, locked: false },
  { role: 'coordinador', action: 'export_data', allowed: true, locked: false },
  { role: 'super_admin', action: 'export_data', allowed: true, locked: true },

  { role: 'public', action: 'manage_inventory', allowed: false, locked: false },
  { role: 'coordinador', action: 'manage_inventory', allowed: true, locked: false },
  { role: 'super_admin', action: 'manage_inventory', allowed: true, locked: true },

  { role: 'public', action: 'edit_inventory', allowed: false, locked: false },
  { role: 'coordinador', action: 'edit_inventory', allowed: true, locked: false },
  { role: 'super_admin', action: 'edit_inventory', allowed: true, locked: true },

  { role: 'public', action: 'delete_inventory', allowed: false, locked: false },
  { role: 'coordinador', action: 'delete_inventory', allowed: false, locked: false },
  { role: 'super_admin', action: 'delete_inventory', allowed: true, locked: true },

  { role: 'public', action: 'manage_categories', allowed: false, locked: false },
  { role: 'coordinador', action: 'manage_categories', allowed: false, locked: false },
  { role: 'super_admin', action: 'manage_categories', allowed: true, locked: true },

  { role: 'public', action: 'manage_admins_rbac', allowed: false, locked: false },
  { role: 'coordinador', action: 'manage_admins_rbac', allowed: false, locked: false },
  { role: 'super_admin', action: 'manage_admins_rbac', allowed: true, locked: true },
];

let inMemoryPermissions = [...DEFAULT_RBAC_PERMISSIONS];
let inMemoryUserPermissions = {};
let inMemoryAuditLog = [];

export const rbacService = {
  /**
   * Obtiene la matriz completa de permisos.
   * @returns {Promise<Array>} Array de { role, action, allowed, locked }
   */
  getPermissions: async () => {
    try {
      const { data, error } = await supabase
        .from('rbac_permissions')
        .select('*')
        .order('action');

      if (!error && data && data.length > 0) {
        // Merge with any missing new actions if schema wasn't fully migrated yet
        const dbActions = new Set(data.map((d) => `${d.role}__${d.action}`));
        const merged = [...data];
        DEFAULT_RBAC_PERMISSIONS.forEach((def) => {
          if (!dbActions.has(`${def.role}__${def.action}`)) {
            merged.push(def);
          }
        });
        inMemoryPermissions = merged;
        return merged;
      }
    } catch {
      // Fallback inMemory
    }
    return inMemoryPermissions;
  },

  /**
   * Guarda cambios en la matriz de permisos y registra en auditoría.
   * Solo puede modificar permisos no bloqueados (locked = false).
   * @param {Array<{role: string, action: string, allowed: boolean}>} changes Cambios a aplicar
   * @param {string} userId UUID del super_admin que realiza el cambio
   */
  savePermissions: async (changes, userId) => {
    // 1. Aplicar cada cambio via update en Supabase
    for (const change of changes) {
      try {
        await supabase
          .from('rbac_permissions')
          .update({ allowed: change.allowed })
          .eq('role', change.role)
          .eq('action', change.action)
          .eq('locked', false);
      } catch {
        // ignore in offline
      }

      const idx = inMemoryPermissions.findIndex(
        (p) => p.role === change.role && p.action === change.action
      );
      if (idx !== -1 && !inMemoryPermissions[idx].locked) {
        inMemoryPermissions[idx].allowed = change.allowed;
      }
    }

    // 2. Registrar en auditoría
    const auditEntry = {
      id: 'audit-' + Date.now(),
      changed_by: userId || null,
      changes: changes.map((c) => ({
        action: c.action,
        role: c.role,
        old_value: c.old_value,
        new_value: c.allowed,
      })),
      created_at: new Date().toISOString(),
    };

    try {
      await supabase
        .from('rbac_audit_log')
        .insert({
          changed_by: userId,
          changes: auditEntry.changes,
        });
    } catch {
      // fallback
    }

    inMemoryAuditLog.unshift(auditEntry);
  },

  /**
   * Obtiene los permisos específicos configurados para un usuario.
   * @param {string} userId
   * @returns {Promise<Array<string>>} Lista de acciones permitidas
   */
  getUserPermissions: async (userId) => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('permisos_especificos')
        .eq('id', userId)
        .single();

      if (!error && data?.permisos_especificos) {
        inMemoryUserPermissions[userId] = data.permisos_especificos;
        return data.permisos_especificos;
      }
    } catch {
      // fallback
    }

    // Comprobar cache local o localStorage
    if (inMemoryUserPermissions[userId]) {
      return inMemoryUserPermissions[userId];
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`user_permissions_${userId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          inMemoryUserPermissions[userId] = parsed;
          return parsed;
        }
      } catch {}
    }

    return [];
  },

  /**
   * Guarda los permisos específicos de un usuario (override de rol).
   * @param {string} userId
   * @param {Array<string>} permissions
   * @param {string} changedByUserId
   */
  saveUserPermissions: async (userId, permissions, changedByUserId) => {
    inMemoryUserPermissions[userId] = permissions;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`user_permissions_${userId}`, JSON.stringify(permissions));
      } catch {}
    }

    try {
      await supabase
        .from('admin_users')
        .update({ permisos_especificos: permissions })
        .eq('id', userId);
    } catch {
      // fallback
    }

    // Registrar en auditoría
    const auditEntry = {
      id: 'audit-user-' + Date.now(),
      changed_by: changedByUserId || null,
      changes: [{
        target_user: userId,
        action: 'user_permissions_update',
        permissions,
      }],
      created_at: new Date().toISOString(),
    };

    try {
      await supabase
        .from('rbac_audit_log')
        .insert({
          changed_by: changedByUserId,
          changes: auditEntry.changes,
        });
    } catch {
      // fallback
    }

    inMemoryAuditLog.unshift(auditEntry);
    return permissions;
  },

  /**
   * Obtiene el historial de cambios en auditoría con paginación.
   * @param {{ page?: number, pageSize?: number }} options
   * @returns {Promise<{ data: Array, total: number }>}
   */
  getAuditLog: async ({ page = 1, pageSize = 20 } = {}) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error, count } = await supabase
        .from('rbac_audit_log')
        .select('*, admin_users!changed_by(nombre, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        return { data: data ?? [], total: count ?? 0 };
      }
    } catch {
      // fallback
    }

    const sliced = inMemoryAuditLog.slice(from, to + 1);
    return { data: sliced, total: inMemoryAuditLog.length };
  },
};
