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
