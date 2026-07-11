// src/stores/useFormStore.js
// Store Zustand para el estado del formulario multi-step de voluntariado.
// Centraliza datos de los 4 pasos, errores, paso actual y acciones de navegación.
// Usa validators.js para las reglas — no implementa validación inline.

import { create } from 'zustand';
import { validateStep1, validateStep2, validateStep3 } from '@/utils/validators';

const INITIAL_STEP1 = {
  nombre: '',
  cedula: '',
  edad: '',
  telefono: '',
  genero: '',
  estado: '',
  municipio: '',
  profesion: '',
};

const INITIAL_STEP2 = {
  areas: [],
  especialidad: '',
  gradoAcademico: '',
  vehiculo: '',
  certificaciones: [],
};

const INITIAL_STEP3 = {
  zonas: [],
  hospedaje: '',
  familia: [],
  movilizacion: '',
  apoyoLogistico: [],
  turnos: [], // array de keys 'Lun-m', 'Mar-t', etc.
  duracion: '',
  duracionDias: 7,
};

export const useFormStore = create((set, get) => ({
  // ─── Estado ───────────────────────────────────────────────────────────────
  currentStep: 1,
  submitted: false,
  errors: {},

  step1: { ...INITIAL_STEP1 },
  step2: { ...INITIAL_STEP2 },
  step3: { ...INITIAL_STEP3 },

  // ─── Acciones de campo ────────────────────────────────────────────────────
  /**
   * Actualiza un campo dentro de un step.
   * @param {1|2|3} step
   * @param {string} field
   * @param {any} value
   */
  updateField: (step, field, value) => {
    const key = `step${step}`;
    set((state) => ({
      [key]: { ...state[key], [field]: value },
      // Limpiar el error del campo al editar
      errors: { ...state.errors, [field]: undefined },
    }));
  },

  /**
   * Toggle de un valor en un array (para multi-select como áreas, zonas, etc.)
   * @param {1|2|3} step
   * @param {string} field - campo que es un array
   * @param {string} value - valor a agregar o quitar
   */
  toggleArrayField: (step, field, value) => {
    const key = `step${step}`;
    set((state) => {
      const current = state[key][field] ?? [];
      const exists = current.includes(value);
      const next = exists ? current.filter((v) => v !== value) : [...current, value];
      return {
        [key]: { ...state[key], [field]: next },
        errors: { ...state.errors, [field]: undefined },
      };
    });
  },

  /**
   * Toggle de un turno en la grilla: key = 'Lun-m'
   * @param {string} cellKey
   */
  toggleTurno: (cellKey) => {
    set((state) => {
      const current = state.step3.turnos;
      const exists = current.includes(cellKey);
      const next = exists ? current.filter((k) => k !== cellKey) : [...current, cellKey];
      return { step3: { ...state.step3, turnos: next } };
    });
  },

  // ─── Navegación ───────────────────────────────────────────────────────────
  /**
   * Valida el paso actual y avanza si es válido.
   * @returns {boolean} - true si avanzó, false si hay errores
   */
  nextStep: () => {
    const { currentStep, step1, step2, step3 } = get();
    let result = { valid: true, errors: {} };

    if (currentStep === 1) result = validateStep1(step1);
    if (currentStep === 2) result = validateStep2(step2);
    if (currentStep === 3) result = validateStep3(step3);

    if (!result.valid) {
      set({ errors: result.errors });
      return false;
    }

    set({ errors: {}, currentStep: Math.min(4, currentStep + 1) });
    return true;
  },

  prevStep: () => {
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1),
      errors: {},
    }));
  },

  goToStep: (n) => {
    set({ currentStep: n, errors: {} });
  },

  // ─── Submit ───────────────────────────────────────────────────────────────
  setSubmitted: (value) => set({ submitted: value }),

  // ─── Reset ────────────────────────────────────────────────────────────────
  resetForm: () => {
    set({
      currentStep: 1,
      submitted: false,
      errors: {},
      step1: { ...INITIAL_STEP1 },
      step2: { ...INITIAL_STEP2 },
      step3: { ...INITIAL_STEP3 },
    });
  },
}));
