// src/components/admin/AssignModal.jsx
// Modal de asignación de voluntario usando el elemento <dialog> nativo.
// Props: { volunteer, onClose, onSuccess }
// Usa useMutation para actualizar el voluntario vía volunteerService.

import React, { useRef, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { volunteerService } from '@/services/volunteerService';
import { ZONAS_DESPLIEGUE } from '@/utils/constants';

const TURNOS_ASIGNACION = [
  { key: 'm', labelKey: 'admin.turno.m' },
  { key: 't', labelKey: 'admin.turno.t' },
  { key: 'n', labelKey: 'admin.turno.n' },
];

export function AssignModal({ volunteer, onClose, onSuccess }) {
  const t = useI18nStore((s) => s.t);
  const queryClient = useQueryClient();
  const dialogRef = useRef(null);

  // Local form state — NO useEffect
  const [zona, setZona] = useState(volunteer?.zona_asignada || '');
  const [turno, setTurno] = useState(volunteer?.turno_asignado || '');
  const [notas, setNotas] = useState(volunteer?.notas_admin || '');

  // Open the dialog imperatively when it mounts via ref callback
  const setDialogRef = useCallback((node) => {
    dialogRef.current = node;
    if (node && !node.open) {
      node.showModal();
    }
  }, []);

  const assignMutation = useMutation({
    mutationFn: () =>
      volunteerService.update(volunteer.id, {
        zona_asignada: zona,
        turno_asignado: turno,
        estado_voluntario: 'asignado',
        notas_admin: notas,
      }),
    onSuccess: () => {
      // Invalidate volunteer queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['volunteer', volunteer.id] });

      // Show toast notification
      useUIStore.getState().showToast(t('admin.assign.success'), 'success');

      // Notify parent
      onSuccess?.();
      handleClose();
    },
  });

  const handleClose = () => {
    dialogRef.current?.close();
    onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    assignMutation.mutate();
  };

  // Close on backdrop click (native dialog behavior)
  const handleDialogClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  return (
    <dialog
      ref={setDialogRef}
      onClick={handleDialogClick}
      onCancel={handleClose}
      className="fixed inset-0 m-auto p-0 bg-white border border-[#efe7d8] rounded-2xl shadow-2xl focus:outline-none backdrop:bg-black/45 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        {/* Header */}
        <h2 className="text-lg font-semibold text-text-primary mb-1">
          {t('admin.assign.title')}
        </h2>
        <p className="text-sm text-text-tertiary mb-6">
          {volunteer?.nombre}
        </p>

        {/* Zona */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label
            htmlFor="assign-zona"
            className="text-sm font-medium text-text-secondary"
          >
            {t('admin.assign.zona')}
          </label>
          <select
            id="assign-zona"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            required
            className="h-10 px-3 border border-input-border rounded-lg text-sm bg-white
                       focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          >
            <option value="">{t('admin.filter.all')}</option>
            {ZONAS_DESPLIEGUE.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
        </div>

        {/* Turno */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label
            htmlFor="assign-turno"
            className="text-sm font-medium text-text-secondary"
          >
            {t('admin.assign.turno')}
          </label>
          <select
            id="assign-turno"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            required
            className="h-10 px-3 border border-input-border rounded-lg text-sm bg-white
                       focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          >
            <option value="">{t('admin.filter.all')}</option>
            {TURNOS_ASIGNACION.map((tu) => (
              <option key={tu.key} value={t(tu.labelKey)}>
                {t(tu.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Notas */}
        <div className="flex flex-col gap-1.5 mb-6">
          <label
            htmlFor="assign-notas"
            className="text-sm font-medium text-text-secondary"
          >
            {t('admin.assign.notas')}
          </label>
          <textarea
            id="assign-notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="px-3 py-2 border border-input-border rounded-lg text-sm resize-y
                       focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>

        {/* Error */}
        {assignMutation.isError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4" role="alert">
            {t('admin.assign.error')}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 h-10 text-sm font-medium text-text-secondary rounded-lg
                       border border-input-border hover:bg-gray-50 transition-colors"
          >
            {t('admin.assign.cancel')}
          </button>
          <button
            type="submit"
            disabled={assignMutation.isPending}
            className="px-5 h-10 text-sm font-semibold text-white bg-navy rounded-lg
                       hover:bg-navy-dark disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors"
          >
            {assignMutation.isPending ? t('admin.assign.saving') : t('admin.assign.save')}
          </button>
        </div>
      </form>
    </dialog>
  );
}
