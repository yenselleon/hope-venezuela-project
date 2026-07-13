// src/components/admin/ExportModal.jsx
// Modal de exportación de voluntarios que permite seleccionar columnas
// y formato (Excel o PDF). Usa el elemento <dialog> nativo.
// Props: { volunteers, userEmail, onClose }

import React, { useRef, useState, useCallback } from 'react';
import { useI18nStore } from '@/stores/useI18nStore';
import { EXPORT_COLUMNS, exportToExcel, exportToPDF } from '@/utils/exporters';

export function ExportModal({ volunteers, userEmail, onClose }) {
  const t = useI18nStore((s) => s.t);
  const dialogRef = useRef(null);

  // Local state for selected columns keys (defaults to all selected)
  const [selectedKeys, setSelectedKeys] = useState(() =>
    EXPORT_COLUMNS.map((c) => c.key)
  );

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

  const handleDialogClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const toggleColumn = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setSelectedKeys(EXPORT_COLUMNS.map((c) => c.key));
  };

  const handleSelectNone = () => {
    setSelectedKeys([]);
  };

  const getSelectedColumns = () => {
    return EXPORT_COLUMNS.filter((c) => selectedKeys.includes(c.key));
  };

  const handleExportExcel = () => {
    const cols = getSelectedColumns();
    if (cols.length === 0) return;
    exportToExcel(volunteers, userEmail, cols);
    handleClose();
  };

  const handleExportPDF = () => {
    const cols = getSelectedColumns();
    if (cols.length === 0) return;
    exportToPDF(volunteers, userEmail, cols);
    handleClose();
  };

  return (
    <dialog
      ref={setDialogRef}
      onClick={handleDialogClick}
      onCancel={handleClose}
      className="backdrop:bg-black/45 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8 max-w-[500px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Header */}
        <h2 className="text-lg font-bold text-text-primary mb-1">
          {t('admin.export.title')}
        </h2>
        <p className="text-xs text-text-tertiary mb-4">
          {volunteers.length} {t('admin.vol.registros')}
        </p>

        {/* Warning card */}
        <div className="bg-[#fdf3f2] border border-[#fbd4d0] rounded-xl p-4 flex gap-3 items-start mb-5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b02a24"
            strokeWidth="2"
            strokeLinecap="round"
            className="flex-shrink-0 mt-0.5"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="margin-0 font-medium text-xs leading-relaxed text-[#b02a24]">
            {t('admin.export.warning')}
          </p>
        </div>

        {/* Selection toggles */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            {t('admin.detail.areasYCerts')} / Columnas
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-navy hover:underline cursor-pointer"
            >
              Todos
            </button>
            <span className="text-[#dcdfd8] text-xs">|</span>
            <button
              type="button"
              onClick={handleSelectNone}
              className="text-[11px] font-bold text-navy hover:underline cursor-pointer"
            >
              Ninguno
            </button>
          </div>
        </div>

        {/* Checkboxes grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 max-h-[180px] overflow-y-auto border border-input-border rounded-lg p-3 bg-[#faf9f6]">
          {EXPORT_COLUMNS.map((col) => (
            <label
              key={col.key}
              className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer select-none py-0.5 hover:text-text-primary"
            >
              <input
                type="checkbox"
                checked={selectedKeys.includes(col.key)}
                onChange={() => toggleColumn(col.key)}
                className="w-3.5 h-3.5 accent-navy"
              />
              {col.header}
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={selectedKeys.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-lg font-bold text-xs text-white bg-navy hover:bg-[#00284f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {t('admin.export.btnExcel')}
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={selectedKeys.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-lg font-bold text-xs text-white bg-[#5c1f3a] hover:bg-[#431427] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {t('admin.export.btnPdf')}
            </button>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="h-10 text-xs font-bold text-text-tertiary border border-input-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('admin.assign.cancel')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
