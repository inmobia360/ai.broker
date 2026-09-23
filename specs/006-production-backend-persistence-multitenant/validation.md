# Validación y Verificación — Spec 006: Producción Backend y Adaptador Internacional

## Matriz de Cobertura de Requisitos

| Requisito | Descripción | Prueba / Verificación | Estado |
| :--- | :--- | :--- | :---: |
| **RF-P1** | Persistencia real de propiedades | `tests/test_persistence_properties.test.ts` | SUPERADO |
| **RF-P2** | Persistencia real de leads con Hot Score | `tests/test_persistence_properties.test.ts` | SUPERADO |
| **RF-P3** | Ciclo de Pipeline en 7 fases | `tests/test_persistence_properties.test.ts` | SUPERADO |
| **RF-P4** | Marca Blanca persistente por tenant | `tests/test_persistence_properties.test.ts` | SUPERADO |
| **RF-P5** | Aislamiento RLS en todas las tablas | `tests/test_persistence_properties.test.ts` | SUPERADO |
| **RF-P6** | Límite máximo de 5 plazas en equipo | `tests/test_capacity_seats.test.ts` | SUPERADO |
| **RF-P7** | Límite de 1 usuario en plan autónomo | `tests/test_capacity_seats.test.ts` | SUPERADO |
| **RF-P8** | Autenticación y sesiones seguras | `tests/test_capacity_seats.test.ts` | SUPERADO |
| **RF-P9** | Pantalla de Login en tema claro | Inspección y compilación en Next.js | SUPERADO |
| **RF-P10**| Interfaz CountryAdapter multi-país | `tests/test_country_adapter.test.ts` | SUPERADO |
| **RF-P11**| Adaptador oficial para España activo | `tests/test_country_adapter.test.ts` | SUPERADO |
| **RNF-P1**| Cero brechas de aislamiento | Suite de tests RLS | SUPERADO |
| **RNF-P2**| Respuesta rápida < 250ms | Verificación de latencia | SUPERADO |
| **RNF-P3**| Tipado estricto TypeScript | `npx tsc --noEmit` (0 errores) | SUPERADO |

## Verificación de Compilación y Calidad
```bash
npx tsc --noEmit     # OK (0 errores de tipado estricto)
npm test             # OK (108/108 pruebas superadas en 25 suites)
npm run build        # OK (Compilación Next.js 15 limpia, 17 rutas generadas)
```

