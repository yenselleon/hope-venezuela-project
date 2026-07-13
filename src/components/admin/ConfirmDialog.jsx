// src/components/admin/ConfirmDialog.jsx
// Modal de confirmación genérico utilizando el elemento <dialog> nativo.
// Diseñado siguiendo las buenas prácticas de UI/UX y la estética de la consola administrativa.
// Props: { title, message, confirmText, confirmVariant, onClose, onConfirm }

import React, { useRef, useCallback } from 'react';
import { useI18nStore } from '@/stores/useI18nStore';

export function ConfirmDialog({ title, message, confirmText, confirmVariant = 'no', onClose, onConfirm }) {
  const t = useI18nStore((s) => s.t);
  const dialogRef = useRef(null);

  // Open the dialog imperatively when it mounts via ref callback
  const setDialogRef = useCallback((node) => {
    dialogRef.current = node;
    if (node && !node.open) {
      node.showModal();
    }
  }, []);

  const handleClose = () => {
    dialogRef.current?.close();
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  const handleDialogClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  // Determine button style class based on confirmVariant
  const btnClass = confirmVariant === 'no' ? 'admin-btn-no' : 'admin-btn-ok';

  return (
    <dialog
      ref={setDialogRef}
      onClick={handleDialogClick}
      onCancel={handleClose}
      className="fixed inset-0 m-auto p-0 bg-white border border-[#efe7d8] rounded-2xl shadow-2xl focus:outline-none backdrop:bg-black/45 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-7 max-w-[400px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Icon & Title Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#fbdedb] flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b02a24"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary leading-snug margin-0">
              {title}
            </h3>
            <p className="text-xs font-medium text-text-tertiary mt-1.5 leading-relaxed margin-0">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4.5 h-10 text-xs font-bold text-text-secondary border border-input-border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t('admin.assign.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 h-10 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer admin-btn ${btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
