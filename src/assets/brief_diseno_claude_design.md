# Brief de Diseño — Hope en Venezuela (Web de Gestión de Voluntarios y Ayuda)
### Documento de contexto para Claude Design

> **Para qué sirve este documento.** Es el contexto completo para diseñar en Claude Design todas las pantallas del sistema: landing pública, registro de voluntarios, donaciones y el panel administrativo (gráficos, gestión de personal, permisos, aprobación de voluntarios, mapeo y asignación por zona, inventario). Define **qué vista existe, quién la usa, qué muestra, qué acciones tiene, en qué orden diseñarla y con qué lenguaje visual.** No es el análisis de infraestructura (ese es un documento aparte); aquí solo importa la capa visual y de experiencia.
>
> **Nota crítica para evitar confusión:** existen dos rutas de *infraestructura* (A: Supabase gestionado / B: auto-hospedado). **El diseño es idéntico en ambas** — la elección de backend no cambia ninguna pantalla. Este brief es agnóstico a esa decisión.

---

## 1. Contexto de la campaña

- **Campaña:** "Hope en Venezuela — Campaña de Esperanza", liderada por la organización **Ready Set Go** (`readysetgo_ve`).
- **Motivo:** respuesta al **terremoto del 24 de junio (2026)** que afectó varias zonas de La Guaira, Miranda y Aragua simultáneamente.
- **Idiomas:** el sitio es **bilingüe español/inglés**. Español para voluntarios locales; inglés orientado a la diáspora y donantes internacionales (coherente con la donación por Zelle en USD).
- **Tres audiencias con necesidades distintas:**
  1. **Voluntarios / público** — quieren inspirarse, confiar y sumarse (registro) o aportar (donación). Emocional, claro, móvil.
  2. **Donantes** (locales y diáspora) — quieren ver que la ayuda es real y donar sin fricción.
  3. **Coordinadores / administradores** — quieren una herramienta rápida y densa para gestionar personas, insumos y despliegue.

**Tono emocional:** esperanza, dignidad y transparencia. Mostrar el trabajo real y a las personas con respeto — **nunca miseria explotada ni imágenes sensacionalistas del desastre**. El mensaje es "juntos reconstruimos", no la tragedia.

---

## 2. Dos registros visuales (principio rector)

El sistema tiene **dos personalidades de diseño** que no deben mezclarse:

- **Zona pública (landing, registro, donaciones):** espaciosa, cálida, guiada por imágenes reales, con jerarquía clara y llamados a la acción evidentes. Prioriza inspiración y confianza.
- **Zona administrativa (panel):** funcional, densa, escaneable, utilitaria. Prioriza velocidad de lectura y de acción sobre lo estético. Menos aire, más datos por pantalla, pero igual de limpia y ordenada.

Diseñarlas con el mismo criterio sería un error: una landing tipo dashboard no inspira, y un panel tipo landing hace perder tiempo al coordinador.

---

## 3. Principios de UI/UX (obligatorios)

- **Mobile-first y responsive.** La mayoría de voluntarios entran desde el teléfono. Todo debe funcionar de 320 px hasta escritorio. El panel admin se usa más en tablet/PC en puestos de mando, pero debe ser usable en móvil.
- **Accesibilidad:** contraste AA como mínimo, área táctil ≥ 44 px, foco visible, etiquetas en formularios, no depender solo del color para transmitir estado.
- **Rendimiento en redes inestables:** imágenes optimizadas, carga progresiva, estados de carga (skeletons) y de error claros. PWA instalable con registro offline que se sincroniza al volver la señal.
- **Confianza y privacidad:** al manejar datos civiles (cédulas, teléfonos), en el panel los datos sensibles van **enmascarados por defecto** (ej. `0412-***-5532`) y se revelan solo con acción explícita.
- **Consistencia:** un solo sistema de componentes y tokens en toda la app.
- **Bilingüe sin recargar:** cambio de idioma global (ES/EN) siempre accesible.

---

## 4. Sistema visual (design tokens)

**Paleta (colores confirmados del código de la landing actual):**

| Rol | Hex | Uso |
|---|---|---|
| Azul marino primario | `#003366` | Títulos, botones primarios, barra de navegación, marca |
| Azul casi negro | `#111827` / `#1f2937` | Texto de alto énfasis |
| Vino/marrón (eyebrow) | `#5C1F3A` | Etiquetas de sección ("DONAR FONDOS", "CENTROS DE ACOPIO") |
| Grises de texto | `#374151` · `#4B5563` · `#6B7280` | Cuerpo y texto secundario |
| Gris claro superficie | `#F3F4F6` | Fondos de tarjetas y bloques |
| Verde | `#4A5D3A` | Acento secundario (usado en la tarjeta Zelle) |
| Blanco | `#FFFFFF` | Fondos base |

**Acentos sugeridos (para confirmar en diseño):** un **ámbar/dorado** (~`#C79A3A`) como acento cálido para CTAs secundarios y destaques —la landing ya usa botones con contorno dorado—, y toques puntuales de la **bandera venezolana** (amarillo `#FCD116`, azul `#00247D`, rojo `#CF142B`) usados con moderación en la landing (nunca en el panel). Marcarlos como acento, no como base.

**Estados semánticos (panel):** éxito/aprobado verde, pendiente ámbar, crítico/rechazado rojo, informativo azul. Deben distinguirse también por ícono y texto, no solo color.

**Tipografía:** recomendado **Inter** (open source) para toda la UI por su legibilidad en pantalla; títulos en azul marino con peso bold. (La landing actual usa Arimo/Helvetica; Inter moderniza sin cambiar el carácter.) Escala tipográfica clara: display para hero, H1–H3 para secciones, cuerpo 16px mínimo.

**Iconografía:** set lineal consistente (ej. Lucide, open source). Evitar mezclar estilos de íconos.

**Imágenes:** fotos reales del trabajo (voluntarios organizando insumos, brigadas, entregas), dignas y bien iluminadas. Espacio para logo del corazón/mapa de Hope Venezuela.

**Componentes base (librería a diseñar una vez y reutilizar):** botón (primario/secundario/ghost/destructivo), tarjeta, tarjeta de KPI/estadística, tabla con filtros, gráficos (barras / dona / barra de progreso), mapa con marcadores, campos de formulario (texto, numérico, select, grupo de checkboxes, grilla semanal de turnos), pastillas de estado (badges), modal, panel lateral (drawer), toasts/notificaciones, navegación (superior + lateral), tabs, estados vacíos, avatar, selector de idioma.

---

## 5. Mapa de vistas y acceso por rol

Roles: **Voluntario/Público** (sin login para registro/donación), **Coordinador**, **Super-Admin**.

| # | Vista | Acceso | Registro visual |
|---|---|---|---|
| 1 | Landing page interactiva | Público | Público |
| 2 | Formulario de registro de voluntario | Público | Público |
| 3 | Confirmación / gracias | Público | Público |
| 4 | Sección/página de donaciones | Público | Público |
| 5 | Login | Público (admins) | Público sobrio |
| 6 | Verificación MFA / 2FA | Admins | Público sobrio |
| 7 | Dashboard gráfico (KPIs) | Coordinador, Super-Admin | Panel |
| 8 | Gestión de voluntarios (lista + detalle) | Coordinador, Super-Admin | Panel |
| 9 | Aprobación de voluntarios (cola de pendientes) | Coordinador, Super-Admin | Panel |
| 10 | Mapeo de voluntarios + asignación por zona | Coordinador, Super-Admin | Panel |
| 11 | Inventario de insumos (lista, alta, stock, alertas) | Coordinador, Super-Admin | Panel |
| 12 | Analítica de insumos (gráficos por % y unidad) | Coordinador, Super-Admin | Panel |
| 13 | Gestión de personal / administradores | **Super-Admin** | Panel restringido |
| 14 | Gestión de permisos / roles (RBAC) | **Super-Admin** | Panel restringido |
| 15 | Exportación Excel / PDF | Coordinador, Super-Admin | Panel (acción) |
| 16 | Perfil / cuenta del usuario logueado | Cualquier admin | Panel |
| 17 | Estados 403 / vacío / error | Todos | Ambos |

---

## 6. Fases de diseño (por criticidad)

Diseñar en este orden; cada fase es entregable por sí sola.

- **Fase 1 — Núcleo público + captación (lo primero que ve el mundo):** Landing (1), Formulario de registro (2), Confirmación (3), Donaciones (4). Es lo que convierte visitantes en voluntarios y donantes; reemplaza la página actual.
- **Fase 2 — Núcleo operativo admin:** Login/MFA (5–6), Dashboard gráfico (7), Gestión de voluntarios (8), Aprobación de voluntarios (9). Es lo que permite operar con los registros que lleguen.
- **Fase 3 — Despliegue y suministros:** Mapeo + asignación por zona (10), Inventario (11) y Analítica de insumos (12), Exportación (15).
- **Fase 4 — Gobernanza:** Gestión de personal (13), Permisos/RBAC (14), Perfil (16). Menos frecuente, pero necesaria.
- **Transversal:** sistema visual (§4), componentes, estados 403/vacío/error (17), responsive y bilingüe — se definen desde la Fase 1 y se reutilizan.

---

## 7. Especificación por vista

Para cada vista: **propósito · secciones/componentes · datos · acciones · estados · notas responsive/acceso.**

### 7.1 Landing page interactiva (Público) — *Fase 1, la más crítica*
**Propósito:** inspirar, generar confianza mostrando el trabajo real, y convertir en dos acciones: **ser voluntario** y **donar**.
**Secciones (scroll narrativo):**
1. **Hero:** título de campaña, subtítulo "Unidos para reconstruir la esperanza", imagen potente del trabajo, y dos CTAs primarios: **"Quiero ser voluntario"** y **"Donar"**. Botones secundarios: WhatsApp e Instagram (canales). Selector de idioma visible.
2. **Quiénes somos / Misión:** texto breve + imagen. Transmite organización y transparencia.
3. **Plan de acción / Fases:** Respuesta Inmediata → Ayuda Humanitaria → Acompañamiento Integral → Recuperación y Reconstrucción (4 tarjetas con imagen).
4. **Impacto / trabajo realizado:** la sección que "inspira" — cifras o galería del trabajo hecho (ej. toneladas entregadas, voluntarios activos, campamentos atendidos). Puede alimentarse de datos reales del sistema. Es clave para motivar.
5. **Principios de la campaña:** Liderazgo, Priorización, Alcance Comunitario, Servicio, Evaluación Continua (5 tarjetas con ícono).
6. **Cómo puedes ayudar:** 4 accesos — Orar, Donar, Ser Voluntario, Compartir.
7. **Guía de oración (7 Días):** bloque con botón "Ver guía" (video) y "Descargar PDF".
8. **Donar insumos — centros de acopio:** tarjetas por zona (Vargas, Miranda ×2, Aragua) con dirección, horario, contacto y "Ver ubicación".
9. **Donar fondos:** dos tarjetas (cuenta Banesco / Zelle) con botón "Copiar". Concepto destacado.
10. **Casa Misionera (centro de recepción):** descripción + ubicación.
11. **Únete al equipo:** las 4 categorías de voluntariado con sus roles, y CTA al formulario.
12. **Mantente informado:** canales WhatsApp e Instagram (avisos diarios).
13. **Footer:** logo, lema "Juntos servimos, juntos reconstruimos", redes, nota de transparencia.

**Acciones primarias:** ir al formulario; donar (copiar datos / ver acopio). **Estados:** las cifras de impacto necesitan estado de carga y un fallback si no hay datos.
**Responsive:** hero legible en móvil, tarjetas apiladas, CTAs siempre alcanzables (considerar barra de acción fija en móvil con "Voluntario / Donar").

### 7.2 Formulario de registro de voluntario (Público) — *Fase 1, crítica*
**Propósito:** capturar datos limpios y estructurados (el punto donde se corrige el desorden de datos actual).
**Diseño:** formulario **por pasos** (multi-step) con lógica condicional, no un formulario eterno.
- **Paso 1 — Datos personales:** Nombre y apellidos; **Cédula** (numérica, única); **Edad** (selector numérico, no texto libre); **Teléfono** (con máscara/normalización a formato venezolano); Ubicación (Estado / Municipio); Profesión.
- **Paso 2 — Áreas de apoyo (checkboxes, selección múltiple atómica):** Salud, Logística/Acopio, Transporte, Recreación/Familias, Soporte a rescatistas. Cada casilla despliega su subformulario:
  - Salud → especialidad (Medicina / Enfermería-Paramédico / Psicología) + grado académico.
  - Transporte → vehículo (Moto / Carro / Camioneta-PickUp / Camión).
  - Logística → trabajo pesado vs. organización interna.
  - Certificaciones (para todos): Primeros Auxilios / Rescate urbano.
- **Paso 3 — Disponibilidad:** rango de movilización (local / foráneo a campamentos); **grilla semanal 7×4** táctil (Lun–Dom × Mañana/Tarde/Noche/24h) — sin texto libre.
- **Paso 4 — Revisión y envío.**

**Validaciones visibles (derivadas de problemas reales de los datos):** cédula única y numérica; edad numérica con aviso si es menor de edad (para tareas de riesgo); teléfono normalizado; áreas como casillas atómicas (no texto con comas). Barra de progreso entre pasos. Guardado offline con reintento.
**Estados:** error de validación inline por campo, envío en progreso, éxito → vista 7.3.

### 7.3 Confirmación / gracias (Público) — *Fase 1*
Mensaje cálido de agradecimiento, qué sigue (serán contactados por WhatsApp), y accesos a canales oficiales y a compartir la campaña.

### 7.4 Donaciones (Público) — *Fase 1*
Puede vivir dentro de la landing o como página propia enlazada desde el CTA "Donar". Contiene acopio (insumos) y fondos (Banesco / Zelle) con **botón Copiar** en cada dato y el concepto obligatorio destacado. Diferenciar claramente método **nacional (Bs)** vs **Zelle (USD)**.

### 7.5 Login (Admins) — *Fase 2*
Pantalla sobria alineada a la marca (no la landing emocional). Email + contraseña, recuperar contraseña. Mensajes de error genéricos por seguridad.

### 7.6 Verificación MFA / 2FA (Admins) — *Fase 2*
Ingreso de código (SMS o app autenticadora), especialmente obligatorio para Super-Admin.

### 7.7 Dashboard gráfico (Coordinador/Super-Admin) — *Fase 2, crítica*
**Propósito:** responder de un vistazo "¿dónde faltan personas e insumos ahora?".
**Componentes:**
- **Fila de KPIs:** voluntarios totales, activos, **pendientes por aprobar** (con acceso directo a la cola), insumos contabilizados, alertas críticas.
- **Gráfico de voluntarios por área/habilidad** (barras).
- **Voluntarios por estado** (activos / pendientes / aprobados) — dona o barras.
- **Cobertura por zona** (cuántos desplegados por zona afectada).
- **Insumos por categoría** y alertas de stock bajo / vencimiento próximo.
**Estados:** carga (skeletons), vacío ("aún no hay datos"), error. Filtros por fecha/zona.
**Responsive:** KPIs apilados en móvil, gráficos con scroll horizontal si hace falta.

### 7.8 Gestión de voluntarios — lista + detalle (Coordinador/Super-Admin) — *Fase 2, crítica*
**Lista:** tabla con búsqueda y **filtros combinables** (área, certificación, disponibilidad día/turno, zona, estado, vehículo). Columnas clave con datos sensibles **enmascarados**. Ordenar por prioridad (ej. certificados primero). Acción de **exportar** (ver 7.15) y selección múltiple.
**Detalle (drawer o página):** ficha completa del voluntario, con datos sensibles revelables por acción; áreas, certificaciones, disponibilidad (grilla), zona asignada, historial de estado. Acciones: aprobar/rechazar, asignar zona/área, editar estado.
**Estados:** lista vacía, sin resultados de filtro, carga.

### 7.9 Aprobación / autorización de voluntarios (Coordinador/Super-Admin) — *Fase 2, crítica*
**Propósito:** cola de **pendientes por aprobar** con flujo rápido de revisión.
**Diseño:** tarjetas o filas con lo esencial (nombre, edad, área, certificación, disponibilidad, zona deseada) y acciones **Aprobar / Rechazar** en un toque, con confirmación. Debe destacar señales importantes (menor de edad, certificación de rescate). Contador de pendientes siempre visible. Acción por lote (aprobar varios). **Estados:** cola vacía ("todo al día").

### 7.10 Mapeo de voluntarios + asignación por zona (Coordinador/Super-Admin) — *Fase 3*
**Propósito:** ver **dónde está desplegado cada voluntario** y asignarlos a zonas afectadas.
**Diseño:** mapa (Leaflet/OpenStreetMap) con **marcadores por zona** y conteo de voluntarios por zona; panel lateral para asignar un voluntario a una zona. Vista alternativa en lista/tabla por zona para quien prefiera. **No** incluye rutas optimizadas ni tracking en vivo (fuera de alcance v1). **Estados:** zona sin voluntarios, carga del mapa, sin geolocalización disponible.

### 7.11 Inventario de insumos (Coordinador/Super-Admin) — *Fase 3*
**Propósito:** registrar entradas, hacer inventario y ver existencias en tiempo real.
**Componentes:** lista de ítems (nombre, categoría, unidad, cantidad, lote/vencimiento); **alta rápida** de ítem/entrada; edición de stock; **alertas** en rojo de vencimiento próximo o stock bajo; registro de movimientos (entrada/salida) para auditoría. **Estados:** inventario vacío, alerta crítica destacada, carga.

### 7.12 Analítica de insumos (Coordinador/Super-Admin) — *Fase 3*
Gráficos de insumos **por porcentaje y por unidad** por categoría, rotación y alertas. Complementa el inventario con la vista "cuánto hay de cada cosa".

### 7.13 Gestión de personal / administradores (**Super-Admin**) — *Fase 4, área restringida*
**Propósito:** crear/gestionar administradores y coordinadores y sus responsabilidades.
**Diseño:** lista de usuarios administradores con rol y estado; crear/invitar admin; editar rol y responsabilidades; desactivar. **Acceso restringido a Super-Admin** — debe ser visualmente evidente que es un área sensible (indicador de zona restringida, confirmaciones en acciones destructivas). **Estados:** confirmaciones y advertencias claras.

### 7.14 Gestión de permisos / roles — RBAC (**Super-Admin**) — *Fase 4, área restringida*
**Propósito:** definir qué puede hacer cada rol.
**Diseño:** **matriz de permisos** (roles × acciones) con toggles, legible y difícil de romper por error. Cambios con confirmación y registro. Ver §8. **Acceso restringido a Super-Admin.**

### 7.15 Exportación Excel / PDF (Coordinador/Super-Admin) — *Fase 3*
No es pantalla completa: es una acción desde la lista de voluntarios (o filtros aplicados). Diálogo para elegir **formato (Excel / PDF imprimible)** y **columnas a incluir** (con advertencia sobre datos sensibles). El PDF debe verse bien impreso (encabezado de campaña, fecha, filtros aplicados).

### 7.16 Perfil / cuenta (cualquier admin) — *Fase 4*
Datos de la cuenta, cambio de contraseña, gestión de MFA, idioma.

### 7.17 Estados 403 / vacío / error (todos) — *Transversal*
- **403 / restringido:** mensaje claro cuando un coordinador intenta entrar a un área solo de Super-Admin.
- **Vacío:** ilustración + texto guía + acción sugerida en cada lista.
- **Error / offline:** aviso no alarmante con opción de reintentar; en registro público, aviso de "guardado, se enviará al recuperar conexión".

---

## 8. Matriz de permisos por rol (RBAC) — referencia para diseño

| Acción | Voluntario/Público | Coordinador | Super-Admin |
|---|---|---|---|
| Registrarse / donar (público) | ✅ | ✅ | ✅ |
| Ver dashboard y voluntarios | ❌ | ✅ | ✅ |
| Ver datos sensibles completos | ❌ | Revelar con acción (enmascarado por defecto) | ✅ |
| Aprobar / rechazar voluntarios | ❌ | ✅ | ✅ |
| Asignar zona / área | ❌ | ✅ | ✅ |
| Gestionar inventario | ❌ | ✅ | ✅ |
| Exportar Excel / PDF | ❌ | ✅ (registrado) | ✅ |
| Crear / gestionar administradores | ❌ | ❌ | ✅ |
| Configurar permisos / roles (RBAC) | ❌ | ❌ | ✅ |

El diseño debe reflejar estas diferencias: el coordinador **no ve** las entradas de menú de las áreas restringidas (13, 14); no basta con bloquear al entrar.

---

## 9. Microcopy y validaciones de formulario (resumen accionable)

El formulario público es donde se evita el desorden de datos detectado en los registros reales. Reglas a reflejar en el diseño:
- **Cédula:** numérica, única; feedback si ya existe.
- **Edad:** selector numérico (evitar "23 años" como texto); aviso si es menor de edad.
- **Teléfono:** máscara a formato venezolano (`+58`/`0412…`); evitar formatos libres.
- **Áreas y turnos:** casillas y grilla (nunca texto separado por comas).
- **Certificaciones:** casillas propias, separadas del área de logística.
- Mensajes de error **inline, específicos y amables**; nada de errores genéricos al final.

---

## 10. Qué NO incluir en v1 (evita sobre-diseñar)

Para no dispersar el diseño, quedan **fuera del alcance** de estas vistas: rutas optimizadas / PostGIS, tracking de convoyes en vivo, check-in por geolocalización, pasarela SMS automatizada y el tablero estratégico avanzado tipo "mando nacional". Si aparecen ideas de pantallas para esto, no diseñarlas ahora.

---

## 11. Checklist de cobertura (para verificar antes de diseñar)

- [ ] Landing con las 13 secciones y doble CTA (voluntario / donar)
- [ ] Formulario multi-step con lógica condicional y validaciones
- [ ] Confirmación / gracias
- [ ] Donaciones (acopio + fondos, botón copiar, Bs vs USD)
- [ ] Login + MFA
- [ ] Dashboard con KPIs y gráficos (áreas, estado, zona, insumos)
- [ ] Lista + detalle de voluntarios con enmascaramiento y filtros
- [ ] Cola de aprobación de voluntarios
- [ ] Mapa por zona + asignación
- [ ] Inventario + analítica de insumos + alertas
- [ ] Gestión de personal (Super-Admin)
- [ ] Permisos / RBAC (Super-Admin)
- [ ] Exportación Excel / PDF
- [ ] Perfil / cuenta
- [ ] Estados 403 / vacío / error
- [ ] Sistema visual, componentes, responsive y bilingüe transversales
