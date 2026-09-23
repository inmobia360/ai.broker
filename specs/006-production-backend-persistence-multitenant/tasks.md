# Tareas de Implementación — Spec 006: Producción Backend y Adaptador Internacional

## Fase 1: Capa de Adaptación Internacional (Multi-País)
- [x] T1: Diseñar tipos e interfaz para `CountryAdapter` (`src/lib/country/types.ts`) (RF-P10).
- [x] T2: Desarrollar el adaptador para España (`src/lib/country/adapters/spain.ts`) y registro global (`src/lib/country/registry.ts`) (RF-P10, RF-P11).

## Fase 2: Esquema de Base de Datos y Repositorios con RLS
- [x] T3: Actualizar `src/lib/db/schema.sql` incorporando las tablas `properties`, `leads`, `pipeline_deals`, `agency_branding` y sus políticas RLS (RF-P1, RF-P2, RF-P3, RF-P4, RF-P5).
- [x] T4: Implementar repositorios de base de datos (`src/lib/db/repositories/`) para propiedades, leads, pipeline y marca con verificación estricta de `tenant_id` y límite de 5 plazas (RF-P5, RF-P6, RF-P7).

## Fase 3: APIs REST de Producción y Autenticación
- [x] T5: Crear endpoints CRUD de propiedades (`/api/properties/route.ts`) y leads (`/api/leads/route.ts`) (RF-P1, RF-P2).
- [x] T6: Crear endpoints de pipeline (`/api/pipeline/route.ts`) y marca blanca (`/api/settings/brand/route.ts`) (RF-P3, RF-P4).
- [x] T7: Implementar endpoints de autenticación y sesiones (`/api/auth/login/route.ts`, `/api/auth/me/route.ts`) (RF-P8).

## Fase 4: Frontend, Modal de Nueva Propiedad y Pantalla de Login
- [x] T8: Crear pantalla de Login corporativa (`src/app/login/page.tsx`) (RF-P9).
- [x] T9: Conectar el Dashboard en `src/app/page.tsx` con las APIs de persistencia y añadir modal funcional de creación de propiedad.

## Fase 5: Pruebas, Verificación y Despliegue
- [x] T10: Escribir suites de pruebas unitarias (`tests/test_country_adapter.test.ts`, `tests/test_persistence_properties.test.ts`, `tests/test_capacity_seats.test.ts`).
- [x] T11: Ejecutar verificación de tipos (`npx tsc --noEmit`) y suite de tests (`npm test`).

