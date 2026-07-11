// src/hooks/useCountUp.js
// Hook para la animación de incremento numérico.
// CORRECTO: Usa useEffect para inicializar y limpiar la animación externa.
// Respeta la preferencia de movimiento reducido.

import { useState, useEffect } from 'react';
import { prefersReducedMotion } from '@/utils/helpers';

/**
 * Incrementa un valor numérico desde 0 hasta el valor objetivo.
 * @param {number} targetValue - El valor final del contador
 * @param {number} [duration=1400] - Duración en ms
 * @param {boolean} [trigger=true] - Si se debe iniciar la animación
 * @returns {number} - El valor actual animado
 */
export function useCountUp(targetValue, duration = 1400, trigger = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    if (prefersReducedMotion()) {
      setCount(targetValue);
      return;
    }

    let startTime = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min(1, (timestamp - startTime) / duration);
      
      // Función de aceleración/desaceleración cubic out: 1 - (1 - x)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(targetValue * easeProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetValue, duration, trigger]);

  return count;
}
