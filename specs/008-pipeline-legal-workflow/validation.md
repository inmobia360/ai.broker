# Validación — SPEC-008: Conexión End-to-End: Lead Captado ➔ Pipeline ➔ Visita ➔ Arras

| Requisito / Tarea | Estado | Evidencia de Validación |
| :--- | :---: | :--- |
| **RF-PIPE1:** Gestión interactiva de fases del Pipeline | VERDE | Selector de fases directo, filtrado por etapas y avance de expedientes en `InteractivePipeline.tsx`. |
| **RF-VISITA:** Generación de Hoja de Visita legal | VERDE | Generación de Hoja de Visita con blindaje de honorarios (Art. 1255 C.C.) y RGPD validada en test unitario. |
| **RF-ARRAS:** Contrato de Arras Art. 1454 C.C. | VERDE | Redacción con señal penitencial del 10% y plazo notarial de 60 días validada en test unitario. |
| **RF-MODAL:** Borrador Seguro Human-in-the-Loop | VERDE | `DraftApprovalModal` conectado en `src/app/page.tsx` para leads y fases de pipeline antes de custodia o envío. |
| **RNF-1 / RNF-2:** Tipado y Compilación | VERDE | `npx tsc --noEmit` (0 errores) y `npm run build` completado exitosamente con 17 páginas estáticas y dinámicas. |
| **RNF-3:** Suite de Tests | VERDE | 116 tests pasando en 27 suites sin fallos (`tests/test_pipeline_legal_flow.test.ts`). |
