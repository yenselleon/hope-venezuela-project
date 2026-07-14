// src/utils/validators.js
// Funciones puras de validación. Retornan { valid: boolean, error: string }.
// NUNCA importar React ni stores desde este archivo.

/**
 * Valida nombre completo (mínimo 3 caracteres).
 */
export function validateName(value) {
  const v = (value ?? '').trim();
  if (v.length < 3) return { valid: false, error: 'Ingresa tu nombre completo.' };
  return { valid: true, error: '' };
}

/**
 * Valida cédula venezolana (6–8 dígitos numéricos).
 */
export function validateCedula(value) {
  const v = (value ?? '').trim();
  if (!/^\d{6,8}$/.test(v)) return { valid: false, error: 'La cédula debe ser numérica (6–8 dígitos).' };
  return { valid: true, error: '' };
}

/**
 * Valida edad (1–120). Retorna también flag `isMinor` si < 18.
 */
export function validateAge(value) {
  const v = (value ?? '').toString().trim();
  const n = parseInt(v, 10);
  if (!v || isNaN(n) || n < 1 || n > 120) {
    return { valid: false, error: 'Indica una edad válida.', isMinor: false };
  }
  return { valid: true, error: '', isMinor: n < 18 };
}

/**
 * Valida teléfono venezolano (mínimo 10 dígitos numéricos).
 */
export function validatePhone(value) {
  const digits = (value ?? '').replace(/\D/g, '');
  if (digits.length < 10) return { valid: false, error: 'Ingresa un teléfono válido.' };
  return { valid: true, error: '' };
}

/**
 * Valida campo requerido (no vacío después de trim).
 */
export function validateRequired(value, errorMsg = 'Este campo es requerido.') {
  const v = (value ?? '').toString().trim();
  if (!v) return { valid: false, error: errorMsg };
  return { valid: true, error: '' };
}

/**
 * Valida que un array tenga al menos 1 elemento seleccionado.
 */
export function validateMinOne(arr, errorMsg = 'Selecciona al menos una opción.') {
  if (!Array.isArray(arr) || arr.length === 0) return { valid: false, error: errorMsg };
  return { valid: true, error: '' };
}

/**
 * Valida el paso 1 del formulario completo. Retorna un objeto con errores por campo.
 * @param {object} data - Datos del paso 1
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateStep1(data) {
  const errors = {};
  let valid = true;

  const nombre = validateName(data.nombre);
  if (!nombre.valid) { errors.nombre = nombre.error; valid = false; }

  const cedula = validateCedula(data.cedula);
  if (!cedula.valid) { errors.cedula = cedula.error; valid = false; }

  const edad = validateAge(data.edad);
  if (!edad.valid) { errors.edad = edad.error; valid = false; }
  else if (edad.isMinor) { errors.edadMenor = 'Menor de edad: requiere autorización de un representante.'; }

  const tel = validatePhone(data.telefono);
  if (!tel.valid) { errors.telefono = tel.error; valid = false; }

  if (data.extranjero) {
    const pais = validateRequired(data.pais, 'Indica tu país de procedencia.');
    if (!pais.valid) { errors.pais = pais.error; valid = false; }
  } else {
    const estado = validateRequired(data.estado, 'Selecciona tu estado.');
    if (!estado.valid) { errors.estado = estado.error; valid = false; }
  }

  const profesion = validateRequired(data.profesion, 'Indica tu profesión u oficio.');
  if (!profesion.valid) { errors.profesion = profesion.error; valid = false; }

  return { valid, errors };
}

/**
 * Valida el paso 2: al menos 1 área seleccionada.
 */
export function validateStep2(data) {
  const errors = {};
  let valid = true;

  const areas = validateMinOne(data.areas, 'Selecciona al menos un área de apoyo.');
  if (!areas.valid) { errors.areas = areas.error; valid = false; }

  return { valid, errors };
}

/**
 * Valida el paso 3: al menos 1 zona seleccionada.
 */
export function validateStep3(data) {
  const errors = {};
  let valid = true;

  const zonas = validateMinOne(data.zonas, 'Indica al menos una zona.');
  if (!zonas.valid) { errors.zonas = zonas.error; valid = false; }

  return { valid, errors };
}
