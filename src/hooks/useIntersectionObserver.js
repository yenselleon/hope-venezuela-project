// src/hooks/useIntersectionObserver.js
// Hook que encapsula IntersectionObserver con cleanup automático.
// Utiliza el patrón Callback Refs de React (en lugar de useRef + useEffect) para asegurar
// que el observador se asocie de forma garantizada tan pronto como el nodo se monte en el DOM.

import { useCallback, useRef } from 'react';

/**
 * Observa si un elemento entra o sale del viewport.
 * @param {(entry: IntersectionObserverEntry) => void} callback
 * @param {IntersectionObserverInit} [options]
 * @returns {(node: HTMLElement | null) => void} - Asignar al atributo `ref` del elemento a observar
 */
export function useIntersectionObserver(callback, options = {}) {
  const observerRef = useRef(null);
  const callbackRef = useRef(callback);

  // Mantener referencia actualizada al callback para evitar re-crear el observer
  callbackRef.current = callback;

  // Convertir las opciones en string para comparar dependencias de forma estable
  const optionsKey = JSON.stringify(options);

  const ref = useCallback((node) => {
    // Si ya existe un observer activo, limpiarlo
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Si el nodo físico existe en el DOM, inicializar y asociar el observer
    if (node && 'IntersectionObserver' in window) {
      const parsedOptions = JSON.parse(optionsKey);
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => callbackRef.current(entry));
      }, parsedOptions);

      observer.observe(node);
      observerRef.current = observer;
    }
  }, [optionsKey]);

  return ref;
}
