// src/services/volunteerService.js
// Servicio de voluntariado.
// Fase 1: Simulación local (Stub) con retardo.
// Fase 2: Conexión real con Supabase.

export const volunteerService = {
  /**
   * Guarda los datos del voluntario.
   * @param {object} volunteerData - Datos recolectados en el store.
   * @returns {Promise<{ id: string, success: boolean }>}
   */
  create: async (volunteerData) => {
    // Simulamos un delay de red de 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Retorna una respuesta stub exitosa
    return {
      id: crypto.randomUUID(),
      success: true,
      data: {
        ...volunteerData,
        createdAt: new Date().toISOString(),
      },
    };
  },
};
