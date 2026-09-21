# AGENTS.md — AI BROKER

## Proyecto
Plataforma SaaS de Dirección de Agencia Inmobiliaria Autónoma con Inteligencia Artificial.
Un Director Broker coordina asistentes especializados para automatizar la carga administrativa de agentes independientes y pequeñas agencias (<5 agentes).
Arquitectura: Next.js 15 (App Router, TypeScript, Tailwind CSS), PostgreSQL 16 + pgvector, motor de inferencia Ollama auto-alojado en VPS Hostinger con fallback cognitivo agnóstico, y servidor MCP.

## Comandos
- Desarrollo local: `npm run dev`
- Compilación / Build: `npm run build`
- Verificación de tipos: `npx tsc --noEmit`
- Tests: `npm test`
- Lint: `npm run lint`
- Despliegue en contenedor: `docker-compose up -d --build`

## Estilo y convenciones
- TypeScript estricto con interfaces completas y tipado exhaustivo.
- Código, variables e identificadores de base de datos en inglés.
- Textos de interfaz, copys, contratos legales y mensajes al usuario en español peninsular impecable sin jerga robótica.
- Separación de capas: Lógica de negocio y modelos aislados de las interfaces de usuario.

## Reglas innegociables (Spec-Driven Development)
- Lee `docs/constitution.md`, `docs/sdd-workflow.md` y la spec activa en `specs/` antes de tocar código.
- La spec manda: ninguna funcionalidad se implementa si no está recogida como RF numerado en la spec aprobada.
- Aislamiento estricto por `tenant_id` en API, base de datos (RLS), memoria vectorial y almacenamiento.
- Modo Borrador Seguro (Human-in-the-Loop): los agentes de IA nunca envían mensajes ni documentos al exterior sin aprobación humana explícita.
- Los subagentes nunca interactúan directamente con el usuario ni escriben en memoria canónica; solo el Director BROKER orquesta y consolida.
- Cero secretos, PII ni documentos originales en Git.
- Si surge un nuevo requisito, NO toques código: actualiza primero la spec y valida el diff.

## Al terminar cualquier tarea
- Ejecuta la suite de verificación (`npx tsc --noEmit` y `npm test`).
- Marca la tarea con `[x]` en `specs/<id>/tasks.md`.
- Actualiza la fila correspondiente en `specs/<id>/validation.md`.
- Confirma en tu respuesta que los tests están en verde y PÁRATE (no avances a la siguiente tarea sin confirmación).
