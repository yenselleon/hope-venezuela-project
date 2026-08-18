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
 * Enmascara un correo electrónico: "maria.gonzalez@correo.com" → "m****z@correo.com"
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '—';
  const [user, domain] = email.split('@');
  if (!domain) return maskData(email, 2);
  if (user.length <= 2) return `${user[0] || '*'}***@${domain}`;
  const first = user[0];
  const last = user[user.length - 1];
  return `${first}****${last}@${domain}`;
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
  if (data.email) parts.push(data.email);
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
  const chips = [];
  (data.areas ?? []).forEach((area) => {
    if (area === 'Otra área de apoyo' && data.otraArea) {
      chips.push(`Otra: ${data.otraArea}`);
    } else {
      chips.push(area);
    }
  });
  (data.certificaciones ?? []).forEach((cert) => chips.push(cert));
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

/**
 * Compara si una zona o centro geográfico coincide con el filtro seleccionado.
 */
export function matchZone(zoneOrCenter, targetFilter) {
  if (!targetFilter || targetFilter === 'Todas' || targetFilter === 'Todos') return true;
  if (!zoneOrCenter) return false;
  const zc = String(zoneOrCenter).toLowerCase();
  const tf = String(targetFilter).toLowerCase();
  if (zc === tf) return true;
  if ((tf.includes('caracas') || tf.includes('capital')) && (zc.includes('caracas') || zc.includes('capital'))) return true;
  if ((tf.includes('vargas') || tf.includes('guaira')) && (zc.includes('vargas') || zc.includes('guaira') || zc.includes('pariata') || zc.includes('misionera'))) return true;
  if (tf.includes('san antonio') && (zc.includes('san antonio') || zc.includes('salia'))) return true;
  if (tf.includes('los teques') && (zc.includes('los teques') || zc.includes('teques') || zc.includes('belizas'))) return true;
  if ((tf.includes('aragua') || tf.includes('maracay')) && (zc.includes('aragua') || zc.includes('maracay') || zc.includes('robles'))) return true;
  return zc.includes(tf) || tf.includes(zc);
}

