# Tasks — SPEC-009: Tasador ACM Interactivo, Testigos Homologados, Catastro 3D y Dossier de Captación

- [ ] T1: Corregir y enriquecer `InteractiveCMA.tsx` para cálculo reactivo asíncrono, renderizado fiel de dotaciones y testigos homologados.
- [ ] T2: Añadir generador del Dossier ACM oficial maquetado (`generateCmaDossier`) con datos de marca blanca del agente, tabla de testigos y enlaces 3D.
- [ ] T3: Conectar la acción *"Generar Dossier de Captación"* en `InteractiveCMA.tsx` con el modal `DraftApprovalModal` en `src/app/page.tsx`.
- [ ] T4: Conectar botón de acción *"Prevalorar ACM"* en el catálogo de propiedades (`PropertyCatalog.tsx`) para cargar los datos del inmueble directamente en el tasador.
- [ ] T5: Crear suite de tests automatizados (`tests/test_cma_valuation_flow.test.ts`) validando cálculos de ZOPA, testigos, WalkScore y generación del dossier.
- [ ] T6: Ejecutar suite de verificación (`npx tsc --noEmit`, `npm test` y `npm run build`).
