# Tareas de Implementación — Spec 004: Prevaloración Rápida (ACM) y Micro-Zona

## Fase 1: Análisis de Micro-Zona y Enlaces de Entorno 3D
- [x] T1: Implementar el analizador de barrio y dotaciones (`src/lib/geo/neighborhoodAnalyzer.ts`) con cálculo de distancias a pie (RF-CMA1).
- [x] T2: Implementar el generador de enlaces profundos 3D y satelitales (`src/lib/geo/deepLinkGenerator.ts`) para Google Earth / Catastro (RF-CMA5).

## Fase 2: Motor de Prevaloración Rápida (ACM)
- [x] T3: Desarrollar el calculador de valoración comparativa de mercado (`src/lib/valuation/cmaValuator.ts`), horquilla de precios m² y banda de cierre (RF-CMA2).
- [x] T4: Implementar la generación del Dossier de Prevaloración en modo Borrador Seguro (`draft_pending`) (RF-CMA3).

## Fase 3: Copys Publicitarios y Comandos del Director BROKER
- [x] T5: Crear el generador de textos comerciales para portales inmobiliarios (`src/lib/marketing/listingCopyGenerator.ts`) con dotaciones integradas (RF-CMA4).
- [x] T6: Registrar los comandos operativos `/tasar`, `/entorno` y `/anuncio` en el Director BROKER (`src/lib/ai/brokerDirector.ts`).

## Fase 4: Verificación y Calidad
- [x] T7: Escribir suite de pruebas unitarias (`tests/test_neighborhood_analyzer.test.ts`, `tests/test_cma_valuation.test.ts`, `tests/test_deep_link_generator.test.ts`).
- [x] T8: Ejecutar verificación integral (`npx tsc --noEmit`, `npm test`, `npm run build`) y validar cobertura.
