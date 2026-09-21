# Plan Técnico 001 — AI Broker Spain MVP

## Arquitectura y Estructura de Módulos

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # RF-2: Rutas de autenticación e invitaciones
│   │   ├── chat/              # RF-4, RF-11, RF-12: Orquestación BROKER y conector Ollama
│   │   ├── dossiers/          # RF-5, RF-7: Gestor de borradores y aprobaciones humanas
│   │   └── legal/             # RF-8, RF-9, RF-10: Generador de contratos España
│   ├── (dashboard)/           # Interfaz de agencia, expedientes y revisión de borradores
│   └── layout.tsx
├── lib/
│   ├── ai/
│   │   ├── ollamaClient.ts    # RF-11: Cliente Ollama local en Hostinger
│   │   ├── fallbackClient.ts  # RF-12: Fallback cognitivo en caso de saturación
│   │   └── brokerDirector.ts  # RF-4: Orquestador central de subagentes
│   ├── db/
│   │   ├── client.ts          # Conexión PostgreSQL con RLS
│   │   ├── schema.sql         # Esquema de tablas relacionales y vectoriales
│   │   └── vectorStore.ts     # RF-13: Búsqueda vectorial pgvector aislada por tenant
│   ├── legal/
│   │   └── spain/             # Módulo normativo español
│   │       ├── arras.ts       # RF-8: Plantilla legal Art. 1454 Código Civil
│   │       ├── lau.ts         # RF-9: Plantilla legal Ley de Arrendamientos Urbanos
│   │       └── visita.ts      # RF-10: Parte de visita y pacto de honorarios
│   └── security/
│       ├── tenantContext.ts   # RF-1, RF-3: Extracción e inyección segura de tenant_id
│       └── draftGuard.ts      # RF-5, RF-6: Interceptor que impide envíos sin visto bueno
```

---

## Modelo de Datos (PostgreSQL 16 + pgvector)

```sql
-- Tabla de Organizaciones / Agencias (Tenants)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    agency_name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Usuarios con pertenencia obligatoria a un tenant
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(32) NOT NULL DEFAULT 'agent', -- 'director', 'agent'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Invitaciones pendientes de registro
CREATE TABLE invitations (
    token VARCHAR(128) PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'agent',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Expedientes de Inmuebles
CREATE TABLE dossiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    reference_code VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'reserved', 'sold', 'archived'
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documentos y Borradores (Modo Borrador Seguro)
CREATE TABLE drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dossier_id UUID REFERENCES dossiers(id) ON DELETE SET NULL,
    document_type VARCHAR(64) NOT NULL, -- 'arras', 'lau', 'visita', 'idealista_ad', 'whatsapp_reply'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft_pending', -- 'draft_pending', 'approved', 'rejected'
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    channel VARCHAR(32), -- 'whatsapp', 'email', 'pdf'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memoria Vectorial Canónica de la Agencia
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE agency_memory_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding vector(768), -- Embedding Ollama nomic-embed-text o bge-m3
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_memory_vectors ENABLE ROW LEVEL SECURITY;
```

---

## Decisiones Técnicas Justificadas (con alternativas descartadas)

| Decisión Técnica | Justificación | Alternativa Descartada y Motivo de Rechazo |
| :--- | :--- | :--- |
| **Ollama auto-alojado en VPS Hostinger para inferencia central** | Coste recurrente cero de tokens, latencia ultra-baja en servidor propio y confidencialidad absoluta de los expedientes sin transferir datos de clientes a terceros. | **Descartado: Dependencia exclusiva de OpenAI/Anthropic API.** Rechazada por el elevado coste mensual por agencia y el riesgo de fuga de datos o corte de servicio por límites de cuota externa. |
| **Row Level Security (RLS) en PostgreSQL 16 a nivel de base de datos** | El motor de la base de datos bloquea físicamente cualquier intento de leer registros de otro tenant, independientemente de errores que pudieran existir en el código de aplicación. | **Descartado: Filtrado manual por `WHERE tenant_id = ...` en consultas ORM.** Rechazado por alto riesgo de error humano (un solo desarrollador que olvide el `WHERE` expondría datos privados de otra agencia). |
| **Modo Borrador Seguro (Draft Guard) en capa de middleware** | Los endpoints de salida bloquean la emisión de datos al exterior si el estado del documento no es explícitamente `approved` con firma de usuario. | **Descartado: Envíos automáticos asistidos por IA con botón de cancelación posterior.** Rechazado porque un mensaje o contrato erróneo enviado automáticamente daña irreparablemente la reputación del agente ante el cliente. |
| **Next.js 15 App Router con TypeScript estricto** | Unificación del frontend moderno y las APIs de orquestación en un único repositorio tipado, permitiendo exportación híbrida (SaaS en VPS y landings estáticas de alto rendimiento). | **Descartado: Backend en Python FastAPI + Frontend React separado.** Rechazado para el MVP porque duplicaba la sobrecarga de mantenimiento, despliegue y sincronización de tipos para un equipo ágil. |
| **Módulo legal modular `countries/spain/`** | Aísla la normativa de Arras (Código Civil) y LAU del núcleo de la aplicación, permitiendo expandir la plataforma a otros países sin reescribir el core. | **Descartado: Hardcodear textos legales españoles dentro de las vistas.** Rechazado porque generaría deuda técnica inmanejable y bloquearía la internacionalización futura. |

---

## Estrategia de Tests

1. **Tests Unitarios**:
   - `test_tenant_guard.ts`: Valida que el middleware rechace peticiones sin tenant o con tenant adulterado (Cubre RF-1, RF-3).
   - `test_legal_spain.ts`: Valida que la generación de contratos de arras y alquiler contenga obligatoriamente las cláusulas legales y detecte campos faltantes sin alucinar datos (Cubre RF-8, RF-9, RF-10).
   - `test_draft_guard.ts`: Valida que ningún borrador en estado `draft_pending` pueda desencadenar una llamada a endpoints de envío exterior (Cubre RF-5, RF-6).
2. **Tests de Integración**:
   - `test_ollama_fallback.ts`: Simula caída de Ollama por timeout de 12s y comprueba la conmutación al fallback en menos de 100 ms (Cubre RF-11, RF-12).
   - `test_vector_isolation.ts`: Inserta vectores en el `tenant_A` y confirma que una búsqueda en el `tenant_B` devuelve 0 resultados (Cubre RF-13).

---

## Mapa de Cobertura de Requisitos Funcionales

- **RF-1, RF-3**: `lib/security/tenantContext.ts` + RLS en `lib/db/schema.sql`
- **RF-2**: `app/api/auth/invitation/route.ts`
- **RF-4**: `lib/ai/brokerDirector.ts`
- **RF-5, RF-6**: `lib/security/draftGuard.ts` + tabla `drafts`
- **RF-7**: Interfaz de aprobación en `app/(dashboard)/dossiers/[id]/page.tsx`
- **RF-8**: `lib/legal/spain/arras.ts`
- **RF-9**: `lib/legal/spain/lau.ts`
- **RF-10**: `lib/legal/spain/visita.ts`
- **RF-11**: `lib/ai/ollamaClient.ts`
- **RF-12**: `lib/ai/fallbackClient.ts`
- **RF-13**: `lib/db/vectorStore.ts`
