# Validación de Requisitos: 001-ai-broker-spain-mvp

Estado del hito: En definición y arranque técnico.

| Requisito | Estado | Método de Validación | Evidencia / Tests |
| :--- | :--- | :--- | :--- |
| Confirmación de Stack y Arquitectura | APROBADO | Validación explícita de usuario | Next.js 15 + Postgres pgvector + Ollama en Hostinger + Docker |
| Andamiaje Next.js y Tipado Estricto | APROBADO | `npx tsc --noEmit` y `npm run build` | Compilación de producción 100% exitosa sin errores de tipado |
| Conector Ollama (`llama3.1:8b`) | EN PROGRESO | Cliente en `src/lib/ollama.ts` | Soporta Basic/Bearer auth, endpoints de chat y healthcheck |
| Interfaz Marca Blanca y Flujo BROKER | EN PROGRESO | Dashboard en `src/app/page.tsx` | Chat con streaming, tarjetas de autorización humana (Principio 6) y vista de expedientes |
| Invitaciones y Auth | PENDIENTE | Tests unitarios y e2e de registro/login | Por implementar |
| Aislamiento tenant_id (RLS) | PENDIENTE | Tests de penetración e integridad multitenant | Por implementar |
| Gestor de Expedientes | PENDIENTE | Tests de ciclo de vida de casos inmobiliarios | Por implementar |
| Orquestación BROKER + Subagentes | PENDIENTE | Mocks de inferencia Ollama y flujos de aprobación | Por implementar |
| Documentos y Plantillas | PENDIENTE | Tests de carga privada y anonimización de PII | Por implementar |
| Memoria Privada | PENDIENTE | Búsqueda vectorial aislada por tenant | Por implementar |
| Servidor MCP y Tokens | PENDIENTE | Tests de ciclo de vida y revocación de tokens | Por implementar |
| Límites Freemium y Stripe Inactivo | PENDIENTE | Tests de flags de suscripción | Por implementar |

