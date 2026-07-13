# Hope en Venezuela — Campaña de Esperanza

Este es el archivo de contexto principal del proyecto. Contiene las reglas del proyecto, los datos reales de la campaña y la arquitectura para asegurar la continuidad del desarrollo.

---

## 📋 Reglas del Proyecto

1. **Internacionalización (i18n)**: Estructura ES/EN bilingüe completa desde el inicio. El cambio de idioma debe ser reactivo y propagarse inmediatamente a toda la UI.
2. **Arquitectura React**:
   - **TanStack Query (React Query)** para operaciones de lectura/mutación con el servidor.
   - **Zustand** para el manejo de estado global efímero de UI y cliente (ej. idioma, toast, pasos del formulario).
   - **NO usar useEffect** para derivar estados locales ni para sincronizar stores; preferir derivación síncrona en el render o en stores.
3. **Estilos**: TailwindCSS v4 en base a tokens CSS definidos en `@theme`.

---

## 🏦 Datos Bancarios Reales (Confirmados)

Para transferencias de donaciones:

### Nacional (Banesco)
*   **Titular**: Eliú González
*   **Banco**: Banesco
*   **Cuenta**: `0134-0474-70-4741024984`
*   **Cédula**: `11.819.533`
*   **Teléfono**: `0412-0192578`
*   **Concepto obligatorio**: `Donación Terremoto Venezuela` / `HOPE-VE`

### Zelle (Exterior)
*   **Titular**: Maria Gil
*   **Número**: `7868057125`
*   **Concepto**: `Venezuela Earthquake Donation`
*   **Nota**: Añadir nombre en la nota para el recibo.

---

## 📍 Centro de Recepción Principal
*   **Lugar**: Casa Misionera
*   **Dirección**: Calle Real de Pariata, a 100 m del hospital de Pariata, frente al CC de Pariata · Vargas, La Guaira.
*   **Contacto**: Arturo S. (0412-7005231)

---

## 🎨 Referencias Visuales — Claude Design (FUENTE DE VERDAD)

**Claude Design** es la fuente de verdad visual del proyecto. Todas las vistas DEBEN implementarse siguiendo pixel-por-pixel los diseños exportados.

### Ubicación de los archivos de referencia

```
context/hope venezuela/
├── Landing.dc.html       → Diseño de la landing page pública
├── Registro.dc.html      → Diseño del formulario multi-step de voluntariado
├── Donar.dc.html         → Diseño de la página de donaciones
├── Admin.dc.html         → Diseño del panel de coordinación (login + dashboard + voluntarios + aprobación)
├── Fase1 Wireframes.dc.html → Wireframes de la fase 1
├── Fase2 Wireframes.dc.html → Wireframes de la fase 2
├── assets/               → Recursos visuales (iconos, logos)
└── uploads/              → Imágenes subidas al diseño
```

### Reglas de implementación visual

1. **Antes de implementar cualquier vista**, SIEMPRE abrir y analizar el archivo `.dc.html` correspondiente en `context/hope venezuela/`.
2. **Si hay discrepancia** entre el código implementado y el diseño de referencia, **el diseño gana**.
3. Extraer del `.dc.html`: colores exactos, tipografía (font-weight, font-size), espaciado (padding, gap, margins), border-radius, sombras, layout (flex, grid), y estados interactivos.
4. Los archivos `.dc.html` son interactivos — contienen lógica de navegación, transiciones y estados que deben replicarse en React.
5. **No inventar diseños**. Si un componente no tiene referencia visual, consultar antes de implementar.

