# Validación — SPEC-009: Tasador ACM Interactivo, Testigos Homologados, Catastro 3D y Dossier de Captación

| Requisito / Tarea | Estado | Evidencia de Validación |
| :--- | :---: | :--- |
| **RF-ACM1:** Cálculo de valoración y testigos homologados | VERDE | `cmaValuator.ts` calcula valor central, metro cuadrado y 3 testigos comparables homologados por micro-zona. Testeado en `tests/test_cma_valuation_flow.test.ts`. |
| **RF-ACM2:** Horquilla de precios y ZOPA de negociación | VERDE | Generación de bandas de Venta Rápida (-5%), Cierre Notarial (mercado) y Salida Portales (+6%) con cálculo de varianza frente a expectativas del propietario. |
| **RF-ACM3:** Dotaciones peatonales y WalkScore | VERDE | Agrupación segura por categorías (`transporte`, `educacion`, `salud`, `zonas_verdes`) con tiempos isócronos a pie y Deep Links a Catastro 3D, Google Earth 3D y Satélite. |
| **RF-ACM4:** Generación de Dossier ACM maquetado | VERDE | Integración en `InteractiveCMA.tsx` con acción `handleGenerateDossierFromCMA` conectada al flujo del Director Broker en `src/app/page.tsx`. |
| **RF-ACM5:** Borrador Seguro Human-in-the-Loop | VERDE | `DraftApprovalModal` intercepta el dossier generado antes de cualquier descarga o envío al exterior, con previsualización completa y aprobación manual. |
| **RNF-1 / RNF-2:** Tipado y Compilación | VERDE | `npx tsc --noEmit` completado con 0 errores y compilación limpia. |
| **RNF-3:** Suite de Tests | VERDE | Suite completa pasando con 122/122 tests en verde (28 suites). |

