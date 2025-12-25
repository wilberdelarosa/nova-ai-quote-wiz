# Plan crítico de mejoras (IA + UX + robustez de cotización)

Fecha: 2025-12-24

Este documento es un plan de acción para convertir el cotizador en una herramienta **confiable para cotizaciones reales**, con IA que ayude a detectar costos omitidos y a mejorar alcance, términos y UX.

---

## 1) Diagnóstico rápido (estado actual)

**Flujo principal**
- La app permite: definir cliente/tipo de proyecto, seleccionar módulos, crear/editar/eliminar módulos, ver resumen, exportar/importar JSON y generar PDF.
- Hay **dos experiencias de IA**:
  - Panel “Asistente IA” (consulta a Groq desde el frontend).
  - Asistente flotante “Sistema Experto IA” (consulta a una función edge de Supabase `expert-system` que usa base de conocimiento + módulos + investigación de precios).

**Fortaleza real del proyecto**
- El “Sistema Experto” (Supabase edge function) es el camino correcto: centraliza reglas, contexto, conocimiento y reduce improvisación.

---

## 2) Problemas críticos (P0) — corregir primero o todo lo demás es frágil

### P0.1 Seguridad: llave de IA expuesta en el frontend
- En [src/services/aiService.ts](src/services/aiService.ts) hay una llave (`GROQ_API_KEY`) hardcodeada.
- Impacto: cualquiera puede robarla, abusar de tu cuenta, quemar créditos o exponerte a costos.
- Acción: mover TODA llamada a modelos a servidor/edge (Supabase Functions) y leer la llave desde variables de entorno/secret manager. El frontend no debe tener llaves.

### P0.2 Riesgo de XSS por HTML generado por IA
- Se renderiza HTML con `dangerouslySetInnerHTML`.
- En el panel fijo se sanitiza (DOMPurify), pero en el asistente flotante **no se sanitiza** antes de renderizar.
- Impacto: un output malicioso/inesperado podría inyectar HTML peligroso.
- Acción: sanitizar SIEMPRE el HTML en el cliente antes de renderizar (también en asistente flotante). Opcionalmente: sanitizar del lado servidor y/o usar un formato de respuesta estructurado (JSON) + render seguro.

### P0.3 Parsing frágil de “módulos sugeridos”
- Actualmente se detecta un módulo sugerido con regex buscando un bloque HTML específico en [src/pages/QuotationApp.tsx](src/pages/QuotationApp.tsx).
- Problema: es muy fácil que el modelo cambie el formato y el parsing se rompa.
- Acción: estandarizar un formato único para sugerencias (ideal: JSON con campos `name/price/category/description`), o al menos un único patrón HTML.

### P0.4 Bug de UX: “Módulo sugerido” no precarga bien
- En [src/components/ModuleCreator.tsx](src/components/ModuleCreator.tsx) el estado inicial depende de `suggestedModule`, pero si `suggestedModule` cambia después, los inputs pueden quedar desincronizados.
- Acción: sincronizar con `useEffect` cuando cambie `suggestedModule`.

---

## 3) Rol de la IA (qué debe hacer y qué NO)

### Qué debe hacer (valor real para cotización)
La IA aquí no es “chat bonito”; debe actuar como **auditor de alcance + riesgos + costos omitidos**.

Su misión: convertir una selección de módulos en una cotización final **defendible**, evitando el clásico: “se me olvidó X”.

### Qué NO debe hacer
- No debe inventar comisiones exactas ni precios “reales” si no están en tu base de datos o si no tienes fuentes verificadas.
- No debe tomar decisiones sin confirmación (ej.: agregar módulos automáticamente sin consentimiento).

### Cómo debe ayudar “certera”
- Hacer preguntas faltantes (briefing guiado) y marcar “riesgo” si faltan respuestas.
- Detectar costos invisibles por patrón (ej.: pasarela de pago → PCI/seguridad/antifraude; admin panel → roles/auditoría; hosting → renovaciones).
- Generar escenarios comparables: **MVP / Standard / Premium**.
- Explicar alcance: incluido/excluido; supuestos; dependencias.

---

## 4) Funciones de IA recomendadas (de mayor impacto a menor)

### F1) Auditor de costos olvidados (MVP de IA)
**Objetivo:** listar costos que típicamente faltan y pedir confirmación.

Checklist por categoría (ejemplos):
- Legales/finanzas: ITBIS, facturación, retenciones, políticas, términos de uso, privacidad.
- Operación: soporte post-lanzamiento, mantenimiento mensual, monitoreo, backups, renovación dominio.
- Contenido: copywriting, fotos, traducciones, carga de productos, SEO técnico vs contenido.
- Seguridad: hardening, roles, logs, rate limits, protección anti-bots.
- Calidad: QA, UAT con cliente, staging, analítica/telemetría.
- Integraciones: WhatsApp Business API, SMS, email transaccional (costos por envío), pasarela (fees).

Salida deseada:
- Lista priorizada de “faltantes” con severidad (Alta/Media/Baja).
- Campo “impacto” (costo/tiempo/riesgo) y “acción” (agregar módulo, agregar nota, agregar condición).

### F2) Generador de desglose: horas/fases/margen
**Objetivo:** convertir módulos a fases + horas estimadas + buffer.
- Añadir `estimatedHours` por módulo y permitir que IA sugiera horas con justificación.
- Aplicar contingencia: 10–30% según riesgo.
- Calcular: costo directo, margen, total.

### F3) Escenarios (MVP/Standard/Premium)
**Objetivo:** que el cliente entienda valor y tú protejas alcance.
- Mismos módulos, distinto paquete de servicios y SLA.

### F4) “Copiloto de UX”: crítica + propuesta de mejoras
**Objetivo:** detectar problemas de UX y proponer cambios concretos.
- Debe evaluar: claridad, jerarquía, fricción, copy, accesibilidad, estados vacíos.

### F5) Generador de contrato/condiciones del PDF
**Objetivo:** PDF más defensible.
- Secciones: alcance, supuestos, exclusiones, cambios, pagos, cronograma, aceptación.

---

## 5) Auditoría por módulos/componentes (crítica sin conformismo)

### Página principal
- [src/pages/QuotationApp.tsx](src/pages/QuotationApp.tsx)
  - Bien: `useMemo` para totales y selección; persistencia en localStorage.
  - Fallas:
    - Parsing de sugerencias por regex (frágil).
    - Importación de JSON: si `data.modules` viene vacío, `Math.max(...data.modules.map(...))` puede romper.
    - Hay dos IA con UI/flows distintos → confunde y duplica funciones.

### IA (panel fijo)
- [src/components/AIAssistant.tsx](src/components/AIAssistant.tsx)
  - Bien: sanitiza HTML.
  - Fallas:
    - Incentiva respuestas “bonitas” con Tailwind en HTML, pero eso no es estructura confiable.
    - Demasiadas acciones rápidas sin un flujo guiado (puede generar ruido en vez de precisión).

### IA (asistente flotante)
- [src/components/FloatingAIAssistant.tsx](src/components/FloatingAIAssistant.tsx)
  - Bien:
    - Tiene “acciones” claras (analyze/suggest/optimize/timeline/etc).
    - Se apoya en tu sistema experto + base de conocimiento.
  - Fallas:
    - Renderiza HTML sin sanitizar.
    - Convierte precio USD→RD con tasa local; puede diferir de la tasa en el resumen (dos fuentes).

### Sugerencias IA
- [src/components/AISuggestions.tsx](src/components/AISuggestions.tsx)
  - Fallas:
    - “Procesa” contenido removiendo símbolos markdown aunque el contenido ya puede ser HTML; puede degradar formato.
    - El editor elimina tags con regex, perdiendo estructura.

### Gestión de módulos
- [src/components/ModuleManager.tsx](src/components/ModuleManager.tsx)
  - Bien: dialog para crear/editar.
  - Fallas:
    - Validación de precio con `parseInt` sin control de `NaN`.

- [src/components/ModuleCard.tsx](src/components/ModuleCard.tsx)
  - Bien: tarjeta clara; CTA directo.
  - Fallas UX:
    - Botones de editar/borrar aparecen con hover; en mobile puede ser inconsistente.
    - Falta mostrar “qué incluye” a nivel detalle (line-clamp recorta demasiado pronto para módulos complejos).

### Resumen
- [src/components/ProjectSummary.tsx](src/components/ProjectSummary.tsx)
  - Bien: estado vacío y total visible.
  - Fallas:
    - Falta breakdown (subtotal, impuestos, contingencia, fees, mantenimiento opcional).

### PDF
- [src/services/pdfService.ts](src/services/pdfService.ts)
- [src/components/PDFPreview.tsx](src/components/PDFPreview.tsx)
  - Bien: template profesional y editable.
  - Fallas:
    - Cronograma del PDF es estático (8 semanas), no se alinea con módulos reales.
    - Términos son genéricos; faltan exclusiones críticas para proteger alcance.

### Sistema experto (backend)
- [supabase/functions/expert-system/index.ts](supabase/functions/expert-system/index.ts)
  - Bien: usa knowledge base + módulos + precios + tipo de cambio.
  - Fallas:
    - Regla “usa EXACTAMENTE nombres del catálogo” es buena, pero falta un control de “módulo no existe” (validación).
    - Los `module-suggestion` se parsean por regex; ideal devolver JSON aparte.

---

## 6) Propuesta de UX/UI (sin inventar features innecesarias)

Objetivo: que el usuario llegue al PDF con **confianza**, no con “creo que está bien”.

### UX que falta hoy
- Falta un flujo de “completitud”: no sabes si la cotización está lista o le faltan piezas.
- Falta breakdown de costos (impuestos/fees/contingencia).
- Falta consistencia: dos IA con outputs distintos.

### Cambios de UX de alto impacto (P1)
- Unificar IA: dejar **una** (recomendado: sistema experto) y convertirla en “asistente de completitud”.
- Añadir un indicador de estado: “Cotización incompleta / revisada / lista para PDF”.
- Añadir un panel de “Supuestos y exclusiones” editable antes de PDF.

---

## 7) Roadmap por fases (prioridades)

### Fase 0 (P0) — seguridad y estabilidad
1) Mover llamadas IA del frontend a Supabase Functions; eliminar llaves del cliente.
2) Sanitizar HTML SIEMPRE antes de renderizar (especialmente asistente flotante).
3) Estandarizar sugerencias de módulos (JSON) y dejar de depender de regex HTML.
4) Corregir bug de precarga en ModuleCreator y robustecer importación JSON.

### Fase 1 (P1) — cotización “defendible”
1) Modelo de costos: subtotal + contingencia + ITBIS + fees (configurable).
2) Checklist de completitud (IA + reglas): marcar faltantes típicos.
3) Resumen con breakdown y notas de alcance.
4) PDF: cronograma y términos basados en módulos seleccionados.

### Fase 2 (P2) — UX premium y consistencia
1) IA como flujo guiado (preguntas clave) en vez de solo “acciones rápidas”.
2) Mejoras de información en tarjetas (detalle/expand) sin saturar.
3) Estándares de accesibilidad: contraste, foco, navegación teclado.

---

## 8) Definición de “cotización robusta” (criterio de listo)

Una cotización se considera “lista” cuando:
- Tiene cliente + tipo de proyecto + descripción breve.
- Tiene módulos seleccionados.
- Tiene breakdown: subtotal, contingencia, ITBIS/fees (si aplica), total.
- Tiene supuestos y exclusiones claras.
- Tiene timeline coherente con módulos.
- Tiene condiciones de pago y política de cambios.

---

## 9) Próximo paso recomendado (para que esto avance rápido)

Si estás de acuerdo, el siguiente sprint ideal sería:
- Eliminar Groq directo del frontend y usar solo `expert-system`.
- Agregar sanitización al asistente flotante.
- Cambiar respuesta del backend a: `{ contentHtml, moduleSuggestions: [{name, priceUsd, category, description?}] }` y renderizar sugerencias sin regex.

---

# Apéndice A — Análisis más grande: Sistema Experto retroalimentado (sin inventar datos)

Esta sección explica cómo convertir tu “sistema experto” en un sistema que **aprende de su propio uso**, pero de forma segura (sin auto-inventarse “verdades”).

## A.1 Principio central: retroalimentación ≠ auto-verdad

El sistema no debe “aprender” simplemente porque el modelo lo dijo. Un sistema experto útil se retroalimenta con:
- **Datos observables** (qué preguntas se hacen, qué cotizaciones se generan, qué módulos se repiten, en qué fallan).
- **Feedback humano** (marcar respuesta como útil/no útil y corregir errores).
- **Fuentes verificadas** (knowledge_base + price_research verificado).

La IA puede proponer, resumir, clasificar y detectar patrones; pero la “base de conocimiento” debe actualizarse con reglas de control.

## A.2 Qué ya tienes (muy bien encaminado)

En tu migración ya existe:
- `ai_inference_logs`: para registrar cada respuesta del sistema experto.
- `knowledge_base`: hechos/guías del mercado DO 2025.
- `price_research`: rangos verificables.
- `quotations`: cotizaciones guardadas con estado.

Y la función edge [supabase/functions/expert-system/index.ts](supabase/functions/expert-system/index.ts) ya:
- arma contexto desde DB,
- llama al modelo,
- guarda logs.

Eso es el 60% del sistema retroalimentado.

## A.3 Objetivo real: “auditor de completitud” + “memoria operacional”

El sistema experto debe ser:

1) **Auditor de completitud**
- Pregunta lo que falta (briefing mínimo) y etiqueta riesgos.
- Detecta costos olvidados típicos.
- Asegura que el PDF sea defendible (supuestos/exclusiones).

2) **Memoria operacional**
- Aprende de tus cotizaciones reales: qué módulos se agregan siempre, qué se olvida siempre, qué suele causar scope creep.

## A.4 Pipeline de retroalimentación (simple y robusto)

### Paso 1 — Logging completo por evento (ya lo haces)
Cada interacción importante debe producir un registro:
- Query a IA (`ai_inference_logs`): tipo, prompt resumido, output, tiempo, contexto usado.
- Acción del usuario: añadió módulo, removió módulo, generó PDF, guardó cotización.

Recomendación: crear una tabla adicional (ej. `quotation_events`) para eventos de UI, porque mezclar “chat logs” con “eventos de cotización” complica analítica.

### Paso 2 — Señales de calidad (feedback)
Agregar capacidades de feedback:
- En cada respuesta del sistema experto: “Útil / No útil” + comentario.
- En cada cotización: “Ganada / Perdida / Pendiente” + razón.

Eso alimenta:
- `ai_inference_logs.was_helpful`
- `ai_inference_logs.feedback`
- `quotations.status` (ya existe)

### Paso 3 — Job de resumen periódico (diario/semanal)
Un job (cron) que:
- agrupe logs por `query_type` y por “tipo de proyecto”.
- detecte patrones: preguntas más comunes, módulos más sugeridos, fallas recurrentes.
- genere “candidatos a conocimiento” (drafts).

Dónde correrlo:
- Supabase scheduled functions (si está disponible en tu plan).
- O un GitHub Action/cron externo que llama una edge function segura.

### Paso 4 — “Drafts de conocimiento” (no publicación automática)
Crear tabla sugerida: `knowledge_candidates`:
- `category`, `topic`, `content`, `source_log_ids`, `proposed_confidence`, `status` (draft/approved/rejected).

La IA puede llenar `content`, pero alguien (tú) aprueba.

### Paso 5 — Publicación controlada
Cuando apruebas un candidato:
- se inserta/actualiza en `knowledge_base`.
- se setea `last_verified`.
- se ajusta `confidence_score`.

## A.5 “Buscar, ver y sacar dato de lo que haga” (lo que pediste)

Esto se logra con 3 piezas:

1) **Historial consultable**
- UI mínima para buscar en `ai_inference_logs` por texto, tipo y fecha.
- UI mínima para ver `quotations` por estado.

2) **Extracción estructurada**
- El backend debe devolver campos estructurados además de HTML (ej. `missingItems[]`, `risks[]`, `assumptions[]`).
- El HTML queda solo para presentación.

3) **Analytics / insights**
- vistas agregadas:
  - “Top 10 costos olvidados”
  - “Top módulos agregados después del primer borrador”
  - “Tiempo promedio de proyecto por tipo”

## A.6 Guardrails para evitar que la IA “alucine”

Recomendación fuerte:
- Separar respuestas en dos capas:
  1) **Capa de hechos** (solo desde DB: knowledge_base/price_research/exchange_rates)
  2) **Capa de recomendación** (IA interpreta, pero debe citar “según KB interna…”)

Y reglas:
- Si falta data verificada, el sistema debe responder con: “No tengo dato verificado, propongo un rango tentativo y lo marco como NO verificado”.

## A.7 Migración de outputs a formato estructurado (clave)

Hoy se parsea HTML con regex.

Mejor diseño:
- El modelo devuelve un JSON “tool output” (o un bloque JSON al final) con:
  - `moduleSuggestions: [{name, priceUsd, category, reason, priority}]`
  - `missingCosts: [{label, impact, reason, suggestedModuleName?}]`
  - `assumptions: string[]`
  - `exclusions: string[]`

El backend valida:
- que `name` esté dentro del catálogo cuando aplica.
- que `priceUsd` sea número positivo.

La UI renderiza seguro, sin regex.

---

# Apéndice B — Módulo “Cotizaciones guardadas” (hechas vs pendientes)

Tu DB ya tiene `quotations.status` con default `draft`. Eso ya es “pendiente”.

## B.1 Estados recomendados (simples)
- `draft` = pendiente / en revisión
- `finalized` = finalizada (lista / enviada)

Opcional a futuro:
- `sent`, `won`, `lost` (si quieres embudo comercial)

## B.2 Funciones mínimas del módulo
- Guardar la cotización actual (cliente, proyecto, módulos, total RD/USD, tasa).
- Listar cotizaciones:
  - pestaña Pendientes (`draft`)
  - pestaña Finalizadas (`finalized`)
  - pestaña Todas
- Acciones por cotización:
  - Cargar en el cotizador
  - Cambiar estado
  - Eliminar

## B.3 Cómo se conecta con la retroalimentación
Cada vez que guardas o finalizas una cotización, puedes disparar un evento que se use para:
- detectar qué módulos se repiten por tipo de proyecto,
- detectar qué “faltantes” se agregan casi siempre,
- mejorar el checklist del auditor de completitud.


