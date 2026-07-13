// src/utils/constants.js
// Todas las constantes del proyecto centralizadas aquí.
// NUNCA hardcodear estas constantes en los componentes.

// ─── Estados de Venezuela ──────────────────────────────────────────────────
export const ESTADOS_VENEZUELA = [
  { value: '', label: 'Selecciona…' },
  { value: 'Amazonas', label: 'Amazonas' },
  { value: 'Anzoátegui', label: 'Anzoátegui' },
  { value: 'Apure', label: 'Apure' },
  { value: 'Aragua', label: 'Aragua' },
  { value: 'Barinas', label: 'Barinas' },
  { value: 'Bolívar', label: 'Bolívar' },
  { value: 'Carabobo', label: 'Carabobo' },
  { value: 'Cojedes', label: 'Cojedes' },
  { value: 'Delta Amacuro', label: 'Delta Amacuro' },
  { value: 'Distrito Capital', label: 'Distrito Capital' },
  { value: 'Falcón', label: 'Falcón' },
  { value: 'Guárico', label: 'Guárico' },
  { value: 'La Guaira (Vargas)', label: 'La Guaira (Vargas)' },
  { value: 'Lara', label: 'Lara' },
  { value: 'Mérida', label: 'Mérida' },
  { value: 'Miranda', label: 'Miranda' },
  { value: 'Monagas', label: 'Monagas' },
  { value: 'Nueva Esparta', label: 'Nueva Esparta' },
  { value: 'Portuguesa', label: 'Portuguesa' },
  { value: 'Sucre', label: 'Sucre' },
  { value: 'Táchira', label: 'Táchira' },
  { value: 'Trujillo', label: 'Trujillo' },
  { value: 'Yaracuy', label: 'Yaracuy' },
  { value: 'Zulia', label: 'Zulia' },
  { value: 'Otro', label: 'Otro' },
];

// ─── Áreas de apoyo ────────────────────────────────────────────────────────
export const AREAS_APOYO = [
  {
    value: 'Salud',
    label: 'Salud',
    desc: 'Médicos, enfermería, psicología, primeros auxilios.',
    hasSub: true,
    subId: 'sub-salud',
  },
  {
    value: 'Logística / Acopio',
    label: 'Logística / Acopio',
    desc: 'Clasificar, empacar y despachar insumos.',
    hasSub: false,
  },
  {
    value: 'Transporte',
    label: 'Transporte',
    desc: 'Traslado de personas o carga.',
    hasSub: true,
    subId: 'sub-transporte',
  },
  {
    value: 'Recreación / Familias',
    label: 'Recreación / Familias',
    desc: 'Acompañamiento a niños y familias.',
    hasSub: false,
  },
  {
    value: 'Soporte a rescatistas',
    label: 'Soporte a rescatistas',
    desc: 'Alimentación, hidratación y relevo de brigadas.',
    hasSub: false,
  },
];

// ─── Certificaciones ───────────────────────────────────────────────────────
export const CERTIFICACIONES = [
  { value: 'Primeros auxilios', label: 'Primeros auxilios' },
  { value: 'Rescate urbano', label: 'Rescate urbano' },
];

// ─── Tipos de vehículo ─────────────────────────────────────────────────────
export const TIPOS_VEHICULO = [
  { value: 'Moto', label: 'Moto' },
  { value: 'Carro', label: 'Carro' },
  { value: 'PickUp', label: 'PickUp' },
  { value: 'Camión', label: 'Camión' },
];

// ─── Grados académicos (Salud) ─────────────────────────────────────────────
export const GRADOS_ACADEMICOS = [
  { value: '', label: 'Selecciona…' },
  { value: 'Estudiante', label: 'Estudiante' },
  { value: 'Técnico', label: 'Técnico' },
  { value: 'Licenciado/a', label: 'Licenciado/a' },
  { value: 'Especialista', label: 'Especialista' },
];

// ─── Zonas de despliegue ───────────────────────────────────────────────────
export const ZONAS_DESPLIEGUE = [
  { value: 'Vargas · La Guaira', label: 'Vargas · La Guaira' },
  { value: 'Miranda · San Antonio', label: 'Miranda · San Antonio' },
  { value: 'Miranda · Los Teques', label: 'Miranda · Los Teques' },
  { value: 'Aragua · Maracay', label: 'Aragua · Maracay' },
];

// ─── Opciones de hospedaje ─────────────────────────────────────────────────
export const OPCIONES_HOSPEDAJE = [
  { value: 'Tengo dónde quedarme', label: 'Tengo dónde quedarme' },
  { value: 'Necesito hospedaje', label: 'Necesito hospedaje' },
];

// ─── Opciones de movilización ──────────────────────────────────────────────
export const OPCIONES_MOVIL = [
  { value: 'Transporte propio', label: 'Transporte propio' },
  { value: 'Necesito apoyo', label: 'Necesito apoyo' },
];

// ─── Opciones de apoyo logístico ───────────────────────────────────────────
export const APOYO_LOGISTICO = [
  { value: 'Alimentación', label: 'Alimentación' },
  { value: 'Equipo / insumos', label: 'Equipo / insumos' },
];

// ─── Duración disponibilidad ───────────────────────────────────────────────
export const DURACION_OPCIONES = [
  { value: '1 semana', label: '1 semana' },
  { value: '2 semanas', label: '2 semanas' },
  { value: '1 mes', label: '1 mes' },
  { value: 'Personalizado', label: 'Personalizado', hasSub: true },
];

// ─── Género ────────────────────────────────────────────────────────────────
export const GENEROS = [
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Masculino', label: 'Masculino' },
];

// ─── Grilla semanal ────────────────────────────────────────────────────────
export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const TURNOS = [
  { key: 'm', label: 'Mañana' },
  { key: 't', label: 'Tarde' },
  { key: 'n', label: 'Noche' },
  { key: '24h', label: '24 h' },
];

// ─── KPIs de impacto ───────────────────────────────────────────────────────
export const KPIS = [
  { value: 180, suffix: '+', labelKey: 'kpi1.label' },
  { value: 42, suffix: 't', labelKey: 'kpi2.label', suffixStyle: 'green' },
  { value: 1200, suffix: '+', labelKey: 'kpi3.label' },
  { value: 4, suffix: '', labelKey: 'kpi4.label' },
];

// ─── Plan de acción ────────────────────────────────────────────────────────
export const PLAN_ACCIONES = [
  {
    num: 1,
    img: 'foto-brigada-noche',
    titleKey: 'plan1.t',
    descKey: 'plan1.d',
  },
  {
    num: 2,
    img: 'foto-entrega-pickup',
    titleKey: 'plan2.t',
    descKey: 'plan2.d',
  },
  {
    num: 3,
    img: 'foto-reunion-noche',
    titleKey: 'plan3.t',
    descKey: 'plan3.d',
  },
  {
    num: 4,
    img: 'foto-mascarillas',
    titleKey: 'plan4.t',
    descKey: 'plan4.d',
  },
];

// ─── Donaciones — Datos REALES ─────────────────────────────────────────────
// Confirmados del análisis de infraestructura §12
export const DONACION_BANESCO = {
  titular: 'Eliú González',
  banco: 'Banesco',
  tipoCuenta: 'Cuenta Corriente',
  cuenta: '0134-0474-70-4741024984',
  cuentaCopy: '01340474704741024984',
  cedula: '11.819.533',
  telefono: '0412-0192578',
  concepto: 'Donación Terremoto Venezuela',
  conceptoEN: 'Venezuela Earthquake Donation',
  tipo: 'Nacional · Bs',
};

export const DONACION_ZELLE = {
  titular: 'Maria Gil',
  metodo: 'Zelle',
  numero: '7868057125',
  numeroCopy: '7868057125',
  concepto: 'Venezuela Earthquake Donation',
  conceptoES: 'Donación Terremoto Venezuela',
  tipo: 'Diáspora · USD',
  nota: 'Añade tu nombre en la nota para el recibo.',
  notaEN: 'Add your name in the note for the receipt.',
};

// ─── Centros de acopio ─────────────────────────────────────────────────────
export const CENTROS_ACOPIO = [
  {
    id: 'vargas',
    zona: 'Vargas',
    nombre: 'Casa Misionera',
    direccion: 'Calle Real de Pariata, a 100 m del hospital de Pariata, frente al CC de Pariata.',
    contactos: [{ nombre: 'Arturo S.', telefono: '0412-7005231', tel: '04127005231' }],
    mapa: 'https://maps.app.goo.gl/cuyPiZ8qtei4V78x7?g_st=iwb',
    horario: null,
  },
  {
    id: 'miranda-san-antonio',
    zona: 'Miranda',
    nombre: '1.ª Iglesia Bautista de San Antonio de Los Altos',
    direccion: 'Calle Sucre 22-24, entre Calle Junín y Calle Ayacucho.',
    contactos: [
      { nombre: 'Arturo S.', telefono: '0412-7005231', tel: '04127005231' },
      { nombre: 'Eliú G.', telefono: '0412-0192578', tel: '04120192578' },
    ],
    mapa: 'https://maps.app.goo.gl/UaCuKDktfhqE2Uec8?g_st=aw',
    horario: '7:00–10:00 a.m.',
  },
  {
    id: 'miranda-los-teques',
    zona: 'Miranda',
    nombre: 'Iglesia Filadelfia, Los Teques',
    direccion: 'Calle Las Belizas, San Antonio de Los Altos.',
    contactos: [{ nombre: null, telefono: '0212-3731672', tel: '02123731672' }],
    mapa: 'https://maps.app.goo.gl/LRxY8zkYxwsJTUwb8',
    horario: '10:00 a.m.–4:00 p.m.',
  },
  {
    id: 'aragua',
    zona: 'Aragua',
    nombre: 'Iglesia Evangélica de Los Robles "Árboles de Justicia"',
    direccion: 'Urb. Los Robles, calle Los Mangos, manzana H-32.',
    contactos: [
      { nombre: 'Norma Torres', telefono: '0412-7576609', tel: '04127576609' },
      { nombre: 'Steven Pedraza', telefono: '0424-3189757', tel: '04243189757' },
    ],
    mapa: 'https://maps.app.goo.gl/TVWEDsADYLutW9m86?g_st=aw',
    horario: null,
  },
];

// ─── Canales oficiales ─────────────────────────────────────────────────────
export const CANALES = {
  whatsappCanal: 'https://www.whatsapp.com/channel/0029Vb8XCc7IN9iqbd6FYh2s',
  instagramCanal: 'https://www.instagram.com/channel/AbaYt1e-K8GJhot-/',
  instagram: 'https://www.instagram.com/readysetgo_ve',
  whatsappContacto: 'https://api.whatsapp.com/message/DBZVMZ6Q7RP2G1',
  guiaOraciónVideo: 'https://www.canva.com/design/DAHNlTmoWa8/W_tgSqqulxUX54HI7YN9yA/watch',
  guiaOraciónPDF: 'https://drive.google.com/file/d/1pDpuK74WihkkJN2qJZl7QN0I2AjpeksP/view',
  casaMisioneraMap: 'https://maps.app.goo.gl/cuyPiZ8qtei4V78x7',
};

// ─── Imágenes de galería del impacto ───────────────────────────────────────
export const GALERIA_IMPACTO = [
  {
    src: 'foto-entrega-pickup',
    alt: 'Entrega de agua y alimentos',
    caption: 'Entrega de agua y alimentos · La Guaira',
    span: '2x2', // grid-column: span 2; grid-row: span 2
  },
  {
    src: 'foto-agua',
    alt: 'Insumos clasificados',
    caption: 'Centro de acopio',
    span: '1x1',
  },
  {
    src: 'foto-alimentos',
    alt: 'Comida para familias',
    caption: 'Comida caliente',
    span: '1x1',
  },
  {
    src: 'foto-reunion-noche',
    alt: 'Coordinación en campamento',
    caption: 'Coordinación en campamento',
    span: '1x1',
  },
  {
    src: 'foto-brigada-noche',
    alt: 'Brigadas de rescate',
    caption: 'Brigadas · turnos nocturnos',
    span: '1x1',
  },
];

// ─── Pasos del formulario ──────────────────────────────────────────────────
export const FORM_STEPS = [
  { step: 1, label: 'Datos personales', labelEN: 'Personal data' },
  { step: 2, label: 'Áreas de apoyo', labelEN: 'Support areas' },
  { step: 3, label: 'Disponibilidad', labelEN: 'Availability' },
  { step: 4, label: 'Revisión y envío', labelEN: 'Review & submit' },
];
