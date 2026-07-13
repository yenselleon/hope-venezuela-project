// src/services/volunteerService.js
// Servicio de voluntariado — Conexión real con Supabase.
// Cada método retorna datos o lanza error. No modifica estado ni UI.

import { supabase } from '@/lib/supabase';

/**
 * Mapea los campos del formulario (camelCase) a las columnas de la tabla (snake_case).
 */
function mapFormToRow(formData) {
  const { step1, step2, step3 } = formData;
  return {
    // Step 1
    nombre: step1.nombre?.trim(),
    cedula: step1.cedula?.trim(),
    edad: step1.edad ? parseInt(step1.edad, 10) : null,
    telefono: step1.telefono?.trim(),
    genero: step1.genero || null,
    estado: step1.estado || null,
    municipio: step1.municipio || null,
    profesion: step1.profesion?.trim(),
    extranjero: !!step1.extranjero,
    pais: step1.pais?.trim() || null,

    // Step 2
    areas: step2.areas || [],
    especialidad_salud: step2.especialidad || null,
    grado_academico: step2.gradoAcademico || null,
    vehiculo: step2.vehiculo || null,
    certificaciones: step2.certificaciones || [],

    // Step 3
    zonas: step3.zonas || [],
    hospedaje: step3.hospedaje || null,
    familia: step3.familia || [],
    movilizacion: step3.movilizacion || null,
    apoyo_logistico: step3.apoyoLogistico || [],
    turnos: step3.turnos || [],
    duracion: step3.duracion || null,
    duracion_dias: step3.duracionDias ? parseInt(step3.duracionDias, 10) : null,
  };
}

export const volunteerService = {
  /**
   * Crea un nuevo voluntario (formulario público, usa anon key).
   */
  create: async (formData) => {
    const row = mapFormToRow(formData);
    const { error } = await supabase
      .from('voluntarios')
      .insert(row);

    if (error) throw new Error(error.message);
    return { success: true };
  },

  /**
   * Obtiene todos los voluntarios con filtros opcionales (panel admin).
   */
  getAll: async (filters = {}) => {
    let query = supabase
      .from('voluntarios')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(
        `nombre.ilike.%${filters.search}%,cedula.ilike.%${filters.search}%`
      );
    }
    if (filters.zona) {
      query = query.contains('zonas', [filters.zona]);
    }
    if (filters.estado_voluntario) {
      query = query.eq('estado_voluntario', filters.estado_voluntario);
    }
    if (filters.area) {
      query = query.contains('areas', [filters.area]);
    }

    // Paginación
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 15;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  /**
   * Obtiene un voluntario por ID (panel admin).
   */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('voluntarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Actualiza un voluntario (asignación, cambio de estado, notas).
   */
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('voluntarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Elimina un voluntario (solo super_admin).
   */
  delete: async (id) => {
    const { error } = await supabase
      .from('voluntarios')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  },
};
