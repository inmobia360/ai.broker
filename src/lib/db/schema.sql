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

-- 8. Propiedades Inmobiliarias de la Cartera
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    location VARCHAR(255) NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    built_area_m2 NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    operation_type VARCHAR(32) NOT NULL DEFAULT 'sale', -- 'sale', 'rent'
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'reserved', 'sold', 'rented'
    cadastral_reference VARCHAR(64),
    walkscore INTEGER NOT NULL DEFAULT 85,
    highlights TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Leads y Demandas Comerciales
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    intent_type VARCHAR(32) NOT NULL DEFAULT 'buy', -- 'buy', 'rent', 'invest'
    location_preference VARCHAR(128) NOT NULL,
    budget NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    timeframe VARCHAR(64) NOT NULL DEFAULT 'Ahora',
    demand_quote TEXT NOT NULL,
    hot_score INTEGER NOT NULL DEFAULT 50, -- 0-100
    recommended_action TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'new', -- 'new', 'in_progress', 'scheduled', 'archived'
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Pipeline de Operaciones (7 Fases)
CREATE TABLE IF NOT EXISTS pipeline_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    stage VARCHAR(32) NOT NULL DEFAULT 'captacion', -- 'captacion', 'valoracion', 'comercializacion', 'visitas', 'negociacion', 'arras', 'postventa_cierre'
    deal_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 3.00,
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Configuración de Marca Blanca y Cupo de Asientos
CREATE TABLE IF NOT EXISTS agency_branding (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    agency_name VARCHAR(128) NOT NULL,
    tagline VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(16) NOT NULL DEFAULT '#1e3a8a',
    accent_color VARCHAR(16) NOT NULL DEFAULT '#f97316',
    tax_id VARCHAR(32),
    association_number VARCHAR(64),
    support_phone VARCHAR(32),
    support_email VARCHAR(255),
    country_code VARCHAR(8) NOT NULL DEFAULT 'ES',
    max_team_seats INTEGER NOT NULL DEFAULT 5, -- 1 para autónomo, hasta 5 para agencia boutique
    plan_type VARCHAR(32) NOT NULL DEFAULT 'boutique', -- 'solo', 'boutique'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO Y FILTRADO POR TENANT
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant_id ON invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_tenant_id ON dossiers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_drafts_tenant_id ON drafts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agency_memory_vectors_tenant_id ON agency_memory_vectors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_properties_tenant_id ON properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_deals_tenant_id ON pipeline_deals(tenant_id);

-- ============================================================================
-- ACTIVACIÓN OBLIGATORIA DE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_memory_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_branding ENABLE ROW LEVEL SECURITY;

-- Forzar RLS incluso para dueños de tablas en conexiones de aplicación
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE invitations FORCE ROW LEVEL SECURITY;
ALTER TABLE dossiers FORCE ROW LEVEL SECURITY;
ALTER TABLE drafts FORCE ROW LEVEL SECURITY;
ALTER TABLE agency_memory_vectors FORCE ROW LEVEL SECURITY;
ALTER TABLE properties FORCE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;
ALTER TABLE pipeline_deals FORCE ROW LEVEL SECURITY;
ALTER TABLE agency_branding FORCE ROW LEVEL SECURITY;

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

-- Política Properties
DROP POLICY IF EXISTS tenant_isolation_properties ON properties;
CREATE POLICY tenant_isolation_properties ON properties
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- Política Leads
DROP POLICY IF EXISTS tenant_isolation_leads ON leads;
CREATE POLICY tenant_isolation_leads ON leads
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- Política Pipeline Deals
DROP POLICY IF EXISTS tenant_isolation_pipeline ON pipeline_deals;
CREATE POLICY tenant_isolation_pipeline ON pipeline_deals
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- Política Agency Branding
DROP POLICY IF EXISTS tenant_isolation_branding ON agency_branding;
CREATE POLICY tenant_isolation_branding ON agency_branding
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

