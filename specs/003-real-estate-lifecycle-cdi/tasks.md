# Tareas de Implementación — Spec 003: Motor de Expedientes y Emparejamiento Inverso

## Fase 1: Máquina de Estados del Expediente y Transiciones
- [x] T1: Definir los tipos de estado del ciclo de vida (`captacion`, `comercializacion`, `negociacion`, `cierre_comercial`, `cierre_documental`, `tramitacion_notarial`, `postventa`) y el gestor de ciclo de vida del expediente (`src/lib/lifecycle/dossierStateMachine.ts`) (RF-M1).
- [x] T2: Implementar el generador proactivo de borradores por hito (`src/lib/lifecycle/proactiveDraftGenerator.ts`), vinculando cada transición con su respectivo contrato o plantilla legal en estado `draft_pending` (RF-M2).

## Fase 2: Emparejamiento Inverso de Demanda (Matching Inteligente)
- [x] T3: Desarrollar el servicio de emparejamiento inverso semántico (`src/lib/matching/demandMatcher.ts`), cruzando oferta y demanda mediante similitud del coseno en `pgvector` con aislamiento RLS (RF-M3, RF-M4, RNF-M1).
- [x] T4: Crear generador de propuestas de comunicación personalizada para compradores afines seleccionados (RF-M4).

## Fase 3: Módulo de Negociación, Protocolo de Contingencias y Memoria Operativa
- [x] T5: Implementar el evaluador de banda de acuerdo y argumentario comercial (`src/lib/negotiation/dealRangeCalculator.ts`) (RF-M5, RF-M6).
- [x] T6: Implementar el auditor de contingencias registrales y catastrales (`src/lib/legal/spain/contingencyChecker.ts`) para alertar sobre cargas, hipotecas y discrepancias físicas/jurídicas (RF-M7).
- [x] T7: Implementar el módulo de memoria operativa estructurada y aprendizaje de casos (`src/lib/memory/operationalMemoryStore.ts`) con 4 categorías y recuperación RAG en `pgvector` (RF-M8).

## Fase 4: Integración en el Director BROKER y Verificación de Calidad
- [x] T8: Exponer comandos operativos en el Director BROKER (`/emparejar`, `/negociar`, `/contingencias`, `/memorizar`) y conectar con la interfaz del Dashboard.
- [x] T9: Escribir suite de pruebas automatizadas (`tests/test_dossier_lifecycle.test.ts`, `tests/test_demand_matching.test.ts`, `tests/test_negotiation_range.test.ts`, `tests/test_operational_memory.test.ts`).
- [x] T10: Ejecutar suites de verificación (`npx tsc --noEmit`, `npm test`, `npm run build`) y validar la trazabilidad.
