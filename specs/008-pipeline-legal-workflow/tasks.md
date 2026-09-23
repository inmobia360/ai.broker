# Tasks — SPEC-008: Conexión End-to-End: Lead Captado ➔ Pipeline ➔ Visita ➔ Arras

- [x] T1: Conectar acciones de 1 clic en `PriorityLeadsWidget.tsx` para generar Hoja de Visita y Arras de forma directa.
- [x] T2: Añadir selector de fases y botón de generación documental en cada tarjeta de `InteractivePipeline.tsx`.
- [x] T3: Implementar modal o acción de conversión directa de Lead a Expediente de Pipeline.
- [x] T4: Enlazar la generación con `generateVisitSheet` y `generateArrasContract` en `src/app/page.tsx` activando el `DraftApprovalModal`.
- [x] T5: Crear suite de tests automatizados para el flujo de conversión legal (`tests/test_pipeline_legal_flow.test.ts`).
- [x] T6: Ejecutar verificación de tipos (`npx tsc --noEmit`), tests (`npm test`) y build (`npm run build`).
