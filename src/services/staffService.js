// src/services/staffService.js
// Servicio de gestión de personal administrativo — Fase 4 Gobernanza.
// Solo retorna datos o lanza errores. No modifica estado ni UI.

import { supabase } from '@/lib/supabase';

export const staffService = {
  /**
   * Obtiene todos los administradores registrados.
   * @returns {Promise<Array>} Lista de admin_users
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /**
   * Obtiene un administrador por su ID.
   */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
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
