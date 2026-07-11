// src/utils/helpers.js
// Funciones auxiliares genéricas sin efectos secundarios.

/**
 * Genera un ID único simple para keys de React.
 */
export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Clase CSS condicional: cn('a', condition && 'b') → 'a b' o 'a'
 * Filtra valores falsy.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Retorna el porcentaje de progreso del formulario.
 * step es 1-based, totalSteps es el total.
 */
export function getStepProgress(step, totalSteps) {
  return Math.round((step / totalSteps) * 100);
}

/**
 * Clamp: limita un número entre min y max.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Verifica si el dispositivo prefiere movimiento reducido.
 * Safe: retorna false si matchMedia no está disponible.
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}
