// src/utils/exporters.js
// Funciones de exportación de datos a Excel y PDF.
// Solo para super_admin. Registra quién exporta en consola (Fase 3: tabla audit_log).

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Columnas visibles en la exportación.
 */
export const EXPORT_COLUMNS = [
  { key: 'nombre', header: 'Nombre' },
  { key: 'cedula', header: 'Cédula' },
  { key: 'telefono', header: 'Teléfono' },
  { key: 'profesion', header: 'Profesión' },
  { key: 'estado', header: 'Estado' },
  { key: 'municipio', header: 'Municipio' },
  { key: 'areas', header: 'Áreas' },
  { key: 'zona_asignada', header: 'Zona Asignada' },
  { key: 'turno_asignado', header: 'Turno' },
  { key: 'estado_voluntario', header: 'Status' },
  { key: 'created_at', header: 'Fecha Registro' },
];

/**
 * Transforma un registro para exportación (arrays → strings, fechas formateadas).
 */
function flattenRow(row, columns = EXPORT_COLUMNS) {
  const flat = {};
  for (const col of columns) {
    const val = row[col.key];
    if (Array.isArray(val)) {
      flat[col.header] = val.join(', ');
    } else if (col.key === 'created_at' && val) {
      flat[col.header] = new Date(val).toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } else {
      flat[col.header] = val ?? '';
    }
  }
  return flat;
}

/**
 * Exporta datos a un archivo Excel (.xlsx).
 * @param {Array} data - Array de voluntarios
 * @param {string} exportedBy - Email del usuario que exporta
 * @param {Array} columns - Columnas seleccionadas para exportar
 */
export function exportToExcel(data, exportedBy = 'unknown', columns = EXPORT_COLUMNS) {
  const rows = data.map((row) => flattenRow(row, columns));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Voluntarios');

  const filename = `voluntarios_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);

  // Registro de auditoría (Fase 3: persistir en tabla audit_log)
  console.info(`[AUDIT] Excel exported by ${exportedBy} at ${new Date().toISOString()} — ${data.length} records`);
}

/**
 * Exporta datos a un archivo PDF.
 * @param {Array} data - Array de voluntarios
 * @param {string} exportedBy - Email del usuario que exporta
 * @param {Array} columns - Columnas seleccionadas para exportar
 */
export function exportToPDF(data, exportedBy = 'unknown', columns = EXPORT_COLUMNS) {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Título
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102); // navy
  doc.text('Hope en Venezuela — Registro de Voluntarios', 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Exportado: ${new Date().toLocaleDateString('es-VE')} · ${data.length} registros`, 14, 25);

  // Tabla
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => {
    const flat = flattenRow(row, columns);
    return headers.map((h) => flat[h]);
  });

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 30,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [0, 51, 102], textColor: 255 },
    alternateRowStyles: { fillColor: [250, 248, 244] },
  });

  const filename = `voluntarios_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);

  console.info(`[AUDIT] PDF exported by ${exportedBy} at ${new Date().toISOString()} — ${data.length} records`);
}
