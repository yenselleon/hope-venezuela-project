// src/services/zonasService.js
// Servicio de zonas geográficas — Conexión real con Supabase.

import { supabase } from '@/lib/supabase';

export const zonasService = {
  /**
   * Obtiene todas las zonas registradas.
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('zonas')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },
};
