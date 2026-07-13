// src/hooks/useAuth.js
// Hook de autenticación. Suscribe a onAuthStateChange de Supabase
// y sincroniza el store Zustand.
// Uso correcto de useEffect: suscripción con cleanup a sistema externo.

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/authService';

/**
 * Inicializa y mantiene sincronizado el estado de autenticación.
 * Debe llamarse una sola vez en el componente raíz (App o layout admin).
 */
export function useAuth() {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    // 1. Obtener sesión inicial
    authService.getSession().then((session) => {
      setSession(session);
    });

    // 2. Suscribir a cambios (login, logout, token refresh)
    const unsubscribe = authService.onAuthStateChange((session) => {
      if (session) {
        setSession(session);
      } else {
        clearSession();
      }
    });

    // 3. Cleanup al desmontar
    return unsubscribe;
  }, [setSession, clearSession]);
}
