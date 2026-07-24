// src/i18n/translations.js
// Diccionario completo ES/EN extraído fielmente de los diseños de Claude Design.
// Estructura: { key: { es: '...', en: '...' } }

const translations = {
  // ─── Navegación ──────────────────────────────────────────────────────────
  'nav.about': { es: 'Nosotros', en: 'About' },
  'nav.plan': { es: 'Plan de acción', en: 'Action plan' },
  'nav.impact': { es: 'Impacto', en: 'Impact' },
  'nav.help': { es: 'Cómo ayudar', en: 'Get involved' },
  'nav.admin': { es: 'Acceso Admin', en: 'Admin Access' },

  // ─── CTAs ─────────────────────────────────────────────────────────────────
  'cta.volunteer': { es: 'Quiero ser voluntario', en: 'Become a volunteer' },
  'cta.volunteerShort': { es: 'Voluntario', en: 'Volunteer' },
  'cta.donate': { es: 'Donar', en: 'Donate' },
  'cta.back': { es: 'Volver al inicio', en: 'Back to home' },

  // ─── Hero ─────────────────────────────────────────────────────────────────
  'hero.eyebrow': { es: 'Campaña de Esperanza', en: 'A Campaign of Hope' },
  'hero.title': { es: 'Unidos para reconstruir la esperanza', en: 'United to rebuild hope' },
  'hero.sub': {
    es: 'Respuesta al terremoto del 24 de junio en La Guaira, Miranda y Aragua. Súmate como voluntario o aporta hoy.',
    en: 'Responding to the June 24 earthquake across La Guaira, Miranda and Aragua. Join as a volunteer or give today.',
  },
  'hero.trust': {
    es: 'Ready Set Go · avisos diarios por WhatsApp e Instagram',
    en: 'Ready Set Go · daily updates on WhatsApp & Instagram',
  },

  // ─── Impacto ──────────────────────────────────────────────────────────────
  'impact.eyebrow': { es: 'Nuestro impacto', en: 'Our impact' },
  'impact.title': { es: 'El trabajo que ya estamos haciendo', en: 'The work already underway' },
  'impact.sub': {
    es: 'Cada cifra es una familia acompañada. Esto es lo que juntos hemos logrado.',
    en: 'Every number is a family supported. This is what we\'ve achieved together.',
  },
  'kpi1.label': { es: 'Voluntarios activos', en: 'Active volunteers' },
  'kpi2.label': { es: 'Toneladas de insumos', en: 'Tonnes of supplies' },
  'kpi3.label': { es: 'Personas atendidas', en: 'People served' },
  'kpi4.label': { es: 'Zonas atendidas', en: 'Zones served' },

  // ─── Quiénes somos ────────────────────────────────────────────────────────
  'mission.eyebrow': { es: 'Quiénes somos', en: 'Who we are' },
  'mission.title': {
    es: 'Servimos con dignidad, actuamos con transparencia',
    en: 'We serve with dignity, act with transparency',
  },
  'mission.body': {
    es: 'Somos una red de voluntarios y comunidades de fe organizadas para responder al terremoto. Coordinamos personas, insumos y despliegue por zona, mostrando cada paso con claridad. No exhibimos el dolor: mostramos el trabajo y a las personas con respeto.',
    en: 'We are a network of volunteers and faith communities organized to respond to the earthquake. We coordinate people, supplies and deployment by zone, showing every step clearly. We don\'t exploit suffering — we show the work and the people with respect.',
  },
  'mission.tag': {
    es: '\u201cJuntos servimos, juntos reconstruimos\u201d',
    en: '\u201cTogether we serve, together we rebuild\u201d',
  },

  // ─── Nuestra misión ───────────────────────────────────────────────────────
  'purpose.eyebrow': { es: 'Nuestra misión', en: 'Our mission' },
  'purpose.title': {
    es: 'Llevar esperanza tangible a cada familia afectada',
    en: 'Bringing tangible hope to every affected family',
  },
  'purpose.body': {
    es: 'Movilizamos voluntarios, recursos y comunidades de fe para responder con rapidez, dignidad y transparencia ante la emergencia, acompañando a las familias desde el rescate hasta la reconstrucción de sus hogares.',
    en: 'We mobilize volunteers, resources and faith communities to respond with speed, dignity and transparency, walking with families from rescue through to rebuilding their homes.',
  },

  // ─── Casa Misionera ───────────────────────────────────────────────────────
  'casa.eyebrow': { es: 'Centro de recepción', en: 'Reception center' },
  'casa.title': { es: 'Casa Misionera', en: 'Casa Misionera' },
  'casa.body': {
    es: 'Nuestro centro principal de recepción y coordinación de voluntarios e insumos. Aquí se organizan las brigadas y se despacha la ayuda hacia las zonas afectadas.',
    en: 'Our main hub for receiving and coordinating volunteers and supplies. Here brigades are organized and aid is dispatched to the affected zones.',
  },
  'casa.addr': {
    es: 'Calle Real de Pariata, a 100 m del hospital de Pariata, frente al CC de Pariata · Vargas, La Guaira',
    en: 'Calle Real de Pariata, 100 m from Pariata hospital, across from CC de Pariata · Vargas, La Guaira',
  },
  'casa.map': { es: 'Ver ubicación en el mapa', en: 'View location on the map' },

  // ─── Plan de acción ───────────────────────────────────────────────────────
  'plan.eyebrow': { es: 'Plan de acción', en: 'Action plan' },
  'plan.title': { es: 'Cuatro fases, un mismo propósito', en: 'Four phases, one purpose' },
  'plan1.t': { es: 'Respuesta Inmediata', en: 'Immediate Response' },
  'plan1.d': {
    es: 'Búsqueda, rescate y atención urgente en las primeras horas.',
    en: 'Search, rescue and urgent care in the first hours.',
  },
  'plan2.t': { es: 'Ayuda Humanitaria', en: 'Humanitarian Aid' },
  'plan2.d': {
    es: 'Agua, alimentos, medicinas e insumos a las familias afectadas.',
    en: 'Water, food, medicine and supplies for affected families.',
  },
  'plan3.t': { es: 'Acompañamiento Integral', en: 'Ongoing Support' },
  'plan3.d': {
    es: 'Apoyo emocional, espiritual y logístico sostenido en el tiempo.',
    en: 'Emotional, spiritual and logistical support over time.',
  },
  'plan4.t': { es: 'Recuperación y Reconstrucción', en: 'Recovery & Rebuilding' },
  'plan4.d': {
    es: 'Reconstruir hogares y devolver la normalidad a la comunidad.',
    en: 'Rebuilding homes and restoring normal life for the community.',
  },

  // ─── Cómo ayudar ──────────────────────────────────────────────────────────
  'help.eyebrow': { es: 'Cómo puedes ayudar', en: 'How you can help' },
  'help.title': { es: 'Cuatro formas de sumarte hoy', en: 'Four ways to join today' },
  'help1': { es: 'Orar', en: 'Pray' },
  'help1d': { es: 'Guía de oración de 7 días.', en: 'A 7-day prayer guide.' },
  'help2': { es: 'Donar', en: 'Donate' },
  'help2d': { es: 'Fondos por Banesco o Zelle.', en: 'Give via Banesco or Zelle.' },
  'help3': { es: 'Ser voluntario', en: 'Volunteer' },
  'help3d': { es: 'Regístrate en minutos.', en: 'Register in minutes.' },
  'help4': { es: 'Compartir', en: 'Share' },
  'help4d': { es: 'Difunde la campaña.', en: 'Spread the word.' },

  // ─── Mantente informado ───────────────────────────────────────────────────
  'stay.eyebrow': { es: 'Mantente informado', en: 'Stay informed' },
  'stay.title': { es: 'Sigue cada paso de la campaña', en: 'Follow every step of the campaign' },
  'stay.sub': {
    es: 'Recibe actualizaciones diarias sobre el avance del operativo, nuevas necesidades y testimonios del trabajo.',
    en: 'Get daily updates on operational progress, new needs and testimonials from the field.',
  },
  'stay.whatsapp': { es: 'Canal de WhatsApp', en: 'WhatsApp Channel' },
  'stay.whatsapp.desc': { es: 'Avisos y coordinación en tiempo real.', en: 'Real-time alerts and coordination.' },
  'stay.instagram': { es: 'Instagram', en: 'Instagram' },
  'stay.instagram.desc': { es: 'Fotos, historias y reportes diarios.', en: 'Photos, stories and daily reports.' },

  // ─── Impacto extra ────────────────────────────────────────────────────────
  'impact.disclaimer': {
    es: 'Cifras de ejemplo — se alimentan en vivo desde el sistema.',
    en: 'Sample figures — fed live from the system.',
  },

  // ─── Footer ───────────────────────────────────────────────────────────────
  'footer.motto': {
    es: 'Juntos servimos, juntos reconstruimos',
    en: 'Together we serve, together we rebuild',
  },
  'footer.transparency': {
    es: 'Transparencia: cada aporte se registra y se reporta a la comunidad.',
    en: 'Transparency: every contribution is recorded and reported back to the community.',
  },
  'footer.rights': { es: 'Hope en Venezuela · Ready Set Go', en: 'Hope en Venezuela · Ready Set Go' },
  'footer.admin': { es: 'Acceso administradores', en: 'Admin access' },

  // ─── Página Donar ─────────────────────────────────────────────────────────
  'donar.eyebrow': { es: 'Súmate hoy', en: 'Join today' },
  'donar.title': { es: 'Donar', en: 'Donate' },
  'donar.sub': {
    es: 'Puedes acercar tus insumos a un centro de acopio o aportar fondos. Cada aporte se registra y se reporta a la comunidad.',
    en: 'You can bring supplies to a collection center or contribute funds. Every contribution is recorded and reported to the community.',
  },
  'donar.tab.acopio': { es: 'Insumos / Acopio', en: 'Supplies / Drop-off' },
  'donar.tab.fondos': { es: 'Fondos', en: 'Funds' },
  'donar.verUbicacion': { es: 'Ver ubicación', en: 'View location' },
  'donar.copiar': { es: 'Copiar', en: 'Copy' },
  'donar.copiado': { es: '¡Copiado!', en: 'Copied!' },
  'donar.insumos.info': {
    es: 'Insumos prioritarios: agua potable, alimentos no perecederos, medicinas, artículos de higiene y colchones. Llama antes de trasladar cargas grandes para coordinar la recepción.',
    en: 'Priority supplies: drinking water, non-perishable food, medicines, hygiene items and mattresses. Call before transporting large loads to coordinate reception.',
  },
  'donar.banesco.concepto': { es: 'Donación Terremoto Venezuela', en: 'Venezuela Earthquake Donation' },
  'donar.zelle.nota': {
    es: 'Añade tu nombre en la nota para el recibo.',
    en: 'Add your name in the note for the receipt.',
  },

  // ─── Formulario de Registro ───────────────────────────────────────────────
  'registro.title': { es: 'Registro de Voluntario', en: 'Volunteer Registration' },
  'registro.step1.title': { es: 'Datos personales', en: 'Personal data' },
  'registro.step1.sub': {
    es: 'Cuéntanos quién eres para poder contactarte.',
    en: 'Tell us who you are so we can reach you.',
  },
  'registro.step2.title': { es: 'Áreas de apoyo', en: 'Support areas' },
  'registro.step2.sub': {
    es: 'Selecciona una o varias. Algunas abren preguntas adicionales.',
    en: 'Select one or more. Some will open additional questions.',
  },
  'registro.step3.title': { es: 'Disponibilidad y despliegue', en: 'Availability & deployment' },
  'registro.step3.sub': {
    es: 'Dónde y cuándo puedes apoyar, y qué necesitas para hacerlo.',
    en: 'Where and when you can help, and what you need to do it.',
  },
  'registro.step4.title': { es: 'Revisión y envío', en: 'Review & submit' },
  'registro.step4.sub': {
    es: 'Revisa que todo esté correcto antes de enviar.',
    en: 'Check that everything is correct before submitting.',
  },
  'registro.stepLabel': { es: 'Paso', en: 'Step' },
  'registro.stepOf': { es: 'de', en: 'of' },
  'registro.next': { es: 'Siguiente →', en: 'Next →' },
  'registro.prev': { es: '← Atrás', en: '← Back' },
  'registro.submit': { es: 'Enviar registro', en: 'Submit registration' },
  'registro.submitting': { es: 'Enviando…', en: 'Submitting…' },
  'registro.edit': { es: 'Editar', en: 'Edit' },
  'registro.consent': {
    es: 'Autorizo a Hope en Venezuela a contactarme y a usar mis datos para coordinar mi participación como voluntario.',
    en: 'I authorize Hope en Venezuela to contact me and use my data to coordinate my volunteer participation.',
  },
  // Campos
  'campo.nombre': { es: 'Nombre y apellidos', en: 'Full name' },
  'campo.cedula': { es: 'Cédula de identidad', en: 'ID number' },
  'campo.edad': { es: 'Edad', en: 'Age' },
  'campo.telefono': { es: 'Teléfono', en: 'Phone' },
  'campo.genero': { es: 'Género', en: 'Gender' },
  'campo.estado': { es: 'Estado', en: 'State' },
  'campo.municipio': { es: 'Municipio', en: 'Municipality' },
  'campo.profesion': { es: 'Profesión u oficio', en: 'Profession or trade' },
  'campo.extranjero': { es: 'Soy voluntario internacional / resido fuera de Venezuela', en: 'I am an international volunteer / reside outside Venezuela' },
  'campo.pais': { es: 'País de procedencia', en: 'Country of origin' },
  'campo.especialidad': { es: 'Especialidad', en: 'Specialty' },
  'campo.grado': { es: 'Grado académico', en: 'Academic degree' },
  'campo.vehiculo': { es: 'Tipo de vehículo', en: 'Vehicle type' },
  'campo.certificaciones': { es: 'Certificaciones (opcional)', en: 'Certifications (optional)' },
  'campo.zonas': { es: '¿Dónde puedes prestar apoyo?', en: 'Where can you provide support?' },
  'campo.hospedaje': { es: 'Hospedaje en esa zona', en: 'Accommodation in that zone' },
  'campo.familiarZona': { es: 'Tengo familiares en la zona', en: 'I have family in the area' },
  'campo.movilizacion': { es: 'Movilización', en: 'Transportation' },
  'campo.apoyoLogistico': { es: '¿Necesitas apoyo logístico?', en: 'Do you need logistical support?' },
  'campo.horario': { es: 'Días y horario disponibles', en: 'Available days and schedule' },
  'campo.horarioHint': { es: 'toca las casillas', en: 'tap the cells' },
  'campo.duracion': { es: '¿Por cuánto tiempo?', en: 'For how long?' },
  'campo.duracionPersonalizada': {
    es: 'Indica los días que estarías disponible',
    en: 'Indicate the days you would be available',
  },
  // Resumen (step 4)
  'review.personal': { es: 'Datos personales', en: 'Personal data' },
  'review.areas': { es: 'Áreas y certificaciones', en: 'Areas & certifications' },
  'review.availability': { es: 'Disponibilidad', en: 'Availability' },
  // Confirmación
  'confirm.title': { es: '¡Gracias por sumarte!', en: 'Thank you for joining!' },
  'confirm.sub': {
    es: 'Recibimos tu registro. Un coordinador te contactará por WhatsApp en las próximas horas para confirmar tu zona y turno.',
    en: 'We received your registration. A coordinator will contact you via WhatsApp in the coming hours to confirm your zone and shift.',
  },
  'confirm.next.eyebrow': { es: 'Qué sigue', en: 'What\'s next' },
  'confirm.next.1': { es: 'Revisamos tu perfil', en: 'We review your profile' },
  'confirm.next.2': { es: 'Te contactamos por WhatsApp', en: 'We contact you via WhatsApp' },
  'confirm.next.3': { es: 'Recibes tu zona y turno asignados', en: 'You receive your assigned zone and shift' },
  'confirm.whatsapp': { es: 'Unirme al canal de WhatsApp', en: 'Join the WhatsApp channel' },
  'confirm.instagram': { es: 'Seguir en Instagram', en: 'Follow on Instagram' },
  'confirm.home': { es: 'Volver al inicio', en: 'Back to home' },
  // Grilla
  'turno.manana': { es: 'Mañana', en: 'Morning' },
  'turno.tarde': { es: 'Tarde', en: 'Afternoon' },
  'turno.noche': { es: 'Noche', en: 'Night' },
  'turno.24h': { es: '24 h', en: '24 h' },

  // ─── Panel Admin (Claude Design Reference) ──────────────────────────────────

  // Login — split layout
  'admin.login.brand': { es: 'Hope · Admin', en: 'Hope · Admin' },
  'admin.login.console': { es: 'Consola de coordinación', en: 'Coordination console' },
  'admin.login.console.desc': { es: 'Gestión de voluntarios, aprobaciones e insumos de la campaña. Acceso exclusivo para administradores y coordinadores.', en: 'Volunteer management, approvals and campaign supplies. Exclusive access for administrators and coordinators.' },
  'admin.login.tagline': { es: 'Juntos servimos, juntos reconstruimos', en: 'Together we serve, together we rebuild' },
  'admin.login.title': { es: 'Iniciar sesión', en: 'Sign in' },
  'admin.login.subtitle': { es: 'Ingresa con tus credenciales de administrador.', en: 'Enter your admin credentials.' },
  'admin.login.email': { es: 'Correo', en: 'Email' },
  'admin.login.email.placeholder': { es: 'tu@correo.org', en: 'you@email.org' },
  'admin.login.password': { es: 'Contraseña', en: 'Password' },
  'admin.login.forgot': { es: '¿Olvidaste tu contraseña?', en: 'Forgot your password?' },
  'admin.login.submit': { es: 'Entrar', en: 'Sign in' },
  'admin.login.loading': { es: 'Ingresando…', en: 'Signing in…' },
  'admin.login.error': { es: 'Credenciales inválidas. Verifica e intenta de nuevo.', en: 'Invalid credentials. Please try again.' },
  'admin.login.restricted': { es: 'Acceso solo para administradores autorizados', en: 'Access restricted to authorized admins' },
  'admin.login.back': { es: '← Volver al sitio público', en: '← Back to public site' },

  // Sidebar navigation
  'admin.nav.dashboard': { es: 'Dashboard', en: 'Dashboard' },
  'admin.nav.voluntarios': { es: 'Voluntarios', en: 'Volunteers' },
  'admin.nav.aprobacion': { es: 'Aprobación', en: 'Approval' },
  'admin.nav.inventario': { es: 'Inventario', en: 'Inventory' },
  'admin.nav.inventario.title': { es: 'Inventario de insumos', en: 'Supply Inventory' },
  'admin.nav.personal': { es: 'Personal', en: 'Personnel' },
  'admin.logout': { es: 'Cerrar sesión', en: 'Sign out' },

  // Topbar
  'admin.search': { es: 'Buscar voluntario…', en: 'Search volunteer…' },
  'admin.filter.zona': { es: 'Zona: Todas', en: 'Zone: All' },
  'admin.filter.zona.all': { es: 'Zona: Todas', en: 'Zone: All' },
  'admin.filter.zona.vargas': { es: 'Vargas · La Guaira', en: 'Vargas · La Guaira' },
  'admin.filter.zona.sanantonio': { es: 'Miranda · San Antonio', en: 'Miranda · San Antonio' },
  'admin.filter.zona.losteques': { es: 'Miranda · Los Teques', en: 'Miranda · Los Teques' },
  'admin.filter.zona.aragua': { es: 'Aragua · Maracay', en: 'Aragua · Maracay' },
  'admin.filter.daterange': { es: 'Últimos 7 días', en: 'Last 7 days' },
  'admin.filter.daterange.7d': { es: 'Últimos 7 días', en: 'Last 7 days' },
  'admin.filter.daterange.15d': { es: 'Últimos 15 días', en: 'Last 15 days' },
  'admin.filter.daterange.30d': { es: 'Últimos 30 días', en: 'Last 30 days' },
  'admin.filter.daterange.all': { es: 'Todo el tiempo', en: 'All time' },
  'admin.dash.totalUnits': { es: 'total', en: 'total' },

  // Dashboard KPIs
  'admin.kpi.total': { es: 'Voluntarios totales', en: 'Total volunteers' },
  'admin.kpi.activos': { es: 'Activos', en: 'Active' },
  'admin.kpi.pendientes': { es: 'Pendientes por aprobar', en: 'Pending approval' },
  'admin.kpi.insumos': { es: 'Insumos contabilizados', en: 'Supplies counted' },
  'admin.kpi.alertas': { es: 'Alertas críticas', en: 'Critical alerts' },

  // Dashboard charts
  'admin.chart.areas': { es: 'Voluntarios por área / habilidad', en: 'Volunteers by area / skill' },
  'admin.chart.estado': { es: 'Voluntarios por estado', en: 'Volunteers by status' },
  'admin.chart.cobertura': { es: 'Cobertura por zona (desplegados)', en: 'Coverage by zone (deployed)' },
  'admin.chart.insumos': { es: 'Insumos por categoría · alertas', en: 'Supplies by category · alerts' },
  'admin.chart.lowcoverage': { es: 'con baja cobertura — priorizar asignación', en: 'with low coverage — prioritize assignment' },

  // Supply categories
  'admin.supply.agua': { es: 'Agua potable', en: 'Drinking water' },
  'admin.supply.alimentos': { es: 'Alimentos', en: 'Food' },
  'admin.supply.medicinas': { es: 'Medicinas', en: 'Medicines' },
  'admin.supply.higiene': { es: 'Higiene', en: 'Hygiene' },
  'admin.supply.colchones': { es: 'Colchones', en: 'Mattresses' },
  'admin.supply.ok': { es: 'OK', en: 'OK' },
  'admin.supply.low': { es: 'Stock bajo', en: 'Low stock' },
  'admin.supply.expiring': { es: 'Vence pronto', en: 'Expiring soon' },

  // Chart status labels
  'admin.status.activos': { es: 'Activos', en: 'Active' },
  'admin.status.pendientes': { es: 'Pendientes', en: 'Pending' },
  'admin.status.aprobados': { es: 'Aprobados', en: 'Approved' },
  'admin.status.rechazados': { es: 'Rechazados', en: 'Rejected' },

  // Voluntarios panel
  'admin.vol.registros': { es: 'registros', en: 'records' },
  'admin.vol.export': { es: 'Exportar', en: 'Export' },
  'admin.vol.showing': { es: 'Mostrando', en: 'Showing' },
  'admin.vol.of': { es: 'de', en: 'of' },
  'admin.vol.noResults': { es: 'Sin resultados para los filtros aplicados.', en: 'No results for the applied filters.' },

  // Chip filters
  'admin.chip.salud': { es: 'Salud', en: 'Health' },
  'admin.chip.logistica': { es: 'Logística', en: 'Logistics' },
  'admin.chip.transporte': { es: 'Transporte', en: 'Transport' },
  'admin.chip.familias': { es: 'Familias', en: 'Families' },
  'admin.chip.certificados': { es: '★ Certificados', en: '★ Certified' },
  'admin.chip.pendiente': { es: 'Estado: pendiente', en: 'Status: pending' },
  'admin.chip.activo': { es: 'Estado: activo', en: 'Status: active' },

  // Table headers
  'admin.table.nombre': { es: 'Nombre', en: 'Name' },
  'admin.table.cedula': { es: 'Cédula', en: 'ID' },
  'admin.table.area': { es: 'Área', en: 'Area' },
  'admin.table.zona': { es: 'Zona', en: 'Zone' },
  'admin.table.estado': { es: 'Estado', en: 'Status' },
  'admin.table.sinAsignar': { es: 'Sin asignar', en: 'Not assigned' },

  // Drawer detail
  'admin.drawer.title': { es: 'Detalle del voluntario', en: 'Volunteer detail' },
  'admin.drawer.sensitive': { es: 'Datos sensibles', en: 'Sensitive data' },
  'admin.drawer.reveal': { es: '👁 Revelar', en: '👁 Reveal' },
  'admin.drawer.hide': { es: '🙈 Ocultar', en: '🙈 Hide' },
  'admin.drawer.cedula': { es: 'Cédula', en: 'ID number' },
  'admin.drawer.telefono': { es: 'Teléfono', en: 'Phone' },
  'admin.drawer.edadGenero': { es: 'Edad · género', en: 'Age · gender' },
  'admin.drawer.areasYCerts': { es: 'Áreas y certificaciones', en: 'Areas and certifications' },
  'admin.drawer.disponibilidad': { es: 'Disponibilidad', en: 'Availability' },
  'admin.drawer.zonaAsignada': { es: 'Zona asignada', en: 'Assigned zone' },
  'admin.drawer.zonaDeseada': { es: 'Zona deseada', en: 'Desired zone' },
  'admin.drawer.sinCerts': { es: 'Sin certificaciones', en: 'No certifications' },
  'admin.drawer.vehiculo': { es: 'Vehículo', en: 'Vehicle' },
  'admin.drawer.aprobar': { es: 'Aprobar', en: 'Approve' },
  'admin.drawer.rechazar': { es: 'Rechazar', en: 'Reject' },
  'admin.drawer.editarEstado': { es: 'Editar estado', en: 'Edit status' },

  // Status pills
  'admin.pill.activo': { es: 'Activo', en: 'Active' },
  'admin.pill.pendiente': { es: 'Pendiente', en: 'Pending' },
  'admin.pill.aprobado': { es: 'Aprobado', en: 'Approved' },
  'admin.pill.menor': { es: 'menor', en: 'minor' },

  // Aprobación panel
  'admin.apr.enCola': { es: 'en cola', en: 'in queue' },
  'admin.apr.desc': { es: 'Revisa y aprueba los registros nuevos.', en: 'Review and approve new registrations.' },
  'admin.apr.selectAll': { es: 'Seleccionar todos', en: 'Select all' },
  'admin.apr.aprobarSel': { es: 'Aprobar seleccionados', en: 'Approve selected' },
  'admin.apr.allDone': { es: '¡Todo al día!', en: 'All caught up!' },
  'admin.apr.allDoneDesc': { es: 'No hay voluntarios pendientes por aprobar.', en: 'No volunteers pending approval.' },
  'admin.apr.approved': { es: 'Voluntario aprobado', en: 'Volunteer approved' },
  'admin.apr.rejected': { es: 'Voluntario rechazado', en: 'Volunteer rejected' },
  'admin.apr.batchDone': { es: 'aprobados correctamente', en: 'approved successfully' },

  // Area labels (for charts)
  'admin.area.salud': { es: 'Salud', en: 'Health' },
  'admin.area.logistica': { es: 'Logística', en: 'Logistics' },
  'admin.area.transporte': { es: 'Transporte', en: 'Transport' },
  'admin.area.familias': { es: 'Familias', en: 'Families' },
  'admin.area.rescate': { es: 'Rescate', en: 'Rescue' },

  // Mobile tabs
  'admin.nav.mas': { es: 'Más', en: 'More' },
  'admin.mtab.panel': { es: 'Panel', en: 'Dashboard' },
  'admin.mtab.voluntarios': { es: 'Voluntarios', en: 'Volunteers' },
  'admin.mtab.aprobar': { es: 'Aprobar', en: 'Approve' },
  'admin.mtab.salir': { es: 'Salir', en: 'Logout' },

  // Toast messages
  'admin.toast.revealed': { es: 'Datos revelados (registrado)', en: 'Data revealed (logged)' },
  'admin.toast.hidden': { es: 'Datos ocultados', en: 'Data hidden' },
  'admin.toast.exported': { es: 'Datos exportados', en: 'Data exported' },

  // Turno labels for admin
  'admin.turno.m': { es: 'Mañana', en: 'Morning' },
  'admin.turno.t': { es: 'Tarde', en: 'Afternoon' },
  'admin.turno.n': { es: 'Noche', en: 'Night' },

  // ─── Admin Panel v2 (redesign) ────────────────────────────────────────────

  // Login branding
  'admin.login.console.title': { es: 'Consola de coordinación', en: 'Coordination console' },
  'admin.login.console.desc': { es: 'Gestión de voluntarios, aprobaciones e insumos de la campaña. Acceso exclusivo para administradores y coordinadores.', en: 'Volunteer management, approvals and campaign supplies. Exclusive access for administrators and coordinators.' },
  'admin.login.tagline': { es: 'Juntos servimos, juntos reconstruimos', en: 'Together we serve, together we rebuild' },
  'admin.login.heading': { es: 'Iniciar sesión', en: 'Sign in' },
  'admin.login.subtitle': { es: 'Ingresa con tus credenciales de administrador.', en: 'Enter your admin credentials.' },
  'admin.login.email.label': { es: 'Correo', en: 'Email' },
  'admin.login.password.label': { es: 'Contraseña', en: 'Password' },
  'admin.login.forgot': { es: '¿Olvidaste tu contraseña?', en: 'Forgot your password?' },
  'admin.login.adminOnly': { es: 'Acceso solo para administradores autorizados', en: 'Authorized administrators only' },
  'admin.login.backPublic': { es: 'Volver al sitio público', en: 'Back to public site' },

  // Nav items
  'admin.nav.voluntarios': { es: 'Voluntarios', en: 'Volunteers' },
  'admin.nav.aprobacion': { es: 'Aprobación', en: 'Approval' },
  'admin.nav.aprobacion.title': { es: 'Aprobación de voluntarios', en: 'Volunteer approval' },
  'admin.nav.inventario': { es: 'Inventario', en: 'Inventory' },
  'admin.nav.personal': { es: 'Personal', en: 'Staff' },
  'admin.nav.aprobar': { es: 'Aprobar', en: 'Approve' },
  'admin.nav.salir': { es: 'Salir', en: 'Exit' },
  'admin.role.coordinador': { es: 'Coordinador', en: 'Coordinator' },

  // Topbar
  'admin.topbar.last7days': { es: 'Últimos 7 días', en: 'Last 7 days' },

  // Dashboard KPIs
  'admin.dash.kpi.total': { es: 'Voluntarios totales', en: 'Total volunteers' },
  'admin.dash.kpi.pending': { es: 'Pendientes por aprobar', en: 'Pending approval' },
  'admin.dash.kpi.supplies': { es: 'Insumos contabilizados', en: 'Supplies counted' },
  'admin.dash.kpi.alerts': { es: 'Alertas críticas', en: 'Critical alerts' },

  // Dashboard charts
  'admin.dash.byArea': { es: 'Voluntarios por área / habilidad', en: 'Volunteers by area / skill' },
  'admin.dash.byStatus': { es: 'Voluntarios por estado', en: 'Volunteers by status' },
  'admin.dash.aprobados': { es: 'Aprobados', en: 'Approved' },
  'admin.dash.zoneCoverage': { es: 'Cobertura por zona (desplegados)', en: 'Zone coverage (deployed)' },
  'admin.dash.lowCoverage': { es: 'Los Teques con baja cobertura — priorizar asignación', en: 'Los Teques with low coverage — prioritize assignment' },
  'admin.dash.supplies': { es: 'Insumos por categoría · alertas', en: 'Supplies by category · alerts' },

  // Supply names
  'admin.supply.water': { es: 'Agua potable', en: 'Drinking water' },
  'admin.supply.food': { es: 'Alimentos', en: 'Food' },
  'admin.supply.medicine': { es: 'Medicinas', en: 'Medicines' },
  'admin.supply.hygiene': { es: 'Higiene', en: 'Hygiene' },
  'admin.supply.mattresses': { es: 'Colchones', en: 'Mattresses' },

  // Status labels
  'admin.status.activo': { es: 'Activo', en: 'Active' },
  'admin.status.pendiente': { es: 'Pendiente', en: 'Pending' },
  'admin.status.aprobado': { es: 'Aprobado', en: 'Approved' },
  'admin.status.rechazado': { es: 'Rechazado', en: 'Rejected' },

  // Voluntarios panel
  'admin.vol.empty': { es: 'Sin resultados para los filtros aplicados.', en: 'No results for the applied filters.' },

  // Drawer detail
  'admin.detail.sensitive': { es: 'Datos sensibles', en: 'Sensitive data' },
  'admin.detail.ageGender': { es: 'Edad · género', en: 'Age · gender' },
  'admin.detail.noCerts': { es: 'Sin certificaciones', en: 'No certifications' },
  'admin.detail.zoneAssigned': { es: 'Zona asignada', en: 'Assigned zone' },
  'admin.detail.desiredZone': { es: 'Zona deseada', en: 'Desired zone' },

  // Flags
  'admin.flag.menor': { es: 'Menor de edad', en: 'Underage' },
  'admin.flag.rescate': { es: 'Rescate urbano', en: 'Urban rescue' },

  // Actions
  'admin.action.approve': { es: 'Aprobar', en: 'Approve' },
  'admin.action.reject': { es: 'Rechazar', en: 'Reject' },
  'admin.action.editStatus': { es: 'Editar estado', en: 'Edit status' },
  'admin.action.view': { es: 'Ver', en: 'View' },

  // Aprobación panel
  'admin.apr.inQueue': { es: 'en cola', en: 'in queue' },
  'admin.apr.reviewDesc': { es: 'Revisa y aprueba los registros nuevos.', en: 'Review and approve new registrations.' },
  'admin.apr.batchApprove': { es: 'Aprobar seleccionados', en: 'Approve selected' },
  'admin.apr.allClear': { es: '¡Todo al día!', en: 'All caught up!' },
  'admin.apr.noPending': { es: 'No hay voluntarios pendientes por aprobar.', en: 'No volunteers pending approval.' },
  'admin.apr.selectAtLeast': { es: 'Selecciona al menos un voluntario', en: 'Select at least one volunteer' },
  'admin.apr.years': { es: 'años', en: 'years' },
  'admin.apr.desiredZone': { es: 'zona deseada', en: 'desired zone' },
  'admin.apr.confirmReject.title': { es: 'Rechazar voluntario', en: 'Reject volunteer' },
  'admin.apr.confirmReject.desc': { es: '¿Estás seguro de que deseas rechazar a este voluntario? Esta acción cambiará su estado a "rechazado".', en: 'Are you sure you want to reject this volunteer? This action will change their status to "rejected".' },
  'admin.apr.confirmReject.action': { es: 'Sí, rechazar', en: 'Yes, reject' },

  // Toasts
  'admin.toast.approved': { es: 'aprobado', en: 'approved' },
  'admin.toast.rejected': { es: 'rechazado', en: 'rejected' },
  'admin.toast.batchApproved': { es: 'voluntarios aprobados', en: 'volunteers approved' },
  'admin.toast.error': { es: 'Error al procesar la solicitud.', en: 'Error processing request.' },
  'admin.toast.dataRevealed': { es: 'Datos revelados (registrado)', en: 'Data revealed (logged)' },
  'admin.toast.dataHidden': { es: 'Datos ocultados', en: 'Data hidden' },
  'admin.toast.export': { es: 'Exportar: elige formato y columnas (demo)', en: 'Export: choose format and columns (demo)' },

  // Validation
  'validation.profesion': { es: 'Indica tu profesión u oficio.', en: 'Enter your profession or trade.' },

  // Asignación de Zonas y Turnos
  'admin.assign.title': { es: 'Asignar Zona y Turno', en: 'Assign Zone & Shift' },
  'admin.assign.zona': { es: 'Zona de Despliegue', en: 'Deployment Zone' },
  'admin.assign.turno': { es: 'Turno Asignado', en: 'Assigned Shift' },
  'admin.assign.notas': { es: 'Notas administrativas / observaciones', en: 'Administrative notes / observations' },
  'admin.assign.success': { es: '✓ Voluntario asignado correctamente.', en: '✓ Volunteer successfully assigned.' },
  'admin.assign.error': { es: 'Error al asignar el voluntario.', en: 'Error assigning volunteer.' },
  'admin.assign.cancel': { es: 'Cancelar', en: 'Cancel' },
  'admin.assign.save': { es: 'Guardar asignación', en: 'Save assignment' },
  'admin.assign.saving': { es: 'Guardando…', en: 'Saving…' },

  // Exportación
  'admin.export.title': { es: 'Exportar Registro de Voluntarios', en: 'Export Volunteer Registry' },
  'admin.export.format': { es: 'Selecciona el formato de exportación', en: 'Select export file format' },
  'admin.export.warning': { es: 'Advertencia: este archivo contiene datos civiles y personales sensibles (Cédulas y Teléfonos). Úsalo solo para fines oficiales de coordinación de la campaña.', en: 'Warning: this file contains sensitive personal and civil data (ID & Phone numbers). Use only for official campaign coordination purposes.' },
  'admin.export.btnExcel': { es: 'Exportar a Excel (.xlsx)', en: 'Export to Excel (.xlsx)' },
  'admin.export.btnPdf': { es: 'Exportar a PDF (.pdf)', en: 'Export to PDF (.pdf)' },

  // Navegación
  'admin.nav.mapeo': { es: 'Despliegue', en: 'Deployment' },
  'admin.nav.mapeo.title': { es: 'Mapeo por zona', en: 'Zone Mapping' },
  'admin.nav.analitica': { es: 'Analítica', en: 'Analytics' },
  'admin.nav.analitica.title': { es: 'Analítica de insumos', en: 'Supply Analytics' },

  // Mapeo Panel
  'admin.mapeo.desc': { es: 'Visualiza el despliegue de voluntarios y asígnalos a zonas afectadas.', en: 'Visualize volunteer deployment and assign them to affected zones.' },
  'admin.mapeo.volunteerCount': { es: 'voluntarios en esta zona', en: 'volunteers in this zone' },
  'admin.mapeo.noVolunteers': { es: 'Sin voluntarios asignados en esta zona.', en: 'No volunteers assigned to this zone.' },
  'admin.mapeo.assignZone': { es: 'Asignar a Zona', en: 'Assign to Zone' },
  'admin.mapeo.volunteersList': { es: 'Lista de Voluntarios', en: 'Volunteers List' },
  'admin.mapeo.selectVolunteer': { es: 'Selecciona un voluntario del panel lateral o del mapa', en: 'Select a volunteer from the sidebar or the map' },
  'admin.mapeo.currentZone': { es: 'Zona actual', en: 'Current zone' },
  'admin.mapeo.viewList': { es: 'Vista de Lista', en: 'List View' },
  'admin.mapeo.viewMap': { es: 'Vista de Mapa', en: 'Map View' },
  'admin.mapeo.totalDeployed': { es: 'Total desplegados', en: 'Total deployed' },
  'admin.mapeo.registered': { es: 'Registrado', en: 'Registered' },
  'admin.mapeo.unassigned': { es: 'Sin asignar', en: 'Unassigned' },

  // Inventario Panel
  'admin.supply.desc': { es: 'Gestión y analítica de agua, alimentos, medicinas y suministros de emergencia.', en: 'Management and analytics for water, food, medicine and emergency supplies.' },
  'admin.supply.alert.understocked': { es: 'Alerta de Stock Mínimo', en: 'Low Stock Alert' },
  'admin.supply.alert.expiring': { es: 'Alerta de Vencimiento', en: 'Expiration Alert' },
  'admin.supply.tab.stock': { es: 'Inventario de Insumos', en: 'Supplies Inventory' },
  'admin.supply.tab.movements': { es: 'Auditoría de Movimientos', en: 'Movements Audit' },
  'admin.supply.tab.analytics': { es: 'Analítica', en: 'Analytics' },
  'admin.supply.add': { es: 'Alta rápida', en: 'Quick Input' },
  'admin.supply.registerMovement': { es: 'Registrar Movimiento', en: 'Register Movement' },
  'admin.supply.movement.type': { es: 'Tipo de movimiento', en: 'Movement type' },
  'admin.supply.movement.entry': { es: 'Entrada', en: 'Entry' },
  'admin.supply.movement.exit': { es: 'Salida', en: 'Exit' },
  'admin.supply.movement.qty': { es: 'Cantidad', en: 'Quantity' },
  'admin.supply.movement.concepto': { es: 'Concepto / Detalle', en: 'Concept / Detail' },
  'admin.supply.minStock': { es: 'Stock mínimo', en: 'Min stock' },
  'admin.supply.expDate': { es: 'Fecha de vencimiento', en: 'Expiration date' },
  'admin.supply.unit': { es: 'Unidad de medida', en: 'Unit of measure' },
  'admin.supply.itemName': { es: 'Nombre del insumo', en: 'Supply name' },
  'admin.supply.category': { es: 'Categoría', en: 'Category' },
  'admin.supply.toast.added': { es: 'Artículo creado en el inventario', en: 'Item created in inventory' },
  'admin.supply.toast.moved': { es: 'Movimiento registrado con éxito', en: 'Movement registered successfully' },
  'admin.supply.recentLogs': { es: 'Historial de transacciones', en: 'Transaction history' },
  'admin.supply.analytics.byCategory': { es: 'Insumos por categoría · unidades', en: 'Supplies by category · units' },
  'admin.supply.analytics.lowStock': { es: 'Insumos en stock bajo', en: 'Supplies in low stock' },
  'admin.supply.table.empty': { es: 'El catálogo de inventario está vacío.', en: 'The inventory catalog is empty.' },
  'admin.supply.movs.empty': { es: 'No hay movimientos registrados.', en: 'No movements logged.' },
  'admin.supply.saving': { es: 'Guardando…', en: 'Saving…' },
  'admin.supply.success': { es: 'Insumo agregado con éxito', en: 'Supply added successfully' },

  // ─── Panel Admin — Navegación Fase 4 ─────────────────────────────────────
  'admin.nav.permisos': { es: 'Permisos / RBAC', en: 'Permissions / RBAC' },
  'admin.nav.perfil': { es: 'Perfil', en: 'Profile' },
  'admin.nav.personal.title': { es: 'Gestión de personal', en: 'Staff management' },
  'admin.nav.permisos.title': { es: 'Permisos / Roles (RBAC)', en: 'Permissions / Roles (RBAC)' },
  'admin.nav.perfil.title': { es: 'Perfil y cuenta', en: 'Profile & account' },
  'admin.nav.sa.section': { es: 'Super-Admin', en: 'Super-Admin' },
  'admin.topbar.personal': { es: 'Gestión de personal', en: 'Staff management' },
  'admin.topbar.permisos': { es: 'Permisos / RBAC', en: 'Permissions / RBAC' },
  'admin.topbar.perfil': { es: 'Perfil y cuenta', en: 'Profile & account' },

  // ─── Personal Panel ───────────────────────────────────────────────────────
  'admin.personal.subtitle': { es: 'Administradores y coordinadores del sistema.', en: 'System administrators and coordinators.' },
  'admin.personal.invite': { es: '+ Invitar administrador', en: '+ Invite administrator' },
  'admin.personal.search': { es: 'Buscar por nombre o correo…', en: 'Search by name or email…' },
  'admin.personal.filter.rol': { es: 'Rol: Todos', en: 'Role: All' },
  'admin.personal.filter.coordinador': { es: 'Coordinador', en: 'Coordinator' },
  'admin.personal.filter.superadmin': { es: 'Super-Admin', en: 'Super-Admin' },
  'admin.personal.col.nombre': { es: 'Nombre', en: 'Name' },
  'admin.personal.col.correo': { es: 'Correo', en: 'Email' },
  'admin.personal.col.rol': { es: 'Rol', en: 'Role' },
  'admin.personal.col.estado': { es: 'Estado', en: 'Status' },
  'admin.personal.badge.total': { es: 'administradores', en: 'administrators' },
  'admin.personal.badge.activos': { es: 'activos', en: 'active' },
  'admin.personal.empty.title': { es: 'Sin administradores aún', en: 'No administrators yet' },
  'admin.personal.empty.msg': { es: 'Invita al primer coordinador para empezar a delegar responsabilidades.', en: 'Invite the first coordinator to start delegating responsibilities.' },
  'admin.personal.menu.edit': { es: 'Editar', en: 'Edit' },
  'admin.personal.menu.resend': { es: 'Reenviar invitación', en: 'Resend invitation' },
  'admin.personal.menu.deactivate': { es: 'Desactivar', en: 'Deactivate' },
  'admin.personal.menu.reactivate': { es: 'Reactivar', en: 'Reactivate' },

  // ─── Drawer Invitar / Editar ──────────────────────────────────────────────
  'admin.drawer.invite.title': { es: 'Invitar administrador', en: 'Invite administrator' },
  'admin.drawer.edit.title': { es: 'Administrador', en: 'Administrator' },
  'admin.drawer.field.nombre': { es: 'Nombre completo', en: 'Full name' },
  'admin.drawer.field.nombre.placeholder': { es: 'Ej. Ana Morales', en: 'e.g. Ana Morales' },
  'admin.drawer.field.correo': { es: 'Correo', en: 'Email' },
  'admin.drawer.field.correo.placeholder': { es: 'ana@correo.org', en: 'ana@email.org' },
  'admin.drawer.field.rol': { es: 'Rol', en: 'Role' },
  'admin.drawer.field.zonas': { es: 'Zonas / responsabilidades', en: 'Zones / responsibilities' },
  'admin.drawer.mfa.callout': { es: 'Recibirá un correo para fijar su contraseña y activar MFA obligatorio.', en: 'They will receive an email to set their password and activate mandatory MFA.' },
  'admin.drawer.btn.cancel': { es: 'Cancelar', en: 'Cancel' },
  'admin.drawer.btn.invite': { es: 'Enviar invitación', en: 'Send invitation' },
  'admin.drawer.btn.save': { es: 'Guardar cambios', en: 'Save changes' },
  'admin.drawer.btn.deactivate': { es: 'Desactivar', en: 'Deactivate' },
  'admin.drawer.btn.reactivate': { es: 'Reactivar', en: 'Reactivate' },
  'admin.drawer.btn.resend': { es: 'Reenviar invitación', en: 'Resend invitation' },
  'admin.drawer.own.account': { es: 'Cuenta propia — no puedes cambiar tu propio rol.', en: 'Your own account — you cannot change your own role.' },
  'admin.drawer.deactivate.confirm.title': { es: '¿Desactivar administrador?', en: 'Deactivate administrator?' },
  'admin.drawer.deactivate.confirm.msg': { es: 'Este usuario perderá acceso al panel inmediatamente. Podrás reactivarlo en cualquier momento.', en: 'This user will lose panel access immediately. You can reactivate them at any time.' },

  // ─── RBAC Panel ───────────────────────────────────────────────────────────
  'admin.permisos.subtitle': { es: 'Qué puede hacer cada rol. Los cambios quedan en auditoría.', en: 'What each role can do. Changes are recorded in the audit log.' },
  'admin.permisos.history': { es: 'Historial de cambios', en: 'Change history' },
  'admin.permisos.col.action': { es: 'Acción', en: 'Action' },
  'admin.permisos.col.public': { es: 'Público', en: 'Public' },
  'admin.permisos.col.coord': { es: 'Coord.', en: 'Coord.' },
  'admin.permisos.col.sa': { es: 'S-Admin 🔒', en: 'S-Admin 🔒' },
  'admin.permisos.dirty.badge': { es: 'Cambios sin guardar', en: 'Unsaved changes' },
  'admin.permisos.dirty.hint': { es: 'Se pedirá confirmación y quedará registrado en auditoría.', en: 'Confirmation will be requested and changes will be recorded in the audit log.' },
  'admin.permisos.dirty.discard': { es: 'Descartar', en: 'Discard' },
  'admin.permisos.dirty.save': { es: 'Guardar cambios', en: 'Save changes' },
  'admin.permisos.locked.toast': { es: 'Super-Admin no puede perder acceso total', en: 'Super-Admin cannot lose total access' },
  'admin.permisos.confirm.title': { es: 'Confirmar cambios de permisos', en: 'Confirm permission changes' },
  'admin.permisos.confirm.msg': { es: 'Estás por modificar qué puede hacer cada rol. El cambio afecta a todos los usuarios de ese rol y quedará en el registro de auditoría.', en: 'You are about to modify what each role can do. This affects all users with that role and will be recorded in the audit log.' },
  'admin.permisos.confirm.btn': { es: 'Confirmar y guardar', en: 'Confirm & save' },
  'admin.permisos.action.register_donate': { es: 'Registrarse / donar', en: 'Register / donate' },
  'admin.permisos.action.view_volunteers': { es: 'Ver voluntarios', en: 'View volunteers' },
  'admin.permisos.action.approve_volunteers': { es: 'Aprobar voluntarios', en: 'Approve volunteers' },
  'admin.permisos.action.reveal_sensitive_data': { es: 'Revelar datos sensibles', en: 'Reveal sensitive data' },
  'admin.permisos.action.export_data': { es: 'Exportar Excel / PDF', en: 'Export Excel / PDF' },
  'admin.permisos.action.manage_inventory': { es: 'Gestionar inventario', en: 'Manage inventory' },
  'admin.permisos.action.manage_admins_rbac': { es: 'Gestionar admins / RBAC', en: 'Manage admins / RBAC' },
  'admin.permisos.audit.title': { es: 'Historial de cambios de permisos', en: 'Permission change history' },
  'admin.permisos.audit.empty': { es: 'Sin cambios registrados aún.', en: 'No changes recorded yet.' },
  'admin.permisos.audit.col.who': { es: 'Realizado por', en: 'Changed by' },
  'admin.permisos.audit.col.when': { es: 'Fecha', en: 'Date' },
  'admin.permisos.audit.col.changes': { es: 'Cambios', en: 'Changes' },

  // ─── Perfil Panel ─────────────────────────────────────────────────────────
  'admin.perfil.change.photo': { es: 'Cambiar foto', en: 'Change photo' },
  'admin.perfil.section.account': { es: 'Datos de la cuenta', en: 'Account details' },
  'admin.perfil.field.nombre': { es: 'Nombre', en: 'Name' },
  'admin.perfil.field.correo': { es: 'Correo', en: 'Email' },
  'admin.perfil.section.password': { es: 'Contraseña', en: 'Password' },
  'admin.perfil.password.last': { es: 'Última actualización hace', en: 'Last updated' },
  'admin.perfil.password.change': { es: 'Cambiar', en: 'Change' },
  'admin.perfil.password.current': { es: 'Contraseña actual', en: 'Current password' },
  'admin.perfil.password.new': { es: 'Nueva contraseña', en: 'New password' },
  'admin.perfil.password.confirm': { es: 'Confirmar nueva contraseña', en: 'Confirm new password' },
  'admin.perfil.password.mismatch': { es: 'Las contraseñas no coinciden', en: 'Passwords do not match' },
  'admin.perfil.section.mfa': { es: 'Autenticación (MFA)', en: 'Authentication (MFA)' },
  'admin.perfil.mfa.active': { es: 'Activa', en: 'Active' },
  'admin.perfil.mfa.inactive': { es: 'Inactiva', en: 'Inactive' },
  'admin.perfil.mfa.sub': { es: 'App autenticadora · reconfigurar o ver códigos de respaldo', en: 'Authenticator app · reconfigure or view backup codes' },
  'admin.perfil.mfa.manage': { es: 'Gestionar', en: 'Manage' },
  'admin.perfil.mfa.future': { es: 'MFA disponible próximamente — mejora de seguridad planificada', en: 'MFA coming soon — planned security enhancement' },
  'admin.perfil.section.lang': { es: 'Idioma', en: 'Language' },
  'admin.perfil.section.demo': { es: 'Vista previa de rol (demo)', en: 'Role preview (demo)' },
  'admin.perfil.demo.sub': { es: 'Simula lo que ve un Coordinador — las áreas restringidas desaparecen.', en: 'Simulate what a Coordinator sees — restricted areas disappear.' },
  'admin.perfil.save': { es: 'Guardar cambios', en: 'Save changes' },
  'admin.perfil.saved': { es: '✓ Cambios guardados', en: '✓ Changes saved' },

  // ─── Estados transversales: 403 / Vacío / Error ───────────────────────────
  'admin.403.title': { es: 'Acceso restringido', en: 'Access restricted' },
  'admin.403.msg': { es: 'Esta área es solo para Super-Admin. Si crees que es un error, contacta a un administrador.', en: 'This area is for Super-Admin only. If you think this is an error, contact an administrator.' },
  'admin.403.btn': { es: 'Volver al Dashboard', en: 'Back to Dashboard' },
  'admin.error.title': { es: 'No se pudo cargar', en: 'Could not load' },
  'admin.error.msg': { es: 'Revisa tu conexión e inténtalo de nuevo. Tus cambios no se perdieron.', en: 'Check your connection and try again. Your changes were not lost.' },
  'admin.error.retry': { es: 'Reintentar', en: 'Retry' },
  'admin.error.back': { es: 'Volver', en: 'Go back' },
};

export default translations;
