// src/i18n/translations.js
// Diccionario completo ES/EN extraído fielmente de los diseños de Claude Design.
// Estructura: { key: { es: '...', en: '...' } }

const translations = {
  // ─── Navegación ──────────────────────────────────────────────────────────
  'nav.about': { es: 'Nosotros', en: 'About' },
  'nav.plan': { es: 'Plan de acción', en: 'Action plan' },
  'nav.impact': { es: 'Impacto', en: 'Impact' },
  'nav.help': { es: 'Cómo ayudar', en: 'Get involved' },

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
};

export default translations;
