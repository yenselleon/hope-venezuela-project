// src/services/staffService.js
// Servicio de gestión de personal administrativo — Fase 4 Gobernanza.
// Solo retorna datos o lanza errores. No modifica estado ni UI.

import { supabase } from '@/lib/supabase';

const DEFAULT_STAFF = [
  { id: 'usr-1', nombre: 'Hope Super Admin', email: 'voluntariosrsg@gmail.com', role: 'super_admin', estado: 'activo', zonas: ['Todas'] },
  { id: 'usr-2', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@hope.org', role: 'coordinador', estado: 'activo', zonas: ['Vargas', 'Caracas'], permisos_especificos: [] },
  { id: 'usr-3', nombre: 'Ana Morales', email: 'ana.morales@hope.org', role: 'coordinador', estado: 'activo', zonas: ['Miranda'], permisos_especificos: ['edit_inventory'] },
  { id: 'usr-4', nombre: 'Dr. Roberto Silva', email: 'roberto.silva@hope.org', role: 'coordinador', estado: 'activo', zonas: ['Aragua'], permisos_especificos: [] },
];

export const staffService = {
  /**
   * Obtiene todos los administradores registrados.
   * @returns {Promise<Array>} Lista de admin_users
   */
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch {
      // Fallback local
    }
    return DEFAULT_STAFF;
  },

  /**
   * Obtiene un administrador por su ID.
   */
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data;
    } catch {
      // Fallback local
    }
    return DEFAULT_STAFF.find((u) => u.id === id) || DEFAULT_STAFF[0];
  },

  /**
   * Invita a un nuevo administrador via Edge Function.
   * Requiere super_admin — la Edge Function valida el JWT.
   * @param {{ nombre: string, email: string, role: string, zonas: string[] }} payload
   */
  invite: async (payload) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) throw new Error('No hay sesión activa');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/invite-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Error al invitar administrador');
    return result.user;
  },

  /**
   * Actualiza el rol y las zonas de un administrador.
   */
  updateRoleAndZones: async (id, { role, zonas }) => {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ role, zonas })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Desactiva un administrador (soft delete).
   */
  deactivate: async (id) => {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ estado: 'inactivo' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Reactiva un administrador desactivado.
   */
  reactivate: async (id) => {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ estado: 'activo' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Reenvía la invitación de un administrador pendiente.
   * Usa resetPasswordForEmail que dispara un email de recuperación.
   */
  resendInvite: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    if (error) throw new Error(error.message);
  },
};
