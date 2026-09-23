# Plan de Arquitectura Técnica — Spec 005: Plataforma SaaS Unificada Marca Blanca

## Arquitectura de Componentes

```
src/
├── lib/
│   ├── legal/
│   │   └── spain/
│   │       ├── communityLPH.ts         # Modelo y generador de solicitud Certificado Art. 9.1.e LPH
│   │       └── handoverPostventa.ts    # Modelo y generador de Acta de Llaves y Lectura de Contadores
│   ├── branding/
│   │   └── whiteLabel.ts               # Tipos y almacén de configuración Marca Blanca (1-5 agentes)
│   └── valuation/                      # cmaValuator.ts (existente)
│   └── lifecycle/                      # dossierStateMachine.ts (existente)
├── components/
│   ├── DraftApprovalModal.tsx          # Modal existente de aprobación Human-in-the-Loop
│   └── dashboard/                      # Componentes desacoplados de la interfaz operativa
│       ├── MetricCards.tsx             # KPIs principales de cabecera
│       ├── PriorityLeadsWidget.tsx     # Leads calientes con botones de acción inmediata
│       ├── PropertyCatalog.tsx         # Catálogo interactivo (Tarjetas, Lista, Mapa)
│       ├── InteractivePipeline.tsx     # Tablero Kanban 7 Fases
│       ├── InteractiveCMA.tsx          # Formulario y visualización de Tasador ACM
│       ├── ContentStudioAI.tsx         # Estudio de redacción multicanal con IA
│       ├── LegalPostventaModule.tsx    # Generador LPH y Postventa física
│       └── WhiteLabelSettings.tsx      # Configuración de marca blanca y gestión de equipo (1-5)
└── app/
    └── page.tsx                        # Shell unificado con sidebar de navegación y responsive design
```

## Estructuras de Datos Clave

### 1. Finca Madre y Certificado LPH (`communityLPH.ts`)
```typescript
export interface CommunityLPHDetails {
  propertyAddress: string;
  cadastralReference?: string;
  cadastralCoefficient: number; // Porcentaje de cuota de participación
  monthlyOrdinaryFee: number;
  reserveFundContribution?: number; // Fondo de reserva Art. 9.1.f
  pendingDerramas: Array<{
    concept: string;
    totalAmount: number;
    monthlyFee: number;
    remainingMonths: number;
    approvedDate: string;
  }>;
  administrator: {
    name: string;
    collegeNumber?: string;
    email?: string;
    phone?: string;
  };
  presidentName?: string;
}
```

### 2. Postventa Física: Llaves y Contadores (`handoverPostventa.ts`)
```typescript
export interface KeyHandoverData {
  dossierId: string;
  propertyAddress: string;
  sellerName: string;
  buyerName: string;
  date: string;
  keysInventory: {
    mainDoorSets: number;
    portalSets: number;
    mailboxKeys: number;
    storageRoomKeys: number;
    garageRemotes: number;
    otherKeysDescription?: string;
  };
  utilityReadings: {
    electricity: { cups: string; readingKwh: number; company?: string };
    water: { meterNumber: string; readingM3: number; company?: string };
    gas?: { meterNumber: string; readingM3: number; cups?: string; company?: string };
  };
}
```

### 3. Marca Blanca y Equipo (`whiteLabel.ts`)
```typescript
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "broker_titular" | "agente_senior" | "agente_asociado" | "coordinador";
  phone: string;
  active: boolean;
}

export interface WhiteLabelConfig {
  tenantId: string;
  agencyName: string;
  brandSlogan: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  fiscalId: string; // CIF / NIF
  apiNumber?: string; // Colegiación API / AICAT
  contactEmail: string;
  contactPhone: string;
  address: string;
  team: TeamMember[]; // Máximo 5 integrantes
}
```
