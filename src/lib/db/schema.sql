-- ============================================================================
-- ESQUEMA DE BASE DE DATOS MULTI-TENANT CON ROW LEVEL SECURITY (RLS)
-- Proyecto: AI BROKER (inmobia360)
-- Requisitos Funcionales: RF-1 (Aislamiento), RF-3 (Control de acceso)
-- ============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Tabla de Organizaciones / Agencias (Tenants)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    agency_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'trial'
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Usuarios vinculados estrictamente a un tenant
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(128),
    role VARCHAR(32) NOT NULL DEFAULT 'agent', -- 'director', 'agent'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- 4. Invitaciones pendientes de registro
CREATE TABLE IF NOT EXISTS invitations (
    token VARCHAR(128) PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'agent',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Expedientes Inmobiliarios (Dossiers)
CREATE TABLE IF NOT EXISTS dossiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    reference_code VARCHAR(64),
    property_type VARCHAR(64) NOT NULL DEFAULT 'residential', -- 'flat', 'chalet', 'commercial', 'land'
    operation_type VARCHAR(32) NOT NULL DEFAULT 'sale', -- 'sale', 'rent'
    price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'reserved', 'sold', 'rented', 'archived'
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Documentos y Borradores (Modo Borrador Seguro)
CREATE TABLE IF NOT EXISTS drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dossier_id UUID REFERENCES dossiers(id) ON DELETE SET NULL,
    document_type VARCHAR(64) NOT NULL, -- 'arras', 'lau', 'visita', 'ad_portal', 'buyer_reply'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft_pending', -- 'draft_pending', 'approved', 'rejected'
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    channel VARCHAR(32), -- 'whatsapp', 'email', 'pdf'
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Memoria Vectorial Canónica de la Agencia
CREATE TABLE IF NOT EXISTS agency_memory_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding vector(768), -- Embedding Ollama (nomic-embed-text / bge-m3)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO Y FILTRADO POR TENANT
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant_id ON invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_tenant_id ON dossiers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_drafts_tenant_id ON drafts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agency_memory_vectors_tenant_id ON agency_memory_vectors(tenant_id);

-- ============================================================================
-- ACTIVACIÓN OBLIGATORIA DE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_memory_vectors ENABLE ROW LEVEL SECURITY;

-- Forzar RLS incluso para dueños de tablas en conexiones de aplicación
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE invitations FORCE ROW LEVEL SECURITY;
ALTER TABLE dossiers FORCE ROW LEVEL SECURITY;
ALTER TABLE drafts FORCE ROW LEVEL SECURITY;
ALTER TABLE agency_memory_vectors FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS DE AISLAMIENTO ESTRICTO POR TENANT (RLS)
-- Utilizan la variable de sesión 'app.current_tenant_id' inyectada por el servidor
-- ============================================================================

-- Política Users
DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- Política Invitations
DROP POLICY IF EXISTS tenant_isolation_invitations ON invitations;
CREATE POLICY tenant_isolation_invitations ON invitations
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- Política Dossiers
DROP POLICY IF EXISTS tenant_isolation_dossiers ON dossiers;
CREATE POLICY tenant_isolation_dossiers ON dossiers
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- Política Drafts (Modo Borrador Seguro)
DROP POLICY IF EXISTS tenant_isolation_drafts ON drafts;
CREATE POLICY tenant_isolation_drafts ON drafts
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- Política Agency Memory Vectors
DROP POLICY IF EXISTS tenant_isolation_vectors ON agency_memory_vectors;
CREATE POLICY tenant_isolation_vectors ON agency_memory_vectors
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
