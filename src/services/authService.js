// src/services/authService.js
// Servicio de autenticación con Supabase Auth.
// Solo retorna datos o lanza errores. No modifica estado ni UI.

import { supabase } from '@/lib/supabase';

export const authService = {
  /**
   * Login con email y contraseña.
   * @returns {{ user, session }} on success
   */
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Cierra la sesión actual.
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /**
   * Obtiene la sesión actual (si existe).
   */
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return session;
  },

  /**
   * Suscribe a cambios de estado de autenticación.
   * Retorna la función de cleanup para useEffect.
   */
  onAuthStateChange: (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => callback(session)
    );
    return () => subscription.unsubscribe();
  },
};
