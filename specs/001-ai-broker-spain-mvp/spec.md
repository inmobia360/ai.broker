# AI Broker Spain MVP

## Alcance

Aplicación SaaS por invitación para gestión general de agencia, captación de propiedades y documentos/contratos. Incluye BROKER, subagentes, memoria privada por agencia, carga de archivos web/MCP y control de calidad.

## Requisitos iniciales

- Registro por invitación con correo/contraseña y OAuth de baja fricción.
- `tenant_id` obligatorio en todas las entidades y consultas (Row Level Security en PostgreSQL).
- Motor de Inteligencia Artificial: Ollama auto-alojado en el VPS de Hostinger para gestión de texto e inferencia privada con coste cero de tokens y máxima privacidad; conector agnóstico desacoplado con soporte para fallback a APIs externas (Gemini / OpenAI).
- Stack central: Next.js 15 (TypeScript, Tailwind CSS), PostgreSQL 16 + pgvector para datos relacionales y búsqueda semántica en memoria canónica.
- Tokens MCP privados, cifrados, revocables y nunca visibles en claro tras su creación.
- Documentos originales en almacenamiento privado; conocimiento versionable anonimizado.
- Conocimiento privado por defecto: `sharing_policy: private_by_default`.
- Stripe preparado pero inactivo durante la beta gratuita.
- Arquitectura de país extensible: `countries/spain/` primero.
- Flujo de despliegue: Desarrollo local -> GitHub (`inmobia360/ai.broker`) -> Despliegue en VPS Hostinger vía Docker Compose.

## Fuera de alcance beta

Cobros activos, publicación automática en portales, WhatsApp automatizado y módulos de otros países.

