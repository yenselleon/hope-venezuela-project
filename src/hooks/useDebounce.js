// src/hooks/useDebounce.js
// ──────────────────────────────────────────────────────────
// Custom hook para debouncing de valores (búsquedas, inputs rápidos).
// ──────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

/**
 * Retorna el valor retardado por `delay` milisegundos.
 * @param {any} value - El valor a retardar.
 * @param {number} delay - Milisegundos de espera (por defecto 300ms).
 * @returns {any} Valor debounced.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
