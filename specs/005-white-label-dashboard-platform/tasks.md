# Tareas de Implementación — Spec 005: Plataforma SaaS Unificada Marca Blanca

## Fase 1: Módulos Jurídicos y de Negocio (LPH, Postventa y Marca Blanca)
- [x] T1: Desarrollar el módulo de Finca Madre y solicitud oficial de certificado de saldo cero Art. 9.1.e LPH (`src/lib/legal/spain/communityLPH.ts`) (RF-WLD1, RF-WLD2).
- [x] T2: Desarrollar el módulo de postventa física para Acta de Entrega de Llaves, Lectura de Contadores (CUPS) y traspaso de suministros (`src/lib/legal/spain/handoverPostventa.ts`) (RF-WLD3, RF-WLD4).
- [x] T3: Desarrollar el modelo y almacén de configuración de Marca Blanca y gestión de equipo de 1 a 5 integrantes (`src/lib/branding/whiteLabel.ts`) (RF-WLD10, RNF-WLD1).

## Fase 2: Componentes Visuales del Dashboard Operativo
- [x] T4: Crear componentes de métricas y leads prioritarios de acción inmediata (`src/components/dashboard/MetricCards.tsx`, `PriorityLeadsWidget.tsx`) (RF-WLD5).
- [x] T5: Crear catálogo de propiedades con conmutador de vista cuadrícula/lista/mapa (`src/components/dashboard/PropertyCatalog.tsx`) (RF-WLD6).
- [x] T6: Crear tablero Kanban interactivo del Pipeline de 7 fases (`src/components/dashboard/InteractivePipeline.tsx`) (RF-WLD7).
- [x] T7: Crear interfaz visual del Tasador ACM interactivo con cálculo reactivo de 3 bandas y accesos 3D (`src/components/dashboard/InteractiveCMA.tsx`) (RF-WLD8).
- [x] T8: Crear estudio de redacción de contenidos IA multicanal (`src/components/dashboard/ContentStudioAI.tsx`) (RF-WLD9).
- [x] T9: Crear panel del módulo legal LPH y postventa física con generación 1-clic (`src/components/dashboard/LegalPostventaModule.tsx`) (RF-WLD2, RF-WLD3, RF-WLD4).
- [x] T10: Crear panel de configuración de Marca Blanca y gestión de equipo de hasta 5 agentes (`src/components/dashboard/WhiteLabelSettings.tsx`) (RF-WLD10).

## Fase 3: Integración en el Shell de Producción
- [x] T11: Refactorizar y ensamblar `src/app/page.tsx` para incorporar la navegación completa por pestañas, identidad corporativa configurable, integración del modal Human-in-the-Loop y Copiloto BROKER.

## Fase 4: Pruebas, Verificación y Despliegue
- [x] T12: Escribir tests unitarios para LPH, Postventa y Marca Blanca (`tests/test_community_lph.test.ts`, `tests/test_handover_postventa.test.ts`, `tests/test_white_label.test.ts`).
- [x] T13: Ejecutar suite de validación completa (`npx tsc --noEmit` y `npm test`).
- [ ] T14: Sincronizar en Git y desplegar en VPS Hostinger (`app.inmobia360.com`).
