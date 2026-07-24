// src/services/zonasService.js
// Servicio de zonas geográficas — Conexión real con Supabase.

import { supabase } from '@/lib/supabase';

const DEFAULT_ZONAS = [
  { id: '1', nombre: 'Vargas · La Guaira', lat: 10.6014, lng: -66.9322, requeri: 30 },
  { id: '2', nombre: 'Miranda · San Antonio', lat: 10.3756, lng: -66.9633, requeri: 30 },
  { id: '3', nombre: 'Miranda · Los Teques', lat: 10.3444, lng: -67.0428, requeri: 30 },
  { id: '4', nombre: 'Aragua · Maracay', lat: 10.2469, lng: -67.5958, requeri: 30 },
];

export const zonasService = {
  /**
   * Obtiene todas las zonas registradas.
   */
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('zonas')
        .select('*')
        .order('nombre', { ascending: true });

      if (error || !data || data.length === 0) {
        return DEFAULT_ZONAS;
      }
      return data;
    } catch {
      return DEFAULT_ZONAS;
    }
  },
};
