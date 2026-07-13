// src/utils/formatters.js
// Funciones puras de formateo. Sin efectos secundarios, sin React.

/**
 * Formatea un teléfono venezolano: "04121234567" → "0412-1234567"
 */
export function formatPhone(raw) {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (digits.length >= 11) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
  }
  if (digits.length >= 4) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return digits;
}

/**
 * Enmascara datos sensibles dejando visible solo los primeros y últimos N caracteres.
 * maskData('12345678', 2) → '12****78'
 */
export function maskData(value, visibleChars = 2) {
  const v = (value ?? '').toString();
  if (v.length <= visibleChars * 2) return v;
  const start = v.slice(0, visibleChars);
  const end = v.slice(-visibleChars);
  const stars = '*'.repeat(v.length - visibleChars * 2);
  return `${start}${stars}${end}`;
}

/**
 * Formatea un número grande con separador de miles local (es-ES).
 * formatCount(1200) → "1.200"
 */
export function formatCount(n) {
  const num = parseInt(n, 10);
  if (isNaN(num)) return String(n);
  return num >= 1000 ? num.toLocaleString('es-ES') : String(num);
}

/**
 * Construye el texto de resumen del step 1 para la pantalla de revisión.
 */
export function buildStep1Summary(data) {
  const parts = [];
  if (data.nombre) parts.push(data.nombre);
  const idParts = [];
  if (data.cedula) idParts.push(`C.I. ${data.cedula}`);
  if (data.edad) idParts.push(`${data.edad} años`);
  if (data.genero) idParts.push(data.genero);
  if (idParts.length) parts.push(idParts.join(' · '));
  if (data.profesion) parts.push(data.profesion);
  if (data.telefono) parts.push(`Tel. ${formatPhone(data.telefono)}`);
  const loc = data.extranjero
    ? (data.pais ? `Procedencia: ${data.pais}` : '')
    : [data.estado, data.municipio].filter(Boolean).join(' · ');
  if (loc) parts.push(loc);
  return parts;
}

/**
 * Construye el array de chips para el resumen del step 2.
 */
export function buildStep2Chips(data) {
  const chips = [...(data.areas ?? []), ...(data.certificaciones ?? [])];
  if (data.vehiculo) chips.push(`Vehículo: ${data.vehiculo}`);
  return chips;
}

/**
 * Construye el array de líneas de resumen del step 3.
 */
export function buildStep3Summary(data) {
  const lines = [];
  const zonas = (data.zonas ?? []).join(', ') || '—';
  lines.push(`Zonas: ${zonas}`);
  const hospedaje = data.hospedaje || 'Hospedaje sin indicar';
  const familiar = (data.familia ?? []).length ? ' · familiares en zona' : '';
  lines.push(`${hospedaje}${familiar}`);
  const movil = data.movilizacion || '—';
  const logis = (data.apoyoLogistico ?? []).length
    ? ` · apoyo: ${data.apoyoLogistico.join(', ')}`
    : '';
  lines.push(`Movilización: ${movil}${logis}`);
  const celdasActivas = (data.turnos ?? []).length;
  const tiempo = data.duracion === 'Personalizado'
    ? `${data.duracionDias ?? 7} días`
    : (data.duracion || '—');
  lines.push(`Turnos marcados: ${celdasActivas} · Duración: ${tiempo}`);
  return lines;
}
